import { NavigationProp, useRoute } from "@react-navigation/native";
import { useAppSelector } from "../../store/store";
import { InfoContainer, ProfilePictureContainer, UserContainer } from "../css/user.css";
import { FontAwesome, Feather } from "@expo/vector-icons"
import { FText } from "../../Components/FText";
import { Container, Group } from "../css/lookup.css";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { View } from "react-native";
import { useLayoutEffect } from "react";

interface Props {
  navigation: NavigationProp<any>
}

export default function GroupLookup({ navigation }: Props) {
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const group = useAppSelector(state => state.channels[route.params.id])
  const me = useAppSelector(state => state.me)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <View>
          <TouchableOpacity onPress={
            () => navigation.navigate("editGroup", { id: route.params.id })
          }>
            <Feather name="edit" size={24} color={"#007aff"} />
          </TouchableOpacity>
        </View>
      }
    })
  })

  if (group.type !== "group" || me === null) return null

  const onUserPress = (id: number) => {
    
  }
  
  return <>
    <Container>
      <ProfilePictureContainer $size="100px">
        <FontAwesome name="group" size={50} color="black" />
      </ProfilePictureContainer>
      <Group>
        <FText $size="24px">{group.title}</FText>
        <FText $size="16px">{group.users.length} membres</FText>
      </Group>
    </Container>
    <FlatList
      style={{
        borderTopWidth: 1,
        borderTopColor: "#ccc",
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
      <FText $size="18px" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{user.surname} {user.name}</FText>
      <FText>{user.email}</FText>
    </InfoContainer>
  </UserContainer>
}
