import { trpc } from '../../utils/trpc';
import { Pressable, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import { renderInput, showError } from "../../utils/formHelpers"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { FText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { Container, Form, InputGroup, BottomContainer, Button } from "../css/auth.css"
import { useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';

interface Props {
  navigation: NavigationProp<any>;
}

const inputWidth = Dimensions.get("window").width * 0.4 - 8 + "px"

export default function Register({ navigation }: Props) {
  const dispatch = useAppDispatch()

  const createUser = trpc.user.create.useMutation({
    async onSuccess(data) {
      await AsyncStorage.setItem("token", data)
    
      dispatch(setLogin(true))
    },
    onError(err) {
      if (err.message === "EMAIL_ALREADY_USED") {
        setAlreadyUsedEmail(true)
      }
    }
  })

  const [inputs, setInputs] = useInputsReducer()
  const [lastFocus, setLastFocus] = useState("")
  const [alreadyUsedEmail, setAlreadyUsedEmail] = useState(false)

  const sendRegisterData = async () => {
    createUser.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
      name: inputs.name.input,
      surname: inputs.surname.input,
    })
  }

  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Container>
        <Form>
          <InputGroup>
            {renderInput({
              setInputs,
              inputs,
              parser:
                z.string({})
                  .min(2, { message: "Le prénom doit faire minimum 2 caractère" }),
              state: "surname",
              placeholder: "Prénom",
              maxLength: 18,
              $width: inputWidth,
              onFocus() {
                setLastFocus("surname")
              },
            })}

            {renderInput({
              setInputs,
              inputs,
              parser: z.string()
                .min(2, { message: "Le nom doit faire minimum 2 caractère" }),
              state: "name",
              placeholder: "Nom",
              maxLength: 64,
              $width: inputWidth,
              onFocus() {
                setLastFocus("name")
              },
            })}
          </InputGroup>

          {showError(lastFocus === "name" ? inputs.name : inputs.surname)}

          {renderInput({
            setInputs,
            inputs,
            parser: z.string()
              .email({ message: "L'email est incorrect" }),
            state: "email",
            placeholder: "Adresse email",
            inputMode: "email",
            maxLength: 200,
            onChangeText() {
              setAlreadyUsedEmail(false)
            },
          })}
          {showError(
            inputs.email?.error
              ? inputs.email
              : alreadyUsedEmail
                ? { error: "Cette adresse email est déja utilisé" } 
                : undefined 
          )}

          {renderInput({
            setInputs,
            inputs,
            parser: z.string()
              .min(8, { message: "Le mot de passe doit faire minimum 8 caractère" }),
            state: "password",
            placeholder: "Mot de passe",
            maxLength: 64,
            secureTextEntry: true,
          })}
          {showError(inputs.password)}

          {renderInput({
            setInputs,
            inputs,
            parser: z.string()
              .refine((val) => val === inputs.password.input, { message: "Les mots de passe ne correspondent pas" }),
            state: "passwordConfirm",
            placeholder: "Confirmer votre mot de passe",
            maxLength: 64,
            secureTextEntry: true,
          })}
          {showError(inputs.passwordConfirm)}

          <Button
            disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
            onPress={sendRegisterData}>
            <FText $color='white'>S'enregistrer</FText>
          </Button>
        </Form>
        <BottomContainer>
          <FText $size='18px'>
            Vous avez déja un compte ?
          </FText>
          <Pressable onPress={() => navigation.navigate("login")}>
            <FText $size='18px' $color='#575BFD'>Se connecter</FText>
          </Pressable>
        </BottomContainer>
      </Container>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
}
