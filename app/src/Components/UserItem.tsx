import { Radio, VerticalGroup } from "../Page/css/search.css";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "../Page/css/user.css";
import { FontAwesome } from '@expo/vector-icons'
import { TitleText } from "./FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import GetUserPictureProfil from "./GetUserPictureProfil";

interface IUser {
  id: number,
  name: string,
  surname: string,
  email: string,
}

interface BasicProps {
  item: IUser,
  userPress: (id: number) => void,
  theme?: "light" | "dark",
  strong?: boolean,
  groupMode?: boolean,
}

interface NormalProps extends BasicProps {
  groupMode?: false,
  addedUsers: undefined,
}

interface GroupModeProps extends BasicProps {
  groupMode?: true,
  addedUsers: Record<number, boolean>,
}

type Props = NormalProps | GroupModeProps

export default function UserItem({ item, addedUsers, groupMode, userPress, theme, strong }: Props) {
  return <UserContainer style={{ justifyContent: "space-between" }} onPress={() => userPress(item.id)}>
    <VerticalGroup>
      <ProfilePictureContainer>
        <GetUserPictureProfil id={item.id} type="user" />
        {/* <FontAwesome name="user" size={24} /> */}
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <TitleText font={strong ? [Montserrat_700Bold, "Montserrat_700Bold"] : undefined} $color={theme === "dark" ? "white" : "black"}>{item.surname} {item.name}</TitleText>
        </Group>
        <TitleText $color={theme === "dark" ? "white" : "black"}>{item.email}</TitleText>
      </InfoContainer>
    </VerticalGroup>
    {groupMode && <VerticalGroup>
      <Radio style={{
        backgroundColor: addedUsers[item.id] ? "#333541" : undefined,
      }}>
        {addedUsers[item.id] && <FontAwesome name="check" color={theme === "dark" ? "white" : "white"} size={16} />}
      </Radio>
    </VerticalGroup>}
  </UserContainer>
}
