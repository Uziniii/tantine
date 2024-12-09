import { trpc } from '../../utils/trpc';
import { Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';
import { renderInput, showError } from '../../utils/formHelpers';
import { useInputsReducer } from '../../hooks/inputsReducer';
import z from "zod";
import { MTitleText, SText, TitleText } from '../../Components/FText';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Container, Form, Button, TitleWrapper } from '../css/auth.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { set } from '../../store/slices/meSlice';
import TitleSubAuth from '../../Components/TitleSubAuth';
import { langData } from '../../data/lang/lang';
import { GrayGradient } from '../css/gradient.css';
import styled from 'styled-components/native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import colorCss from '../css/color.css';

let sourire = require("../../../assets/sourire.png")
let screenWidth = Dimensions.get("screen").width;

const PasswordRecover = styled(TouchableOpacity)`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  flex-direction: row;
`

export default function Login() {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].auth)
  const [inputs, setInputs] = useInputsReducer([
    "email",
    "password",
  ])
  const me = useAppSelector(state => state.me)
  const navigation = useNavigation()

  const login = trpc.user.login.useMutation({
    async onSuccess(data) {
      await AsyncStorage.setItem("token", data)

      dispatch(setLogin(true))

      if (!me) return

      dispatch(set({
        ...me,
        token: data
      }))
    },
    onError(err) {
      if (err.message === "INVALID_CREDENTIALS") {
        setInputs({
          key: "password",
          input: inputs.password.input,
          parser: z.string()
            .refine(() => false, {
              message: lang.error.incorrectCredentials
            }) as unknown as z.ZodString
        })
      }
    }
  })

  const sendLoginData = () => {
    login.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
    })
  }

  return <GrayGradient colors={[]} style={{ flex: 1, justifyContent: "flex-start" }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <KeyboardAvoidingView
        style={{ width: screenWidth }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TitleWrapper>
          <TitleSubAuth style={{ width: "90%", paddingBottom: 20 }} title={lang.loginTitle} sub={lang.loginSub} />
          <Image
            style={{
              alignSelf: 'center',
              height: 130,
              width: 130,
              marginTop: 20,
            }}
            source={sourire}
          />
        </TitleWrapper>
        <Container style={{ height: "50%" }}>
          <Form>
            {renderInput({
              setInputs,
              inputs,
              parser: z.string()
                .email({ message: lang.error.emailInvalid }),
              state: "email",
              label: lang.email,
              inputMode: "email",
              maxLength: 200,
              type: "mail"
            })}

            {renderInput({
              setInputs,
              inputs,
              label: lang.password,
              parser: z.string()
                .min(8, { message: lang.error.passwordMin }),
              state: "password",
              maxLength: 64,
              secureTextEntry: true,
              type: "password"
            })}
            <PasswordRecover onPress={() => navigation.navigate("passwordRecover" as never)}>
              <MTitleText $color={colorCss.gold} $size='14'>{lang.passwordRecover}</MTitleText>
            </PasswordRecover>
            {showError(inputs.password)}

            <Button
              disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
              onPress={sendLoginData}
              $background={colorCss.gold}
              style={{ marginVertical: 16 }}
            >
              <MTitleText $color={colorCss.primaryBg}>{lang.login}</MTitleText>
            </Button>

            <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
              <SText $color='white'>{lang.noAccount.text} </SText>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("register" as never, { mail: inputs["email"] } as never)}
              >
                <SText $color={colorCss.gold}>{lang.noAccount.button}</SText>
              </TouchableOpacity>
            </View>
          </Form>
        </Container>
      </KeyboardAvoidingView>
    </ScrollView >
  </GrayGradient>
}
