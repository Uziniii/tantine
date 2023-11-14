import { NavigationProp, useRoute } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { InfoContainer, ProfilePictureContainer, UserContainer } from "../css/user.css";
import { FontAwesome, Feather } from "@expo/vector-icons"
import { FText } from "../../Components/FText";
import { Container, Group } from "../css/lookup.css";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { Alert, Dimensions, View } from "react-native";
import { useLayoutEffect } from "react";
import { langData } from "../../data/lang/lang";
import { Button } from "../css/auth.css";
import { trpc } from "../../utils/trpc";
import { removeChannelNotification } from "../../store/slices/notificationSlice";
import { removeChannel } from "../../store/slices/channelsSlice";
import styled from 'styled-components';

const { width } = Dimensions.get("window")

interface Props {
  navigation: NavigationProp<any>
}

const ButtonEdit = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #334055;
  display: flex;
  align-items: center;
  justify-content:center;
`

export default function GroupLookup({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].groupLookup)
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const group = useAppSelector(state => state.channels[route.params.id])
  const me = useAppSelector(state => state.me)
  const deleteGroup = trpc.channel.group.delete.useMutation({
    onSuccess(_, variables) {
      dispatch(removeChannelNotification(+variables.channelId))
      dispatch(removeChannel(+variables.channelId))
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'home' }], // replace 'ChannelList' with the name of your screen
      });
    }
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (group !== undefined && group.type === "group" && me !== null && group.authorId !== me.id) return null

        return <View>
          <ButtonEdit onPress={
            () => navigation.navigate("editGroup", { id: route.params.id })
          }>
            <Feather name="edit" size={18} color={"white"} />
          </ButtonEdit>
        </View>
      }
    })
  })

  if (group === undefined) return null
  if (group.type !== "group" || me === null) return null

  const onUserPress = (id: number) => {
    navigation.navigate("memberLookup", { 
      id: id.toString(), 
      channelId: route.params.id
    })
  }
  
  const onAddPress = () => {
    navigation.navigate("addMember", {
      id: route.params.id
    })
  }

  const createConfirmAlert = () => {
    Alert.alert(lang.deleteGroupAlertTitle, lang.deleteGroupAlertMessage, [
      {
        text: lang.cancel,
        style: "cancel",
      },
      {
        text: lang.confirm,
        onPress() {
          deleteGroup.mutate({
            channelId: route.params.id
          })
        },
        style: "destructive",
      }
    ])
  }

  return <>
    <Container>
      <ProfilePictureContainer $size="100px">
        <FontAwesome name="group" size={50} color="black" />
      </ProfilePictureContainer>
      <Group>
        <FText $color="white" $size="24px">{group.title}</FText>
        <FText $color="white" $size="16px">{group.users.length} {group.users.length <= 1 ? lang.member : `${lang.member}s`}</FText>
      </Group>
      {group.authorId === me.id && <>
        <Button onPress={onAddPress} $width={`${width * 0.8}px`}>
          <FText>{lang.addMembers}</FText>
        </Button>
        <Button onPress={createConfirmAlert} $width={`${width * 0.8}px`} $background="red">
          <FText $color="white">{lang.deleteGroupButton}</FText>
        </Button>
      </>}
    </Container>
    <FlatList
      style={{
        marginTop: 24,
      }}
      data={group.users}
      renderItem={({ item }) => {
        return <TouchableOpacity onPress={() => onUserPress(item)}>
          <User item={item}/>
        </TouchableOpacity> 
      }}
      keyExtractor={item => item.toString()}
    />
  </>
}

interface UserProps {
  item: number;
}

function User ({ item }: UserProps) {
  const user = useAppSelector(state => state.users[item])

  return <UserContainer style={{ flex: 1 }} disabled>
    <ProfilePictureContainer>
      <FontAwesome name="user" size={24} />
    </ProfilePictureContainer>
    <InfoContainer>
      <FText $color="white" $size="18px" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{user.surname} {user.name}</FText>
      <FText $color="white">{user.email}</FText>
    </InfoContainer>
  </UserContainer>
}
