import { Group, InfoContainer, UserContainer } from "../Page/css/user.css";
import { FontAwesome } from "@expo/vector-icons";
import { TitleText } from "./FText";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useAppSelector } from "../store/store";
import { Channel as IChannel } from "../store/slices/channelsSlice";
import { langData } from "../data/lang/lang";
import { Me } from "../store/slices/meSlice";
import styled from "styled-components/native";
import GetUserPictureProfil from "./GetUserPictureProfil";

interface ChannelProps {
  item: IChannel;
  me: Me | null;
}

const ContainerPictureProfil = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 99999px;
  /* background-color: white; */
  margin: 0 20px 0 0;
`

const Circle = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background-color: #FF5A5F;
  position: absolute;
  right:0;
  margin:15px 10px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function ChannelItem({ item, me }: ChannelProps) {
  const notification = useAppSelector((state) => state.notification.notifications[item.id]);
  const lang = useAppSelector(state => langData[state.language].groupLookup);

  const user = useAppSelector((state) => {
    if (item.type === "group") return state.users[item.users[0]]

    return state.users[item.users.find((id) => id !== me?.id) || ""]
  });

  return (
    <UserContainer style={{ flex: 1, alignItems: 'center' }} disabled>
      <ContainerPictureProfil>
        <GetUserPictureProfil id={item.type === "private" ? user.id : item.id} type={item.type === "private" ? "user" : "group"} />
      </ContainerPictureProfil>
      <InfoContainer>
        <Group style={{ height: "100%", flexDirection: "column", alignItems: "flex-start" }}>
          <TitleText $size="15px" $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
            {item.type === "group" ? item.title : `${user.surname} ${user.name}`}
          </TitleText>
          <TitleText $size="15px" $color="white">
            {item.type === "group" ? `${item.users.length} ${lang.member}` : user.email}
          </TitleText>
        </Group>
      </InfoContainer>
      {notification === 0 || isNaN(notification) ? null : (
        <Circle>
          <TitleText $color="white">{notification > 9 ? "9+" : notification}</TitleText>
        </Circle>
      )}
    </UserContainer>
  );
}
