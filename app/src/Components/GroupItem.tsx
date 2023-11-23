import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "../Page/css/user.css";
import { useAppSelector } from "../store/store";
import { FText } from "./FText";
import { FontAwesome } from "@expo/vector-icons";
import { langData } from "../data/lang/lang";

interface Props {
  item: {
    id: number;
    users: number[];
    title?: string | undefined;
  }
}

export default function GroupItem ({ item }: Props) {
  const lang = useAppSelector(state => langData[state.language].groupLookup)

  if (!item.title) return null
  
  const onGroupPress = () => {
    
  }

  return <UserContainer onPress={onGroupPress} style={{ flex: 1, paddingTop: 40 }}>
    <ProfilePictureContainer>
      <FontAwesome name="group" size={24} />
    </ProfilePictureContainer>
    <InfoContainer>
      <Group style={{ height: "100%", flexDirection: "column", alignItems: "flex-start" }}>
        <FText $size="18px" $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
          {item.title}
        </FText>
        <FText $size="15px" $color="white">
          {`${item.users.length} ${item.users.length <= 1 ? lang.member : `${lang.member}s`}`}
        </FText>
      </Group>
    </InfoContainer>
  </UserContainer>
}
