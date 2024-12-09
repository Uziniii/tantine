import color from "./color.css"
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

export const BigGoldGradient = styled(LinearGradient).attrs({
  colors: [color.primaryBg, color.lightGold],
  start: { y: 0.5, x: 0.5 },
})`
  align-items: center;
  justify-content: center;
  height: 100%;
`

export const TextGoldGradient = styled(LinearGradient).attrs({
  colors: ["white", color.gold],
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0.33 },
})`
  flex: 1;
`

export const GrayGradient = styled(LinearGradient).attrs({
  colors: [color.primaryBg, color.lightGray],
  start: { y: 0.8, x: 0.5 },
})`
  align-items: center;
  justify-content: center;
  height: 100%;
`

export const GrayGradientFull = styled(LinearGradient).attrs({
  colors: [color.primaryBg, color.lightGray],
  start: { y: 0.1, x: 1 },
  end: { x: 1, y: 1 }
})`
  align-items: center;
  justify-content: center;
  height: 100%;
`

