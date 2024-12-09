import { useFonts as fredokaUseFonts, FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one";
import { useFonts as poppinsUseFonts, Poppins_500Medium, Poppins_400Regular } from "@expo-google-fonts/poppins";
import { StyleProp, TextStyle } from "react-native";
import styled from "styled-components/native"

interface Props extends React.PropsWithChildren {
  font?: [number, string];
  style?: StyleProp<TextStyle>;
}

const CustomText = styled.Text<{ $color?: string, $size?: string }>`
  color: ${props => props.$color || "#14213d"};
  font-size: ${props => props.$size || "22px"};
`

export function TitleText({
  children,
  font: fontProps,
  $color,
  $size
}: Props & typeof CustomText.defaultProps) {
  const font: [number, string] = [
    fontProps?.[0] || FredokaOne_400Regular,
    fontProps?.[1] || "FredokaOne_400Regular"
  ]

  const [fontsLoaded, fontError] = fredokaUseFonts({
    [font[1]]: font[0]
  })

  if (!fontsLoaded && !fontError) return null

  return <CustomText {...{ $color, $size }} style={{ fontFamily: font[1] }}>
    {children}
  </CustomText>
}

export function MTitleText({
  children,
  font: fontProps,
  $color,
  $size = "20px"
}: Props & typeof CustomText.defaultProps) {
  const font: [number, string] = [
    fontProps?.[0] || Poppins_500Medium,
    fontProps?.[1] || "Poppins_500Medium"
  ]

  const [fontsLoaded, fontError] = poppinsUseFonts({
    [font[1]]: font[0]
  })

  if (!fontsLoaded && !fontError) return null

  return <CustomText {...{ $color, $size }} style={{ fontFamily: font[1] }}>
    {children}
  </CustomText>
}


export function SText({
  children,
  font: fontProps,
  $color,
  $size = "18px",
  style = {}
}: Props & typeof CustomText.defaultProps) {
  const font: [number, string] = [
    fontProps?.[0] || Poppins_400Regular,
    fontProps?.[1] || "Poppins_400Regular"
  ]

  const [fontsLoaded, fontError] = poppinsUseFonts({
    [font[1]]: font[0]
  })

  if (!fontsLoaded && !fontError) return null

  return <CustomText {...{ $color, $size }} style={{ fontFamily: font[1], ...style }}>
    {children}
  </CustomText>
}
