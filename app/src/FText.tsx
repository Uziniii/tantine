import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { Text } from "react-native";

interface Props extends React.PropsWithChildren {
  fontSize?: number;
  font?: [number, string];
}

export function FText ({
  children,
  fontSize,
  font: fontProps
}: Props) {
  const font: [number, string] = [
    fontProps?.[0] || Montserrat_400Regular,
    fontProps?.[1] || "Montserrat_400Regular"
  ]

  const [fontsLoaded, fontError] = useFonts({
    [font[0]]: font[0]
  })

  if (!fontsLoaded && !fontError) return null

  return <Text style={{ fontFamily: font[1], fontSize: fontSize || 16 }}>
    {children}
  </Text>
}
