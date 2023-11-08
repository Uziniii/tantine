import { Radio, VerticalGroup } from "../Page/css/search.css";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "../Page/css/user.css";
import { FontAwesome } from '@expo/vector-icons'
import { FText } from "./FText";

interface IUser {
  id: number,
  name: string,
  surname: string,
  email: string,
}

interface BasicProps {
  item: IUser,
  userPress: (id: number) => void,
}

interface NormalProps extends BasicProps {
  groupMode: false,
  addedUsers: undefined,
}

interface GroupModeProps extends BasicProps {
  groupMode: true,
  addedUsers: Record<number, boolean>,
}

type Props = NormalProps | GroupModeProps

export default function UserItem({ item, addedUsers, groupMode, userPress }: Props) {
  return <UserContainer style={{ justifyContent: "space-between" }} onPress={() => userPress(item.id)}>
    <VerticalGroup>
      <ProfilePictureContainer>
        <FontAwesome name="user" size={24} />
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <FText $color="white">{item.surname} {item.name}</FText>
        </Group>
        <FText $color="white">{item.email}</FText>
      </InfoContainer>
    </VerticalGroup>
    {groupMode && <VerticalGroup>
      <Radio style={{
        backgroundColor: addedUsers[item.id] ? "#575bfd" : undefined,
      }}>
        {addedUsers[item.id] && <FontAwesome name="check" color="white" size={16} />}
      </Radio>
    </VerticalGroup>}
  </UserContainer>
}
