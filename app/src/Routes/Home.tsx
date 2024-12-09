import { Image, View } from "react-native";
import { TitleText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "../store/store";
import { langData } from "../data/lang/lang";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import ChannelList from "../Page/ChannelList";
import Settings from "../Page/Settings";
import styled from "styled-components/native";
import Community from "../Page/Community";
import { useEffect } from "react";
import GroupRecommandation from "../Page/GroupRecommandation";
import GetUserPictureProfil from "../Components/GetUserPictureProfil";
import Constants from 'expo-constants';
import colorCss from "../Page/css/color.css";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  navigation: NavigationProp<any>
}

const Tab = createBottomTabNavigator();

const ButtonSearch = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: #333541;
  display: flex;
  align-items: center;
  justify-content:center;
`

const logo = require("../../assets/logo.png")

export function Home() {
  const me = useAppSelector(state => state.me)
  const lang = useAppSelector(state => langData[state.language].tab)

  return (
    <View style={{ flex: 1, backgroundColor: colorCss.primaryBg }}>
      <View style={{ width: "100%", height: 80, marginTop: Constants.statusBarHeight, backgroundColor: colorCss.primaryBg }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, borderBottomWidth: 1, borderColor: colorCss.gold }}>
          <View style={{ height: 56, width: 56 }}>
            <GetUserPictureProfil id={me?.id ?? 0} type="user" />
          </View>
          <Image
            style={{
              alignSelf: 'center',
              height: 56,
              width: 80,
            }}
            source={logo}
          />
          <MaterialCommunityIcons name="bell" size={42} color={colorCss.gold} />
        </View>
      </View>
      <Tab.Navigator screenOptions={{
        headerShadowVisible: false,
        tabBarStyle: {
          height: '10%',
          width: '100%',
          alignSelf: 'center',
          // marginTop: 20,
          // paddingBottom: 16,
          backgroundColor: '#24252D',
          borderTopWidth: 0,
          // borderRadius: 99990,
          // borderWidth: 1,
          // borderTopWidth: 1,
          // borderTopColor: "#D4B216",
          // borderColor: "#D4B216",
        },
        headerStyle: {
          backgroundColor: "#24252D",
        },
      }}>
        <Tab.Screen
          name="chat"
          key={"chat"}
          component={ChannelList}
          options={{
            tabBarActiveTintColor: '#D4B216',
            tabBarIcon(props) {
              return <FontAwesome name="comments" size={30} color={props.color} />
            },
            tabBarLabel() {
              return <TitleText $color='#FFFF' $size='12px'>{lang.chat}</TitleText>
            },
            headerTitleAlign: "center",
            header() {
              return <View style={{ height: 100 }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <TitleText
                    font={[Montserrat_700Bold, "Montserrat_700Bold"]}
                    $size={"25px"}
                    $color={colorCss.gold}
                  >
                    {lang.chat}
                  </TitleText>
                </View>
              </View>
            },
            // headerRight() {
            //   const navigation = useNavigation()
            //
            //   return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            //     <ButtonSearch onPress={() => navigation.navigate("search" as never)}>
            //       <Feather name="search" size={25} color={"#fff"} />
            //     </ButtonSearch>
            //   </View>
            // },
            //
            // headerLeft() {
            //   const navigation = useNavigation()
            //
            //   return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginLeft: 16 }}>
            //     <ButtonSearch onPress={() => navigation.navigate("createGroup" as never)}>
            //       <Feather name="plus" size={25} color={"#fff"} />
            //     </ButtonSearch>
            //   </View>
            // }
          }}
        />
        <Tab.Screen
          name='groupRecommandation'
          key={"groupRecommandation"}
          component={GroupRecommandation}
          options={{
            tabBarActiveTintColor: '#D4B216',
            tabBarIcon(props) {
              return <MaterialIcons name="groups" size={30} color={props.color} />
            },
            tabBarLabel(props) {
              return <TitleText $color='#FFFF' $size='12px'>Groupe</TitleText>
            },
            headerTitle() {
              return <View>
                <TitleText
                  font={[Montserrat_700Bold, "Montserrat_700Bold"]}
                  $size={"25px"}
                  $color='#FFF'
                >
                  Groupe
                </TitleText>
              </View>
            },
          }}
        />
        <Tab.Screen
          name='community'
          key={"community"}
          component={({ navigation }: Props) => {
            console.log("render")

            useEffect(() => {
              console.log("useEffect")

              if (navigation.isFocused()) {
                navigation.reset({
                  index: 1,
                  key: "stack-1",
                  routes: [
                    {
                      name: "home"
                    },
                    {
                      name: "communityScreen"
                    },
                  ],
                  type: "stack"
                })
                // console.log(navigation.getState());
                // navigation.navigate("communityScreen")
              }
            }, [])

            return null
          }}
          options={{
            unmountOnBlur: true,
            tabBarActiveTintColor: '#D4B216',
            tabBarIcon(props) {
              return <MaterialIcons name="groups" size={30} color={props.color} />
            },
            tabBarLabel(props) {
              return <TitleText $color='#FFFF' $size='12px'>Communauté</TitleText>
            },
            headerTitle() {
              return <View>
                <TitleText
                  font={[Montserrat_700Bold, "Montserrat_700Bold"]}
                  $size={"25px"}
                  $color='#FFF'
                >
                  Communauté
                </TitleText>
              </View>
            },
          }}
        />
        <Tab.Screen
          name='settings'
          key={"settings"}
          component={Settings}
          options={{
            tabBarActiveTintColor: '#D4B216',
            tabBarIcon(props) {
              return <FontAwesome name="gear" size={30} color={props.color} />
            },
            tabBarLabel(props) {
              return <TitleText $color='#FFFF' $size='12px'>{lang.settings}</TitleText>
            },
            headerTitle() {
              return <View>
                <TitleText
                  font={[Montserrat_700Bold, "Montserrat_700Bold"]}
                  $size={"25px"}
                  $color='#FFF'
                >
                  {lang.settings}
                </TitleText>
              </View>
            },
          }}
        />
      </Tab.Navigator>
      {/* <View style={{ height: 40 }} /> */}
    </View>
  );
}
