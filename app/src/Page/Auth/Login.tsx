import { trpc } from '../../utils/trpc';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { renderInput, showError } from '../../utils/formHelpers';
import { useInputsReducer } from '../../hooks/inputsReducer';
import z from "zod";
import { FText } from '../../Components/FText';
import { ScrollView } from 'react-native-gesture-handler';
import { Container, Form, Button } from '../css/auth.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { set } from '../../store/slices/meSlice';
import TitleSubAuth from '../../Components/TitleSubAuth';
import { langData } from '../../data/lang/lang';

export default function Login() {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].auth)
  const [inputs, setInputs] = useInputsReducer([
    "email",
    "password",
  ])
  const me = useAppSelector(state => state.me)
  
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

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}>  
      <TitleSubAuth title={lang.loginTitle} sub={lang.loginSub} />
      <Container>
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
          })}
          {showError(inputs.email)}

          {renderInput({
            setInputs,
            inputs,
            label: lang.password,
            parser: z.string()
              .min(8, { message: lang.error.passwordMin }),
            state: "password",
            maxLength: 64,
            secureTextEntry: true,
          })}
          {showError(inputs.password)}

          <Button
            disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
            onPress={sendLoginData}
            $background='#333541'
            >
            <FText $color='white'>{lang.login}</FText>
          </Button>
        </Form>
      </Container>
    </KeyboardAvoidingView>
  </ScrollView>
}
