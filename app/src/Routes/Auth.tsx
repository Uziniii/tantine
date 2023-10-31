import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { langData } from "../data/lang/lang";
import Register from "../Page/Auth/Register";
import Login from "../Page/Auth/Login";
import LangSelect from "../Page/Auth/LangSelect";
import { useAppSelector } from "../store/store";

const Stack = createNativeStackNavigator();

export default function Auth() {
  const lang = useAppSelector(state => langData[state.language].auth)

  return <Stack.Navigator
    screenOptions={{
      headerShadowVisible: false,
      animation: "slide_from_right",
      statusBarTranslucent: false,
      headerStyle: {
        backgroundColor: "#292F3F",
      },
    }}
    initialRouteName={"languageSelect"}
  >
    <Stack.Screen
      name="languageSelect"
      key={"languageSelect"}
      component={LangSelect}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="register"
      key={"register"}
      component={Register}
      options={{
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
            $color='#FFFF'
          >
            {lang.register}
          </FText>
        },
      }}
    />
    <Stack.Screen
      name="login"
      key={"login"}
      component={Login}
      options={{
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
            $color='#FFFF'
          >
            {lang.login}
          </FText>
        },
      }}
    />
  </Stack.Navigator>
}
