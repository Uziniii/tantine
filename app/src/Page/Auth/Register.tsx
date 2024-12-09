import { trpc } from '../../utils/trpc';
import { Pressable, KeyboardAvoidingView, Platform, Dimensions, View, Keyboard, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import TitleSubAuth from '../../Components/TitleSubAuth';
import styled from 'styled-components/native';
import { TextInput, renderInput, showError } from "../../utils/formHelpers"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { MTitleText, SText, TitleText } from '../../Components/FText';
import { NavigationProp } from '@react-navigation/native';
import { Container, Form, InputGroup, Button, TitleWrapper, NextButton } from "../css/auth.css"
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLogin } from '../../store/slices/loginSlice';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DropdownCountry from '../../Components/DropdownCountry';
import { langData, replace } from '../../data/lang/lang';
import DropdownGender from '../../Components/DropdownGender';
import { isKeyboard } from '../../hooks/isKeyboard';
import { FontAwesome } from '@expo/vector-icons';
import UploadPictureProfil from '../../Components/UploadPictureProfil';
import ky from 'ky';
import { host, port } from '../../utils/host';
import debounce from 'lodash.debounce';
import { GrayGradient } from '../css/gradient.css';
import colorCss from '../css/color.css';
import Entypo from '@expo/vector-icons/Entypo';

interface Props {
  navigation: NavigationProp<any>;
}

type Location = {
  displayName: string;
  lat: string;
  lon: string;
} | undefined

const inputWidth = Dimensions.get("window").width * 0.44 - 8 + "px"

const ButtonBottomContainer = styled.View`
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  position:relative;
  bottom:0;
`;

const PlaceButton = styled.Pressable`
  display:flex;
  flex-direction:row;
  width:100%;
  border-bottom-width: 1px;
  border-bottom-color: ${colorCss.lightGray};
  padding: 4px 10px;
`;

const GeoInput = styled(TextInput).attrs({ $width: "100%" })`
  border: 1px solid ${colorCss.gold};
  padding: 16px;
  color: white;
`

