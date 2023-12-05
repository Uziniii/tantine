import { NavigationProp, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, View } from "react-native";
import { ProfilePictureContainer } from "./css/user.css";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import styled from "styled-components/native"
import { useAppDispatch, useAppSelector } from "../store/store";
import { trpc } from "../utils/trpc";
import { GiftedChat } from "react-native-gifted-chat";
import { Message, addManyMessages, addTempMessage, initMessages } from "../store/slices/messagesSlice";
import { isKeyboard } from "../hooks/isKeyboard";
import Bubble from "../Components/GiftedChat/Bubble";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Loading from "../Components/Loading";
import { clearNotifications } from "../store/slices/notificationSlice";
import { langData, replace } from "../data/lang/lang";
import RecordVoiceMessage from "../Components/RecordVoiceMessage";
import { addChannel } from "../store/slices/channelsSlice";
import Invite from "../Components/Search/InvitGroup";
import { MessageText } from "../Components/GiftedChat/MessageText";
import Carousel from "../Components/Carousel";

interface Props {
  navigation: NavigationProp<any>
}

const SendChatContaier = styled.View`
  display:flex;
  flex-direction: row;
  align-items: center;
`;

const SearchInput = styled.TextInput<{
  $width: string
}>`
  height: 80px;
  width: ${props => props.$width ?? "250px"};
  padding: 10px 5px 10px 20px;
  border-radius: 50px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background-color: #333541;
  color: white;
  align-self: center;
`;

const ContainerButtonSend = styled(TouchableWithoutFeedback)`
  height: 40px;
  width: 40px;
  background-color:#333541;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px 0 0;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
`;

const TitleContainer = styled(TouchableWithoutFeedback)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
`

const Wrapper = styled.View`
  flex: 1;
  background-color:#24252D;
`

const InputContainer = styled.View`
  /* border: 0px solid #333541;
  border-top-width: 1px; */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 14px;
  /* margin-bottom: 16px; */
  justify-content: space-between;
