import { NavigationProp, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect } from "react";
import { View } from "react-native";
import { ProfilePictureContainer } from "./css/user.css";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons'; 
import styled from "styled-components/native"
import { useAppDispatch, useAppSelector } from "../store/store";
import { trpc } from "../utils/trpc";
import { GiftedChat } from "react-native-gifted-chat";
import { Message, addTempMessage, initMessages } from "../store/slices/messagesSlice";
import { isKeyboard } from "../hooks/isKeyboard";
import Bubble from "../Components/Bubble";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Props {
  navigation: NavigationProp<any>
}

const TitleContainer = styled(TouchableWithoutFeedback)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
`

function isMessageSystem(message: Message): message is Message & { system: true } {
  return Boolean(message.system)
}

export default function Channel ({ navigation }: Props) {  
  const dispatch = useAppDispatch()
  const route = useRoute<{params: { id: string }, key: string, name: string}>()
  const [title, lookupId] = useAppSelector(state => {
    const channel = state.channels[route.params.id]
    
    if (channel.type === "group") {
      return [channel.title, channel.id]
    }

    const user = state.users[channel.users.find(id => id !== state.me?.id) as unknown as string]

    return [`${user.surname} ${user.name}`, user.id]
  })
  const type = useAppSelector(state => state.channels[route.params.id].type)
  const me = useAppSelector(state => state.me)
  const users = useAppSelector(state => state.users)
  const isKeyboardShow = isKeyboard()
  const retrieveMessages = trpc.channel.message.retrieveMessages.useMutation({
    onSuccess(data, variables) {
      dispatch(initMessages({
        channelId: +variables.channelId,
        messages: data.map(message => ({
          id: message.id,
          authorId: message.authorId,
          content: message.content,
          createdAt: message.createdAt.toString(),
          updatedAt: message.updatedAt.toString(),
          system: message.system,
        })),
      }))
    },
  })

  const onTitlePress = () => {
    if (type === "group") {
      navigation.navigate("groupLookup", {
        id: lookupId,
      })
    } else {
      navigation.navigate("userLookup", {
        id: lookupId,
      })
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#1C202C'
      },
      headerTitle() {
        return <TitleContainer onPress={onTitlePress}>
          <ProfilePictureContainer $size="36px">
            <FontAwesome name={type === "private" ? "user" : "group"} size={20} />
          </ProfilePictureContainer>
          <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
            $color="#FFF"
          >
            {title}
          </FText>
        </TitleContainer>
      },
    })
  }, [])

  let sendMessage = trpc.channel.message.create.useMutation()

  const msgState = useAppSelector(state => {
    const channel = state.messages[+route.params.id]

    if (!channel) return undefined

    return channel.position.map(
      x => {
        return channel.messages[x] ? channel.messages[x] : channel.temp[x]
      }
    ).filter(x => x !== undefined)
  })

  useEffect(() => {
    if (msgState) return

    retrieveMessages.mutate({
      channelId: +route.params.id,
    })
  })

  if (retrieveMessages.status === "loading") return null

  const onSend = (content: string, createdAt: Date | number) => {
    if (content.length === 0) {
      return
    }

    const nonce = Date.now() + Math.random()

    dispatch(addTempMessage({
      channelId: +route.params.id,
      message: {
        id: nonce,
        authorId: me?.id as number,
        content,
        createdAt: createdAt.toString(),
        updatedAt: createdAt.toString(),
        system: false,
        nonce: nonce,
      },
      nonce: nonce,
    }))

    sendMessage.mutate({
      channelId: route.params.id,
      content: content,
      nonce,
    })
  }

  return <>
    <GiftedChat
      renderBubble={(props) => {
        let sumChars = 0;
        if (props.position === "left") {
          let username = props.currentMessage?.user?.name as string

          for (let i = 0; i < username.length; i++) {
            sumChars += username.charCodeAt(i);
          }
        }
        
        const colors = [
          '#DFF0D8',
          '#E6E6E6',
        ];

        return <Bubble color={colors[sumChars % colors.length]} {...props}/>
      }}
      messages={msgState?.map(message => {
        if (isMessageSystem(message)) {
          return {
            _id: message.id.toString(),
            received: true,
            text: message.content,
            createdAt: new Date(message.createdAt),
            user: {
              _id: 1,
            },
            system: message.system,
          }
        }

        return {
          _id: message.id.toString(),
          received: message.nonce !== undefined ? false : true,
          text: message.content,
          createdAt: new Date(message.createdAt),
          user: {
            _id: message.authorId as number,
            name: users[message.authorId as number].name,
            avatar() {
              return <ProfilePictureContainer $size="26px">
                <FontAwesome name="user" size={16} />
              </ProfilePictureContainer>
            },
          },
        }
      }) || []}
      onSend={(message) => onSend(message[0].text, message[0].createdAt)}
      user={{
        _id: me?.id || 1,
      }}
      timeFormat="HH:mm"
      renderUsernameOnMessage={true}
    />
    <View style={{ width: "100%", height: isKeyboardShow ? 0 : 32, backgroundColor: "white" }}></View>
  </>
}
