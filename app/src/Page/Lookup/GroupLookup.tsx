import { NavigationProp, useRoute } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { InfoContainer, ProfilePictureContainer, UserContainer } from "../css/user.css";
import { FontAwesome, Feather } from "@expo/vector-icons"
import { FText } from "../../Components/FText";
import { Container, Group } from "../css/lookup.css";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { Alert, Dimensions, View } from "react-native";
import { langData, replace } from "../../data/lang/lang";;
import { trpc } from "../../utils/trpc";
import styled from 'styled-components/native';
import GroupInfo from "../../Components/GroupInfo";

const { width } = Dimensions.get("window")

interface Props {
  navigation: NavigationProp<any>
}

const ContainerHeader = styled.View`
  width: 100%;
  height: 300px;
`;

const ButtonEdit = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #334055;
  display: flex;
  align-items: center;
  justify-content:center;
`

const ContainerAddTitle = styled.View`
  padding: 50px 0 0 10px;
`;

export default function GroupLookup({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].groupLookup)
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const group = useAppSelector(state => state.channels[route.params.id])
  const me = useAppSelector(state => state.me)

  const turnWheel = trpc.channel.group.turnTheWheel.useMutation()

  if (group === undefined) return null
  if (group.type !== "group" || me === null) return null

  const onUserPress = (id: number) => {
    navigation.navigate("memberLookup", { 
      id: id.toString(), 
      channelId: route.params.id
    })
  }

  // const onAddPress = () => {
  //   navigation.navigate("addMember", {
  //     id: route.params.id
  //   })
  // }

  // const onPressTurnWheel = async () => {
  //   const winner = await turnWheel.mutateAsync({
  //     channelId: route.params.id
  //   })

  //   Alert.alert(
  //     lang.winnerPopup.title,
  //     replace(lang.winnerPopup.message, `${users[winner].surname} ${users[winner].name}`),
  //     [{
  //       text: "OK",
  //     }]
  //   )
  // }

  return <>
    <GroupInfo
      type={group.authorId === me.id || group.admins.includes(me.id) ? "admin" : "user"}
      channelId={route.params.id}
    />
    <Container $marginTop={100}>
      <ProfilePictureContainer $size="100px">
        <FontAwesome name="group" size={50} color="black" />
      </ProfilePictureContainer>
      <Group>
        <FText $color="white" $size="24px">{group.title}</FText>
        <FText $color="white" $size="16px">{group.users.length} {group.users.length <= 1 ? lang.member : `${lang.member}s`}</FText>
      </Group>
    </Container>
    <ContainerAddTitle>
      <FText $color="white" $size="18px">Utilisateur ajoutés</FText>
    </ContainerAddTitle>
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