const GeoScrollView = styled.ScrollView`
  height: 200px;
  border: 1px solid ${colorCss.gold};
`

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
  const [phase, setPhase] = useState<number>(1)

  const createUser = trpc.user.create.useMutation({
    async onSuccess(data) {
      await AsyncStorage.setItem("token", data)

      if (image) {
        const extension = image.split(".").pop()

        const formData = new FormData()
        formData.append('audio', {
          uri: image,
          type: `image/${extension}`,
          name: `image.${extension}`,
        } as any);

        await ky.post(`http://${host}:${port}/profilePicture/`, {
          headers: {
            Authorization: `Bearer ${data}`,
          },
          body: formData,
        })
      }

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
    "age",
    "gender",
    // "country",
    // "state",
    // "city",
    // "origin",
    "email",
    "password",
    "passwordConfirm",
  ] as const)
  const [lastFocus, setLastFocus] = useState("")
  const [alreadyUsedEmail, setAlreadyUsedEmail] = useState(false)

  const firstPhaseVerify = useMemo(() => {
    return [inputs.name, inputs.surname, inputs.age, inputs.gender, /** inputs.country, inputs.origin, inputs.state, inputs.city **/].every(x => x.error === undefined)
  }, [inputs.name, inputs.surname, inputs.age, inputs.gender, /** inputs.country, inputs.origin, inputs.state, inputs.city **/])

  const [image, setImage] = useState<string | undefined>(undefined)

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSearchEmpty = useMemo(() => search.length === 0, [search]);

  const debouncedResults = useMemo(() => {
    return debounce((text) => {
      setSearch(text);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  }, [debouncedResults]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await ky.get(
          `https://nominatim.openstreetmap.org/search?q=${search}&format=jsonv2&addressdetails=1`
        );
        setSearchResults(await response.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    if (!isSearchEmpty) {
      fetchData();
    } else {
      setSearchResults([]);
    }
  }, [search, isSearchEmpty]);

  const [location, setLocation] = useState<Location>(undefined)
  const [originLocation, setOriginLocation] = useState<Location>(undefined)

  const onLocationChange = (text: string) => {
    debouncedResults(text);
    setLocation(undefined)
  };

  const onOriginLocationChange = (text: string) => {
    debouncedResults(text);
    setOriginLocation(undefined)
  }

  const sendRegisterData = async () => {
    createUser.mutate({
      email: inputs.email.input,
      password: inputs.password.input,
      name: inputs.name.input,
      surname: inputs.surname.input,
      gender: +inputs.gender.input as 1 | 2 | 3,
      location,
      originLocation,
    })
  }

  useEffect(() => {
    setInputs({
      key: "gender",
      input: "1",
      parser: z.string(),
    })
  }, [])

  const isErrorForRegister = useMemo(() => {
    console.log(inputs);

    return !Object.values(inputs).every(x => x.error === undefined) || Object.values(inputs).length <= 0
  }, [inputs])
  console.log(isErrorForRegister);


  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <GrayGradient colors={[]}>
      <TitleWrapper>
        <TitleSubAuth style={{ width: "90%" }} title={lang.registerTitle} sub={lang.registerSub} step={`${lang.step} ${phase}/5`} />
      </TitleWrapper>

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
                maxLength: 18,
                $width: inputWidth,
                onFocus() {
                  setLastFocus("surname")
                },
                label: lang.surname
              })}

              {renderInput({
                setInputs,
                inputs,
                parser:
                  z.string()
                    .trim()
                    .min(2, { message: replace(lang.error.nameSurnameMin, lang.name.toLowerCase()) }),
                state: "name",
                label: lang.name,
                maxLength: 32,
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
              parser: z.string().transform(x => +x).pipe(z.number().min(18).max(120)),
              state: "age",
              label: lang.age,
              inputMode: "numeric",
              maxLength: 3
            })}

            <DropdownGender
              value={+inputs.gender?.input - 1}
              setValue={(gender) => {
                setInputs({
                  key: "gender",
                  input: (gender + 1).toString(),
                  parser: z.string(),
                })
              }}
            />

            {/* <DropdownCountry
                value={inputs.country?.input || ""}
                setValue={(country) => {
                  setInputs({
                    key: "country",
                    input: country,
                    parser: z.string()
                  })
                }}
              />

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
              
              {renderInput({
                setInputs,
                inputs,
                parser:
                  z.string()
                    .trim()
                    .min(2, { message: lang.error.stateMin }),
                state: "state",
                label: lang.state,
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
                label: lang.city,
                maxLength: 48,
              })} */}
            {showError(inputs.city)}

            <NextButton disabled={!firstPhaseVerify} onPress={() => setPhase(2)} style={{ marginTop: 0 }}>
              <MTitleText>{lang.next}</MTitleText>
              <FontAwesome name="arrow-right" size={16} />
            </NextButton>
          </>}

          {phase === 2 && <>
            <MTitleText $color={colorCss.gold}>{lang.city}</MTitleText>

            <GeoInput
              value={location?.displayName}
              onChangeText={onLocationChange}
            />

            {!loading && location === undefined && searchResults.length > 0 && (
              <GeoScrollView style={{ height: 200 }}>
                {searchResults.map((item: any, i, arr) => (
                  <PlaceButton
                    style={{ borderBottomWidth: i === arr.length - 1 ? 0 : 1 }}
                    key={item.place_id}
                    onPress={() => {
                      setLocation({
                        displayName: item.display_name,
                        lat: item.lat,
                        lon: item.lon,
                      })
                    }}
                  >
                    <Entypo name="location-pin" size={24} color="white" />
                    <SText $color='white'>{item.display_name}</SText>
                  </PlaceButton>
                ))}
              </GeoScrollView>
            )}

            <ButtonBottomContainer>
              <NextButton onPress={() => setPhase((x) => x - 1)} $width={inputWidth} style={{ marginTop: 0 }}>
                <MTitleText>{lang.back}</MTitleText>
                <FontAwesome name="arrow-left" size={16} />
              </NextButton>
              <NextButton disabled={location === undefined} $width={inputWidth} onPress={() => {
                setPhase((x) => x + 1)
                setSearchResults([])
              }} style={{ marginTop: 0 }}>
                <MTitleText>{lang.next}</MTitleText>
                <FontAwesome name="arrow-right" size={16} />
              </NextButton>
            </ButtonBottomContainer>
          </>}

          {phase === 3 && <>
            <MTitleText $color={colorCss.gold}>{lang.origin}</MTitleText>

            <GeoInput
              value={originLocation?.displayName}
              onChangeText={onOriginLocationChange}
            />

            {!loading && originLocation === undefined && searchResults.length > 0 && (
              <GeoScrollView style={{ height: 200 }}>
                {searchResults.map((item: any, i, arr) => (
                  <PlaceButton
                    style={{ borderBottomWidth: i === arr.length - 1 ? 0 : 1 }}
                    key={item.place_id}
                    onPress={() => {
                      setOriginLocation({
                        displayName: item.display_name,
                        lat: item.lat,
                        lon: item.lon,
                      })
                    }}
                  >
                    <Entypo name="location-pin" size={24} color="white" />
                    <SText $color='white'>{item.display_name}</SText>
                  </PlaceButton>
                ))}
              </GeoScrollView>
            )}

            <ButtonBottomContainer>
              <NextButton onPress={() => setPhase((x) => x - 1)} $width={inputWidth} style={{ marginTop: 0 }}>
                <MTitleText>{lang.back}</MTitleText>
                <FontAwesome name="arrow-left" size={16} />
              </NextButton>
              <NextButton disabled={location === undefined} $width={inputWidth} onPress={() => {
                setPhase((x) => x + 1)
                setSearchResults([])
              }} style={{ marginTop: 0 }}>
                <MTitleText>{lang.next}</MTitleText>
                <FontAwesome name="arrow-right" size={16} />
              </NextButton>
            </ButtonBottomContainer>
          </>}

          {phase === 4 && <>
            <UploadPictureProfil setImage={setImage} image={image} />

            <ButtonBottomContainer>
              <NextButton onPress={() => setPhase((x) => x - 1)} $width={inputWidth} style={{ marginTop: 0 }}>
                <MTitleText>{lang.back}</MTitleText>
                <FontAwesome name="arrow-left" size={16} />
              </NextButton>
              <NextButton $width={inputWidth} onPress={() => {
                setPhase((x) => x + 1)
              }} style={{ marginTop: 0 }}>
                <MTitleText>{image === undefined ? lang.ignore : lang.next}</MTitleText>
                <FontAwesome name="arrow-right" size={16} />
              </NextButton>
            </ButtonBottomContainer>
          </>}

          {phase === 5 && <>
            {renderInput({
              setInputs,
              inputs,
              parser:
                z.string()
                  .trim()
                  .email({ message: lang.error.emailInvalid }),
              state: "email",
              label: lang.email,
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
              label: lang.password,
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
              label: lang.confirmPassword,
              maxLength: 64,
              secureTextEntry: true,
            })}
            {showError(inputs.passwordConfirm)}

            <ButtonBottomContainer>
              <NextButton onPress={() => setPhase(x => x - 1)} $width={inputWidth} style={{ marginTop: 0 }}>
                <MTitleText>{lang.back}</MTitleText>
                <FontAwesome name="arrow-left" size={16} />
              </NextButton>
              <Button
                $background={isErrorForRegister ? '#333541' : colorCss.gold}
                $width={inputWidth}
                disabled={isErrorForRegister}
                onPress={sendRegisterData}>
                <MTitleText $color={isErrorForRegister ? 'white' : undefined}>{lang.register}</MTitleText>
              </Button>
            </ButtonBottomContainer>
          </>}
        </Form>
        {!isKeyboardOpen && (<>
          {/*  <BottomContainer>
              <FText $color='white' $size='18px'>
                {lang.alreadyHaveAccount}
              </FText>
              <Pressable onPress={() => navigation.navigate("login")}>
                <FText $size='18px' $color='#575BFD'>{lang.login}</FText>
              </Pressable>
            </BottomContainer> */}
        </>)}
      </Container>
    </GrayGradient>
  </ScrollView>
}
