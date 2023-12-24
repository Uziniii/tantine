import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NameSurnamePage from "./Register/NameSurnamePage";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";

const Stack = createNativeStackNavigator();

export default function Register() {
  return <Stack.Navigator>
    <Stack.Screen
      name="nameSurname"
      component={NameSurnamePage}
      options={{
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#F4F4F4"
        },
        
        headerLeft() {
          const navigation = useNavigation();

          return <AntDesign onPress={() => navigation.goBack()} name="arrowleft" size={24} color="black" />
        },
      }}
    />
  </Stack.Navigator>
}
