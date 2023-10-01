import { View } from "react-native";
import { FText } from "../Components/FText";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "./Search";
import { trpc } from "../utils/trpc";

interface Props {
  navigation: NavigationProp<any>
}

export default function Chat ({ navigation }: Props) {
  return <></>
}
