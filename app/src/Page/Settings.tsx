import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setLogin } from "../store/slices/loginSlice";
import { FText } from "../Components/FText";

export default function Settings () {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)

  return <View>
    <FText>{me?.email}</FText>
    <Button color={"red"} title="Déconnexion" onPress={() => {
      AsyncStorage.removeItem("token")
      dispatch(setLogin(false))
    }} />
  </View>
}
