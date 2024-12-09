import { useMemo, useState } from 'react';
import { langData } from '../data/lang/lang';
import { useAppSelector } from '../store/store';
import DropdownComponent from '../utils/DropdownFactory';
import { MTitleText, SText } from './FText';
import { Pressable, View } from 'react-native';
import styled from 'styled-components/native';
import colorCss from '../Page/css/color.css';
import { FontAwesome } from "@expo/vector-icons"
import { Check } from '../Page/css/auth.css';

interface Props {
  value: number;
  setValue: (value: number) => void;
}

const GenderView = styled.View`
  border: 2px solid ${colorCss.gold};
  border-radius: 16px;
`

const GenderPlaceholderView = styled.View`
  border: 2px solid ${colorCss.gold};
  padding: 12px;
  border-radius: 16px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`

export default function DropdownGender({ value, setValue }: Props) {
  const lang = useAppSelector(state => langData[state.language].dropdown)

  const data = useMemo(() => {
    return lang.gender.map((item, i, arr) => {
      return <Pressable
        style={{
          padding: 12,
          borderColor: "white",
          borderBottomWidth: i === arr.length - 1 ? 0 : 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}
        onPress={() => {
          setValue(i)
        }}
        key={i}
      >
        <MTitleText $color='white'>{item}</MTitleText>
        {value === i ? <Check /> : <></>}
      </Pressable>
    })
  }, [lang, value])

  return <View style={{ gap: 16 }}>
    <GenderPlaceholderView>
      <MTitleText $color="white">{lang.genderPlaceholder}</MTitleText>
      <FontAwesome name='chevron-down' size={20} color="white" />
    </GenderPlaceholderView>
    <GenderView>
      {data}
    </GenderView>
  </View>
}
