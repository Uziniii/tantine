import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./Home";
import Search from "../Page/Search";
import { Platform } from "react-native";
import Channel from "../Page/Channel";
import UserLookup from "../Page/Lookup/UserLookup";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import GroupLookup from "../Page/Lookup/GroupLookup";
import EditGroup from "../Page/Lookup/Group/EditGroup";
import MemberLookup from "../Page/Lookup/Group/MemberLookup";
import { useAppSelector } from "../store/store";
import { langData } from "../data/lang/lang";

const Stack = createNativeStackNavigator();

export default function AllRoute () {
  const lang = useAppSelector(state => langData[state.language].route)

  return <Stack.Navigator
    initialRouteName='home'
  >
    <Stack.Screen
      name='home'
      component={Home}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name='search'
      component={Search}
      options={{
        presentation: "modal",
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
      }}
    />
    <Stack.Screen
      name="channel"
      component={Channel}
      options={{
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="userLookup"
      component={UserLookup}
      options={{
        headerBackTitleVisible: false,
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {lang.info}
          </FText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="groupLookup"
      component={GroupLookup}
      options={{
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {lang.info}
          </FText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name='editGroup'
      component={EditGroup}
      options={{
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {lang.edit}
          </FText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="memberLookup"
      component={MemberLookup}
      options={{
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {lang.manageMember}
          </FText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
  </Stack.Navigator>
}
