import { Image, View } from "react-native";
import { MTitleText, TitleText } from "../Components/FText";
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
import { WaveBackground } from "../Components/WaveBackground";
import { TabIcon } from "../Components/TabIcon";

interface Props {
  navigation: NavigationProp<any>
}

const Tab = createBottomTabNavigator();


const logo = require("../../assets/logo.png")

interface HeaderProps {
  text: string
}

function Header({ text }: HeaderProps) {
  return <View style={{ height: 100 }}>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TitleText
        font={[Montserrat_700Bold, "Montserrat_700Bold"]}
        $size={"25px"}
        $color={colorCss.gold}
      >
        {text}
      </TitleText>
    </View>
  </View>
}

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
      <View style={{ flex: 1, backgroundColor: "#797993" }}>
        <WaveBackground></WaveBackground>
        <View style={{ flex: 1, zIndex: 2 }}>
          <Tab.Navigator screenOptions={{
            headerShadowVisible: false,
            tabBarStyle: {
              height: '12%',
              width: '100%',
              alignSelf: 'center',
              backgroundColor: "transparent",
              borderTopWidth: 0,
              bottom: -10
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
                tabBarActiveTintColor: colorCss.lightGold,
                tabBarIcon(props) {
                  return <TabIcon name="message" width="30" height="30" color={props.color} />
                },
                tabBarLabel() {
                  return <MTitleText $color='#FFFF' $size='12px' > {lang.chat}</MTitleText>
                },
                headerTitleAlign: "center",
                header() {
                  return <Header text={lang.chat}></Header>
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
                tabBarActiveTintColor: colorCss.lightGold,
                tabBarIcon(props) {
                  return <TabIcon name="group" width="30" height="30" color={props.color} />
                },
                tabBarLabel(props) {
                  return <MTitleText $color='#FFFF' $size='12px'>Groupe</MTitleText>
                },
                header() {
                  return <Header text={lang.group}></Header>
                }
              }}
            />
            <Tab.Screen
              name="createGroup"
              key="createGroup"
              component={function A() { return <></> }}
              options={{
                tabBarLabel() {
                  return <></>
                },
                tabBarIcon() {
                  return <View
                    style={{
                      bottom: 10,
                      width: 44,
                      height: 44,
                      backgroundColor: colorCss.lightGold,
                      justifyContent: "center",
                      borderRadius: 100,
                      shadowColor: colorCss.lightGold,
                      shadowOpacity: 10,
                      shadowOffset: {
                        width: 0,
                        height: 0
                      }
                    }}
                  >
                    <Feather name="plus" size={28} color={colorCss.primaryBg} style={{ alignSelf: "center" }} />
                  </View>
                }
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
                tabBarActiveTintColor: colorCss.lightGold,
                tabBarIcon(props) {
                  return <TabIcon name="community" width="30" height="30" color={props.color} />
                },
                tabBarLabel(props) {
                  return <MTitleText $color='#FFFF' $size='12px'>Communauté</MTitleText>
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
                tabBarActiveTintColor: colorCss.lightGold,
                tabBarIcon(props) {
                  return <TabIcon name="settings" width="30" height="30" color={props.color} />
                },
                tabBarLabel(props) {
                  return <MTitleText $color='#FFFF' $size='12px'>{lang.settings}</MTitleText>
                },
                header() {
                  return <Header text={lang.settings}></Header>
                }
              }}
            />
          </Tab.Navigator>
        </View>
        {/* <View style={{ height: 40 }} /> */}
      </View>
    </View >
  );
}
