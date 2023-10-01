import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, View } from "react-native";
import { useAppDispatch } from "../store/store";
import { setLogin } from "../store/slices/loginSlice";

export default function Settings () {
  const dispatch = useAppDispatch()

  return <View>
    <Button color={"red"} title="Déconnexion" onPress={() => {
      AsyncStorage.removeItem("token")
      dispatch(setLogin(false))
    }} />
  </View>
}
