import { useRoute } from "@react-navigation/native";
import { useAppSelector } from "../../store/store";
import { ProfilePictureContainer } from "../css/user.css";
import { FontAwesome } from "@expo/vector-icons"
import { TitleText } from "../../Components/FText";
import { Container, Group } from "../css/lookup.css";

export default function UserLookup() {
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const user = useAppSelector(state => state.users[+route.params.id])

  return <Container>
    <ProfilePictureContainer $size="100px">
      <FontAwesome name="user" size={50} color="black" />
    </ProfilePictureContainer>
    <Group>
      <TitleText $color="white" $size="24px">{user.surname} {user.name}</TitleText>
      <TitleText $color="white" $size="16px">{user.email}</TitleText>
    </Group>
  </Container>
}
