import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FText } from "../Components/FText";
import { Container, Group } from "./css/lookup.css";
import { ProfilePictureContainer } from "./css/user.css";
import { FontAwesome } from "@expo/vector-icons"

export default function Settings () {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)

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
    <Button color={"red"} title="Déconnexion" onPress={() => {
      AsyncStorage.removeItem("token")
      dispatch({ type: "RESET" })
    }} />
  </View>
}
