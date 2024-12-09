import { MTitleText, SText, TitleText } from "../../Components/FText";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useMemo } from "react";
import styled from "styled-components/native"
import { FontAwesome } from "@expo/vector-icons"
import { View } from "react-native";
import { Language, setLanguage } from "../../store/slices/languageSlice";
import { NavigationProp } from "@react-navigation/native";
import { langData } from "../../data/lang/lang";
import { BigGoldGradient } from "../css/gradient.css";
import { Image } from "expo-image";
import color from "../css/color.css"

const langIcon = require("../../../assets/lang/lang-icon.svg")

const fr = require("../../../assets/lang/fr.svg")
const en = require("../../../assets/lang/en.svg")
const flag = { fr, en }

export const SpaceBetweenButton = styled.TouchableOpacity<{
  $borderColor?: boolean,
  $width?: string,
  $background?: string,
}>`
  background: ${({ $background }) => $background ?? "white"};
  width: ${({ $width }) => $width ?? "65%"};
  padding: 10px;
  border: 3px solid ${props => (props.$borderColor && color.green) || "#DADBDD"};
  border-radius: 8px;
  color: black;
  box-shadow: 0px 1px 1.41px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`

export const NextButton = styled.TouchableOpacity<{ $width?: string }>`
  width: ${({ $width }) => $width || "100%"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  background: #29282C;
  border-radius: 8px;
  margin-top: 8px;
  padding: 12px;
`;

interface Props {
  navigation: NavigationProp<any>;
}

export default function LangSelect({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const langCode = useAppSelector(state => state.language)
  const lang = useMemo(() => langData[langCode].langSelect, [langCode])

  const onLangChoose = (lc: Language) => {
    if (lc === langCode) return

    dispatch(setLanguage(lc))
  }

  const onContinue = () => {
    navigation.navigate("welcome")
  }

  return <BigGoldGradient colors={[]}>
    <View style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 24 }}>
      <TitleText $size="50px" $color="#FFF">{lang.hello}</TitleText>
      <MTitleText $size="15px" $color="#FFF">{lang.sub}</MTitleText>
      <Image source={langIcon} style={{ width: 60, height: 60 }} />
    </View>
    {(Object.keys(langData) as Language[]).map((lc) => {
      return <SpaceBetweenButton key={lc} onPress={() => onLangChoose(lc)} $borderColor={lc === langCode}>
        <SText>{langData[lc].langSelect.lang}</SText>
        <Image
          source={flag[lc]}
          style={{ width: 24, height: 24 }}
        />
      </SpaceBetweenButton>
    })}
    <NextButton onPress={onContinue} $width="65%">
      <SText $color="white" >{lang.next}</SText>
      <FontAwesome name="arrow-right" size={16} color={"white"} />
    </NextButton>
  </BigGoldGradient>
}
