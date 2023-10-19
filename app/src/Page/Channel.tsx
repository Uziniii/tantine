import { NavigationProp, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { ProfilePictureContainer } from "./css/user.css";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons'; 
import styled from "styled-components/native"
import { useAppDispatch, useAppSelector } from "../store/store";
import { trpc } from "../utils/trpc";
import { GiftedChat } from "react-native-gifted-chat";
import { initMessages } from "../store/slices/messagesSlice";

interface Props {
  navigation: NavigationProp<any>
}

const TitleContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
`

export default function Channel ({ navigation }: Props) {  
  const dispatch = useAppDispatch()
  const route = useRoute<{params: { id: string }, key: string, name: string}>()
  const title = useAppSelector(state => {
    const channel = state.channels[route.params.id]
    
    if (channel.type === "group") {
      return channel.title
    }

    const user = state.users[channel.users.find(id => id !== state.me?.id) as unknown as string]

    return `${user.surname} ${user.name}`
  })
  const me = useAppSelector(state => state.me)
  const [isKeyboardShow, setIsKeyboardShow] = useState(false)
  const retrieveMessages = trpc.channel.message.retrieveMessages.useMutation({
    onSuccess(data, variables) {
      dispatch(initMessages({
        channelId: variables.channelId,
        messages: data.map(message => ({
          id: message.id,
          authorId: message.authorId,
          content: message.content,
          createdAt: message.createdAt.toString(),
          updatedAt: message.updatedAt.toString(),
        })),
      }))
    },
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle() {
        return <TitleContainer>
          <ProfilePictureContainer {...{$size: "36px"}}>
            <FontAwesome name="user" size={20} />
          </ProfilePictureContainer>
          <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {title}
          </FText>
        </TitleContainer>
      },
    })
  }, [])

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => {
      setIsKeyboardShow(true)
    })

    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardShow(false)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  })

  let sendMessage = trpc.channel.message.create.useMutation()

  const msgState = useAppSelector(state => {
    const channel = state.messages[+route.params.id]

    if (!channel) return undefined

    return channel.position.map(
      x => channel.messages[x]
    )
  })

  useEffect(() => {
    if (msgState) return

    retrieveMessages.mutate({
      channelId: +route.params.id,
    })
  })

  const onSend = (content: string, createdAt: Date | number) => {
    if (content.length === 0) {
      return
    }

    const nonce = Date.now() + Math.random()

    sendMessage.mutate({
      channelId: route.params.id,
      content: content,
      nonce,
    })
  }

  return <>
    <GiftedChat
      messages={msgState?.map(message => ({
        _id: message.id.toString(),
        received: true,
        text: message.content,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.authorId,
        },
      })) || []}
      onSend={(message) => onSend(message[0].text, message[0].createdAt)}
      user={{
        _id: me?.id || 1,
      }}
      timeFormat="HH:mm"
    />
    <View style={{ width: "100%", height: isKeyboardShow ? 0 : 32, backgroundColor: "white" }}></View>
  </>
}
