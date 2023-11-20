import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FText } from "../Components/FText";
import { Container, Group } from "./css/lookup.css";
import { ProfilePictureContainer } from "./css/user.css";
import { FontAwesome } from "@expo/vector-icons"
import SettingsButton from "../Components/SettingsButton";
import { langData } from "../data/lang/lang";
import { NavigationProp } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<any>
}

export default function Settings ({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)
  const lang = useAppSelector(state => langData[state.language].settings)

  if (!me) return null

  return <View>
    <Container>
      <ProfilePictureContainer $size="100px">
        <FontAwesome name="user" size={50} color="black" />
      </ProfilePictureContainer>
      <Group>
        <FText $size="24px" $color="white">{me.surname} {me.name}</FText>
        <FText $size="16px" $color="white">{me.email}</FText>
      </Group>
    </Container>

    <SettingsButton text={lang.language} onPress={() => navigation.navigate("chooseLanguage")} />

    <Button color={"red"} title="Déconnexion" onPress={() => {
      dispatch({ type: "RESET" })
      AsyncStorage.removeItem("token")
    }} />
  </View>
}
