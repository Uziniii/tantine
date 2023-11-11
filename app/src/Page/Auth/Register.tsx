import { trpc } from '../../utils/trpc';
import { Pressable, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import { renderInput, showError } from "../../utils/formHelpers"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { FText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { Container, Form, InputGroup, BottomContainer, Button } from "../css/auth.css"
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { ScrollView } from 'react-native-gesture-handler';
import DropdownCountry from '../../Components/DropdownCountry';
import { langData, replace } from '../../data/lang/lang';
import DropdownGender from '../../Components/DropdownGender';
import { isKeyboard } from '../../hooks/isKeyboard';
import { NextButton } from './LangSelect';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  navigation: NavigationProp<any>;
}

const inputWidth = Dimensions.get("window").width * 0.4 - 8 + "px"

export default function Register({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => {
    return {
      ...langData[state.language].auth,
      originCountryPlaceholder: langData[state.language].dropdown.originCountryPlaceholder,
      next: langData[state.language].langSelect.next,
    }
  })
  const isKeyboardOpen = isKeyboard()
  const [phase, setPhase] = useState<1 | 2 | 3>(1)

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

  const [inputs, setInputs] = useInputsReducer([
    "name",
    "surname",
    "gender",
    "country",
    "state",
    "city",
    "origin",
    "email",
    "password",
    "passwordConfirm",
  ])
  const [lastFocus, setLastFocus] = useState("")
  const [alreadyUsedEmail, setAlreadyUsedEmail] = useState(false)

  const sendRegisterData = async () => {
    createUser.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
      name: inputs.name.input,
      surname: inputs.surname.input,
      gender: +inputs.gender.input as 1 | 2 | 3,
      countryOfResidence: inputs.country.input,
      state: inputs.state.input,
      city: inputs.city.input,
      originCountry: inputs.origin.input,
    })
  }

  const firstPhaseVeify = useMemo(() => {
    return [inputs.name, inputs.surname, inputs.gender].every(x => x.error === undefined)
  }, [inputs.name, inputs.surname, inputs.gender])

  const secondPhaseVeify = useMemo(() => {
    return [inputs.country, inputs.state, inputs.city, inputs.origin].every(x => x.error === undefined)
  }, [inputs.country, inputs.state, inputs.city, inputs.origin])

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Container style={{ justifyContent: "flex-start" }}>
        <Form>
          {phase === 1 && <>
            <InputGroup>
              {renderInput({
                setInputs,
                inputs,
                parser:
                  z.string()
                    .trim()
                    .min(2, { message: replace(lang.error.nameSurnameMin, lang.surname.toLowerCase()) }),
                state: "surname",
                placeholder: lang.surname,
                maxLength: 18,
                $width: inputWidth,
                onFocus() {
                  setLastFocus("surname")
                },
              })}

              {renderInput({
                setInputs,
                inputs,
                parser: 
                  z.string()
                    .trim()
                    .min(2, { message: replace(lang.error.nameSurnameMin, lang.name.toLowerCase()) }),
                state: "name",
                placeholder: lang.name,
                maxLength: 32,
                $width: inputWidth,
                onFocus() {
                  setLastFocus("name")
                },
              })}
            </InputGroup>

            {showError(lastFocus === "name" ? inputs.name : inputs.surname)}

            <DropdownGender
              value={+inputs.gender?.input}
              setValue={(gender) => {
                console.log(gender);
                
                setInputs({
                  key: "gender",
                  input: gender.toString(),
                  parser: z.string(),
                })
              }}
            />

            <NextButton disabled={!firstPhaseVeify} onPress={() => setPhase(2)} style={{ marginTop: 0 }}>
              <FText $color="white" >{lang.next}</FText>
              <FontAwesome name="arrow-right" size={16} color={"white"} />
            </NextButton>
          </>}

          {phase === 2 && <>
            <DropdownCountry
              value={inputs.country?.input || ""}
              setValue={(country) => {
                setInputs({
                  key: "country",
                  input: country,
                  parser: z.string()
                })
              }}
            />

            {renderInput({
              setInputs,
              inputs,
              parser: 
                z.string()
                  .trim()
                  .min(2, { message: lang.error.stateMin }),
              state: "state",
              placeholder: lang.state,
              maxLength: 48,
            })}
            {showError(inputs.state)}

            {renderInput({
              setInputs,
              inputs,
              parser: 
                z.string()
                  .trim()
                  .min(2, { message: lang.error.cityMin }),
              state: "city",
              placeholder: lang.city,
              maxLength: 48,
            })}
            {showError(inputs.city)}

            <DropdownCountry
              placeholder={lang.originCountryPlaceholder}
              value={inputs.origin?.input || ""}
              setValue={(origin) => {
                setInputs({
                  key: "origin",
                  input: origin,
                  parser: z.string()
                })
              }}
            />

            <InputGroup>
              <NextButton onPress={() => setPhase(1)} $width={inputWidth} style={{ marginTop: 0 }}>
                <FText $color="white">{lang.back}</FText>
                <FontAwesome name="arrow-left" size={16} color={"white"} />
              </NextButton>
              <NextButton disabled={!secondPhaseVeify} onPress={() => setPhase(3)} $width={inputWidth} style={{ marginTop: 0 }}>
                <FText $color="white">{lang.next}</FText>
                <FontAwesome name="arrow-right" size={16} color={"white"} />
              </NextButton>
            </InputGroup>
          </>}

          {phase === 3 && <>
            {renderInput({
              setInputs,
              inputs,
              parser: 
                z.string()
                  .trim()
                  .email({ message: lang.error.emailInvalid }),
              state: "email",
              placeholder: lang.email,
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
                  ? { error: lang.error.emailAlreadyExists } 
                  : undefined 
            )}

            {renderInput({
              setInputs,
              inputs,
              parser: 
                z.string()
                  .trim()
                  .min(8, { message: lang.error.passwordMin }),
              state: "password",
              placeholder: lang.password,
              maxLength: 64,
              secureTextEntry: true,
            })}
            {showError(inputs.password)}

            {renderInput({
              setInputs,
              inputs,
              parser: 
                z.string()
                  .trim()
                  .refine((val) => val === inputs.password.input, { message: lang.error.passwordNotMatch }),
              state: "passwordConfirm",
              placeholder: lang.confirmPassword,
              maxLength: 64,
              secureTextEntry: true,
            })}
            {showError(inputs.passwordConfirm)}

            <InputGroup>
              <NextButton onPress={() => setPhase(2)} $width={inputWidth} style={{ marginTop: 0 }}>
                <FText $color="white">{lang.back}</FText>
                <FontAwesome name="arrow-left" size={16} color={"white"} />
              </NextButton>
              <Button
                $width={inputWidth}
                disabled={!Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0}
                onPress={sendRegisterData}>
                <FText $color='white'>{lang.register}</FText>
              </Button>
            </InputGroup>
          </>}
        </Form>
        {!isKeyboardOpen && 
          <BottomContainer>
            <FText $color='white' $size='18px'>
              {lang.alreadyHaveAccount}
            </FText>
            <Pressable onPress={() => navigation.navigate("login")}>
              <FText $size='18px' $color='#575BFD'>{lang.login}</FText>
            </Pressable>
          </BottomContainer>
        }
      </Container>
    </KeyboardAvoidingView>
  </ScrollView>
}
