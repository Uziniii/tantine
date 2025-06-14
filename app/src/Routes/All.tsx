import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "./Home";
import Search from "../Page/Search";
import { Platform, View } from "react-native";
import Channel from "../Page/Channel";
import UserLookup from "../Page/Lookup/UserLookup";
import { TitleText } from "../Components/FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import GroupLookup from "../Page/Lookup/GroupLookup";
import EditGroup from "../Page/Lookup/Group/EditGroup";
import MemberLookup from "../Page/Lookup/Group/MemberLookup";
import { useAppSelector } from "../store/store";
import { langData } from "../data/lang/lang";
import CreateGroup from "../Page/CreateGroup";
import { AddMember } from "../Page/Lookup/Group/Add/AddMember";
import styled from "styled-components/native";
import AddMemberConfirm from "../Page/Lookup/Group/Add/AddMemberConfirm";
import { FontAwesome, Feather } from "@expo/vector-icons";
import Invite from "../Page/Lookup/Group/Invite/Invite";
import InviteConfirm from "../Page/Lookup/Group/Invite/InviteConfirm";
import ChooseLanguage from "../Page/Settings/ChooseLanguage";
import Community from "../Page/Community";

const Stack = createNativeStackNavigator();

const Container = styled.View`
  flex: 1;
  width: 100%;
`

const TitleCreateGroup = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const headerColor = "#24252D";

export default function AllRoute() {
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
        headerShown: false,
        headerTitle() {
          return <TitleCreateGroup>
            <FontAwesome name="search" size={30} color="#14213d" />
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="#14213d"
            >{lang.search}</TitleText>
          </TitleCreateGroup>
        },
        contentStyle: {
          backgroundColor: "white"
        },
        presentation: "modal",
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
      }}
    />
    <Stack.Screen
      name='createGroup'
      component={CreateGroup}
      options={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerTitle() {
          return <TitleCreateGroup>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >{lang.createGroup}</TitleText>
          </TitleCreateGroup>
        },
        presentation: "modal",
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
      }}
    />
    <Stack.Screen
      name="channel"
      component={Channel}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="userLookup"
      component={UserLookup}
      options={{

        headerStyle: {
          backgroundColor: headerColor,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <TitleText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            {lang.info}
          </TitleText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="groupLookup"
      component={GroupLookup}
      options={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerShown: false,
        headerStyle: {
          backgroundColor: headerColor
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name='editGroup'
      component={EditGroup}
      options={{
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerTitleAlign: "center",

        headerStyle: {
          backgroundColor: headerColor,
        },
        headerTitle() {
          return <TitleText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
            $color="white"
          >
            {lang.edit}
          </TitleText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="memberLookup"
      component={MemberLookup}
      options={{

        headerStyle: {
          backgroundColor: headerColor,
        },

        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <TitleText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
            $color="white"
          >
            {lang.manageMember}
          </TitleText>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="addMember"
      component={AddMember}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <Container>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >
              {lang.addMember}
            </TitleText>
          </Container>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="addMemberConfirm"
      component={AddMemberConfirm}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <Container>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >
              {lang.addMember}
            </TitleText>
          </Container>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="invite"
      component={Invite}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <Container>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >
              {lang.invite}
            </TitleText>
          </Container>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="inviteConfirm"
      component={InviteConfirm}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <Container>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >
              {lang.invite}
            </TitleText>
          </Container>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="chooseLanguage"
      component={ChooseLanguage}
      options={{
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle() {
          return <Container>
            <TitleText
              font={[Montserrat_700Bold, "Montserrat_700Bold"]}
              $size={"20px"}
              $color="white"
            >
              {lang.chooseLanguage}
            </TitleText>
          </Container>
        },
        animation: Platform.OS === "android" ? "slide_from_right" : "default"
      }}
    />
    <Stack.Screen
      name="communityScreen"
      component={Community}
    />
  </Stack.Navigator>
}