`

function isMessageSystem(message: Message): message is Message & { system: true } {
  return Boolean(message.system)
}

export default function Channel ({ navigation }: Props) {  
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].channel)
  const route = useRoute<{params: { id: string }, key: string, name: string}>()
  const [title, lookupId] = useAppSelector(state => {
    const channel = state.channels[route.params.id]
    
    if (channel === undefined) return [undefined, undefined]
    if (channel.type === "group") {
      return [channel.title, channel.id]
    }

    const user = state.users[channel.users.find(id => id !== state.me?.id) as unknown as string]

    return [`${user.surname} ${user.name}`, user.id]
  })

  const [close, setClose] = useState(true)
  const [input, setInput] = useState("")
  const [canLoad, setCanLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const channels = useAppSelector(state => state.channels)
  const type = useAppSelector(state => state.channels[route.params.id]?.type)
  const me = useAppSelector(state => state.me)
  const users = useAppSelector(state => state.users)
  const isKeyboardShow = isKeyboard()
  const retrieveMessages = trpc.channel.message.retrieveMessages.useMutation({
    onSuccess(data, variables) {
      if (variables.beforeId !== undefined) return

      dispatch(initMessages({
        channelId: +variables.channelId,
        messages: data.map(message => ({
          id: message.id,
          authorId: message.authorId,
          content: message.content,
          audioFile: message.audioFile,
          createdAt: message.createdAt.toString(),
          updatedAt: message.updatedAt.toString(),
          system: message.system,
          invite: message.invite,
          carousel: message.carousel,
        })),
      }))
    },
  })

  const join = trpc.channel.group.join.useMutation({
    onSuccess(data) {
      if (data.group === null) return

      dispatch(addChannel({
        id: data.id,
        title: data.group.title,
        description: data.group.description,
        admins: data.group.Admin.map(admin => admin.id),
        authorId: data.group.authorId,
        visibility: data.group.visibility,
        type: "group",
        users: data.users.map(user => user.id),
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

  useEffect(() => {
    dispatch(clearNotifications(+route.params.id))
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "#24252D",
      },
      headerTitle() {
        return <TitleContainer onPress={onTitlePress}>
          <ProfilePictureContainer $size="36px">
            <FontAwesome name={type === "private" ? "user" : "group"} size={20} />
          </ProfilePictureContainer>
          <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"20px"}
            $color="white"
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
    if (msgState || retrieveMessages.isLoading) return

    retrieveMessages.mutate({
      channelId: +route.params.id,
    })
  })

  if (title === undefined && lookupId === undefined) return null
  if (retrieveMessages.status === "loading") return <Loading />

  const onSend = (content: string) => {
    if (content.length === 0) {
      return
    }

    setInput("")

    const now = new Date()
    const nonce = now.getTime() + Math.random()

    dispatch(addTempMessage({
      channelId: +route.params.id,
      message: {
        id: nonce,
        
        authorId: me?.id as number,
        content,
        createdAt: now.toString(),
        updatedAt: now.toString(),
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

  return <Wrapper>
    <GiftedChat
      renderSystemMessage={(props) => {
        return <Carousel/>
        return <View style={{width: "90%", alignSelf: 'center', marginTop: 30, marginBottom: 30, height: 100, backgroundColor: "red"}}></View>
      }}
      renderMessageText={(props) => {
        return <MessageText
          textProps={props.textProps}
          textStyle={props.textStyle}
          currentMessage={props.currentMessage}
        />
      }}
      renderBubble={(props) => {
        if (true) {
          
        }

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

        interface GroupInfo {
          id: number;
          title: string;
          visibility: number;
        }

        (props as any).onJoinPress = (groupInfo: GroupInfo | null) => {
          if (groupInfo === null) return;

          if (channels[groupInfo.id] !== undefined) {
            Alert.alert(lang.alreadyInThisGroupAlertTitle)

            return
          }

          // public
          if (groupInfo.visibility === 0) {
            Alert.alert(lang.publicJoin.title, replace(lang.publicJoin.message, groupInfo.title), [
              {
                text: lang.publicJoin.cancel,
                style: "cancel",
              },
              {
                text: lang.publicJoin.join,
                async onPress() {
                  await join.mutateAsync(groupInfo.id)
                },
              },
            ])

            return
          }

          Alert.alert(lang.privateJoin.title, replace(lang.privateJoin.message, groupInfo.title), [
            {
              text: lang.privateJoin.cancel,
              style: "cancel",
            },
            {
              text: lang.privateJoin.send,
              onPress: () => {
                setClose(false)
              },
            },
          ])
        }

        return <Bubble color={colors[sumChars % colors.length]} {...props}/>
      }}
      renderInputToolbar={(props) => {
        return <InputContainer>
          <SendChatContaier>
            <SearchInput
              multiline 
              $width="76%"
              style={{height:40}} 
              placeholderTextColor={"white"} 
              placeholder="Envoyer un message"
              value={input}
              onChangeText={setInput}
            />
            <ContainerButtonSend onPress={() => onSend(input)}>
              <FontAwesome size={20} color="#707179" name="send"/>
            </ContainerButtonSend>
          </SendChatContaier>
          <RecordVoiceMessage channelId={route.params.id}/>
        </InputContainer>
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
          text: message.content || " ",
          invite: message.invite,
          audioFile: message.audioFile,
          channelId: route.params.id,
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
      isLoadingEarlier={isLoading}
      loadEarlier={canLoad}
      onLoadEarlier={async () => {
        setIsLoading(true)
        const messages = await retrieveMessages.mutateAsync({
          channelId: +route.params.id,
          beforeId: msgState?.at(-1)?.id,
        })

        if (messages.length === 0) return setCanLoad(false)
        
        dispatch(addManyMessages({
          channelId: +route.params.id,
          messages: messages.map(message => ({
            id: message.id,
            authorId: message.authorId,
            content: message.content,
            audioFile: message.audioFile,
            createdAt: message.createdAt.toString(),
            updatedAt: message.updatedAt.toString(),
            system: message.system,
            invite: message.invite,
          })),
        }))
        setIsLoading(false)
      }}
      user={{
        _id: me?.id || 1,
      }}
      timeFormat="HH:mm"
      renderUsernameOnMessage={true}
      
    />
    {!close && <Invite onClose={() => setClose(true)} onJoinPress={() => null} />}
    <View style={{ width: "100%", height: isKeyboardShow ? 0 : 32, backgroundColor: "#24252D" }}></View>
  </Wrapper>
}
