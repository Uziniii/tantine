import { NavigationProp, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { ProfilePictureContainer } from "./css/user.css";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons'; 
import styled from "styled-components/native"
import { useAppSelector } from "../store/store";
import { trpc } from "../utils/trpc";
import { GiftedChat } from "react-native-gifted-chat";

interface Props {
  navigation: NavigationProp<any>
}

const TitleContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
`

const InputContainer = styled(KeyboardAvoidingView)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  position: absolute;
  bottom: 0px;
  background-color: #fff;
  padding-top: 8px;
  border-top: 2px solid #D0D0D0;
`

const Input = styled.TextInput.attrs({
  multiline: true,
  placeholder: "Envoyer un message",
  inputMode: "text",
})`
  width: 80%;
  padding: 8px;
  border: 2px solid #DADBDD;
  border-radius: 8px;
  color: black;
  ::placeholder {
    color: #DADBDD;
  }
`

const InputSafeAreaView = styled.SafeAreaView`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: ${() => Platform.OS === "android" ? "8px" : "inherit"};
`

export default function Channel ({ navigation }: Props) {  
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

  let sendMessage = trpc.channel.message.create.useMutation({
    onSuccess(data, variables, context) {
      // console.log(data);
      
    },
  })

  const msgState = useAppSelector(state => {
    const channel = state.messages[+route.params.id]

    return channel.position.map(
      x => channel.messages[x]
    )
  })

  useEffect(() => {
    
  }, [])

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
      messages={msgState.map(message => ({
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
    <View style={{ width: "100%", height: 32, backgroundColor: "white" }}></View>
  </>

  // return <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: "100%" }}>
  //   <SafeAreaView style={{ paddingBottom: 64 }}>
  //     {messages.data && 
  //       <VirtualizedList
  //         renderItem={(item) => <Message message={item.item}/>}
  //         keyExtractor={(item: IMessage) => item.id.toString()}
  //         getItem={(_, index): IMessage => messages.data[index]}
  //         getItemCount={() => messages.data?.length || 0}
          
  //       />
  //     }
  //   </SafeAreaView>
  //   <InputContainer keyboardVerticalOffset={120} behavior={Platform.OS === "ios" ? "padding" : "height"}>
  //     <InputSafeAreaView>
  //       <Input onSubmitEditing={() => console.log("aze")} value={input} onChangeText={setInput}/>
  //       <TouchableOpacity onPress={onSend}>
  //         <FontAwesome name="send" size={24} color={"#007aff"}/>
  //       </TouchableOpacity>
  //     </InputSafeAreaView>
  //   </InputContainer>
  // </TouchableWithoutFeedback>
}

// function Message ({ message }: { message: IMessage }) {
//   return <View>
//     <Text>{message.content}</Text>
//   </View>
// }
