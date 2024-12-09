import styled from "styled-components/native"
import { TitleText } from "../../Components/FText"
import { langData } from "../../data/lang/lang"
import { Language, setLanguage } from "../../store/slices/languageSlice"
import { useAppDispatch, useAppSelector } from "../../store/store"
import { SpaceBetweenButton } from "../Auth/LangSelect"
import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import color from "../css/color.css"

const View = styled.View`
  display: flex;
  align-items: center;
  flex: 1;
`

export default function ChooseLanguage() {
  const dispatch = useAppDispatch()
  const langCode = useAppSelector(state => state.language)

  const onLangChoose = (lc: Language) => {
    if (lc === langCode) return

    dispatch(setLanguage(lc))

    AsyncStorage.setItem("language", lc)
  }

  return <View>
    {(Object.keys(langData) as Language[]).map((lc) => {
      return <SpaceBetweenButton $width="90%" key={lc} onPress={() => onLangChoose(lc)} $borderColor={lc === langCode}>
        <TitleText>{langData[lc].langSelect.lang}</TitleText>
        {lc === langCode && <FontAwesome name="check-circle" size={20} color={color.green} />}
      </SpaceBetweenButton>
    })}
  </View>
}
