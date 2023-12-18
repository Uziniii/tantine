import { View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FText } from "../Components/FText";
import { ProfilePictureContainer } from "./css/user.css";
import { FontAwesome } from "@expo/vector-icons"
import { langData } from "../data/lang/lang";
import { NavigationProp, useRoute } from "@react-navigation/native";
import styled from 'styled-components/native';
import { useEffect, useLayoutEffect, useState } from "react";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { trpc } from "../utils/trpc";
import { isKeyboard } from "../hooks/isKeyboard";
import { addCommunityTempMessage, addManyCommunityMessages, initCommunityMessages } from "../store/slices/communityMessagesSlice";
import Loading from "../Components/Loading";
import { GiftedChat, SystemMessage } from "react-native-gifted-chat";
import { MessageText } from "../Components/GiftedChat/MessageText";
import Bubble from "../Components/GiftedChat/Bubble";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import RecordVoiceMessage from "../Components/RecordVoiceMessage";
import { Message } from "../store/slices/messagesSlice";

const SendChatContainer = styled.View`
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

interface Props {
  navigation: NavigationProp<any>
}

export default function Community ({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].community)
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  console.log(navigation.getState());

  const [close, setClose] = useState(true)
  const [input, setInput] = useState("")
  const [canLoad, setCanLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const me = useAppSelector(state => state.me)
  const users = useAppSelector(state => state.users)
  const isKeyboardShow = isKeyboard()
  const retrieveMessages = trpc.channel.message.retrieveCommunityMessage.useMutation({
    onSuccess(data, variables) {
      if (variables !== undefined) return

      dispatch(initCommunityMessages(data.map(message => ({
          id: message.id,
          authorId: message.authorId,
          content: message.content,
          audioFile: message.audioFile,
          createdAt: message.createdAt.toString(),
          updatedAt: message.updatedAt.toString(),
          system: message.system,
          invite: message.invite,
        })),
      ))
    },
  })

  // useEffect(() => {
  //   dispatch(clearNotifications(+route.params.id))
  // }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "#24252D",
      },
      headerTitle() {
        return <FText
          font={[Montserrat_700Bold, "Montserrat_700Bold"]}
          $size={"20px"}
          $color="white"
        >
          {lang.title}
        </FText>
      },
    })
  }, [])

  let sendMessage = trpc.channel.message.createCommunityMessage.useMutation()

  const msgState = useAppSelector(state => {
    console.log(state.communityMessages);
    
    if (!state.communityMessages.init) return undefined

    return state.communityMessages.position.map(
      x => {
        return state.communityMessages.messages[x] ? state.communityMessages.messages[x] : state.communityMessages.temp[x]
      }
    ).filter(x => x !== undefined)
  })

  useEffect(() => {
    if (msgState || retrieveMessages.isLoading) return

    retrieveMessages.mutate()
  })

  if (retrieveMessages.status === "loading") return <Loading />

  const onSend = (content: string) => {
    if (content.length === 0) {
      return
    }

    setInput("")

    const now = new Date()
    const nonce = now.getTime() + Math.random()

    dispatch(addCommunityTempMessage({
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
      content: content,
      nonce,
    })
  }

  return <Wrapper>
    <GiftedChat
      renderSystemMessage={(props) => {
        if (!props.currentMessage) return null

        return <SystemMessage
          containerStyle={props.wrapperStyle}
          textStyle={props.textStyle}
          currentMessage={props.currentMessage}
        />
      }}
      renderMessageText={(props) => {
        return <MessageText
          textProps={props.textProps}
          textStyle={props.textStyle}
          currentMessage={props.currentMessage}
        />
      }}
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

        return <Bubble color={colors[sumChars % colors.length]} {...props} />
      }}
      renderInputToolbar={(props) => {
        return <InputContainer>
          <SendChatContainer>
            <SearchInput
              multiline
              $width="76%"
              style={{ height: 40 }}
              placeholderTextColor={"white"}
              placeholder="Envoyer un message"
              value={input}
              onChangeText={setInput}
            />
            <ContainerButtonSend onPress={() => onSend(input)}>
              <FontAwesome size={20} color="#707179" name="send" />
            </ContainerButtonSend>
          </SendChatContainer>
          <RecordVoiceMessage channelId={"community"} />
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
        const messages = await retrieveMessages.mutateAsync(msgState?.at(-1)?.id)

        if (messages.length === 0) return setCanLoad(false)

        dispatch(addManyCommunityMessages(
          messages.map(message => ({
            id: message.id,
            authorId: message.authorId,
            content: message.content,
            audioFile: message.audioFile,
            createdAt: message.createdAt.toString(),
            updatedAt: message.updatedAt.toString(),
            system: message.system,
            invite: message.invite,
          })),
        ))
        setIsLoading(false)
      }}
      user={{
        _id: me?.id || 1,
      }}
      timeFormat="HH:mm"
      renderUsernameOnMessage={true}
    />
    {/* {!close && <Invite onClose={() => setClose(true)} onJoinPress={() => null} />} */}
    <View style={{ width: "100%", height: isKeyboardShow ? 0 : 32, backgroundColor: "#24252D" }}></View>
  </Wrapper>
}
