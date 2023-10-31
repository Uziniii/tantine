import { View } from "react-native";
import { FText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "../store/store";
import { langData } from "../data/lang/lang";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import ChannelList from "../Page/ChannelList";
import Settings from "../Page/Settings";

const Tab = createBottomTabNavigator();

export function Home() {
  const lang = useAppSelector(state => langData[state.language].tab)

  return <Tab.Navigator screenOptions={{
    headerShadowVisible: false,
    tabBarStyle: {
      height: '10%',
      paddingBottom: 16,
      backgroundColor: '#1B202D',
      borderTopWidth: 0
    },
    headerStyle: {
      backgroundColor: "#1B202D",
    },
  }}>
    <Tab.Screen
      name="chat"
      key={"chat"}
      component={ChannelList}
      options={{
        tabBarIcon(props) {
          return <FontAwesome name="comments" size={30} color={props.color} />
        },
        tabBarLabel() {
          return <FText $color='#FFFF' $size='12px'>{lang.chat}</FText>
        },
        headerTitle() {
          return <></>
        },
        headerLeft() {
          return <View style={{ marginLeft: 16 }}>
            <FText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"25px"}
              $color='#FFF'
            >
              {lang.chat}
            </FText>
          </View>
        },
        headerRight() {
          const navigation = useNavigation()

          return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate("search" as never)}>
              <Feather name="edit" size={24} color={"#007aff"} />
            </TouchableOpacity>
          </View>
        },
      }}
    />
    <Tab.Screen
      name='settings'
      key={"settings"}
      component={Settings}
      options={{
        tabBarIcon(props) {
          return <FontAwesome name="gear" size={30} color={props.color} />
        },
        tabBarLabel(props) {
          return <FText $color='#FFFF' $size='12px'>{lang.settings}</FText>
        },

        headerTitle() {
          return <></>
        },

        headerLeft() {
          return <View style={{ marginLeft: 16 }}>
            <FText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"25px"}
              $color='#FFF'
            >
              {lang.settings}
            </FText>
          </View>
        },
      }}
    />
  </Tab.Navigator>
}
