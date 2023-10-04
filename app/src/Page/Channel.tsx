import { NavigationProp, RouteProp, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, Text, View } from "react-native";
import { ProfilePictureContainer } from "./css/user.css";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { FontAwesome } from '@expo/vector-icons'; 
import styled from "styled-components/native"
import { useAppSelector } from "../store/store";
import { TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { trpc } from "../utils/trpc";

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
  const route = useRoute<{params: {id:string}, key: string, name: string}>()
  const title = useAppSelector(state => {
    const channel = state.channels[route.params.id]
    
    if (channel.type === "group") {
      return channel.title
    }

    const user = state.users[channel.users.find(id => id !== state.me?.id) as unknown as string]

    return `${user.surname} ${user.name}`
  })
  const [input, setInput] = useState("")

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

  const onSend = () => {
    if (input.length === 0) {
      return
    }

    sendMessage.mutate({
      channelId: route.params.id,
      content: input,
    })
  }

  return <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: "100%" }}>
    <View>

    </View>
    <InputContainer keyboardVerticalOffset={120} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <InputSafeAreaView>
        <Input onSubmitEditing={() => console.log("aze")} value={input} onChangeText={setInput}/>
        <TouchableOpacity onPress={onSend}>
          <FontAwesome name="send" size={24} color={"#007aff"}/>
        </TouchableOpacity>
      </InputSafeAreaView>
    </InputContainer>
  </TouchableWithoutFeedback>
}
