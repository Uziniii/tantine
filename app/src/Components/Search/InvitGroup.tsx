import styled from 'styled-components/native';
import { FText } from '../FText';
import { Button } from '../../Page/css/auth.css';
import { ProfilePictureContainer } from '../../Page/css/user.css';
import { FontAwesome } from "@expo/vector-icons";
import { Dimensions } from 'react-native';
import { useAppSelector } from '../../store/store';
import { langData } from '../../data/lang/lang';
import GetUserPictureProfil from '../GetUserPictureProfil';

const { width } = Dimensions.get("screen")

interface Props {
  onClose: () => void;
  onJoinPress: () => void;
  group: {
    id: number;
    title: string;
  }
}

const Container = styled.View`
  width:100%;
  height:300px;
  border-top-left-radius:30px;
  border-top-right-radius:30px;
  display:flex;
  align-items:center;
  background-color:#333541;
  position:fixed;
  bottom:0;
  flex-direction:column;
  justify-content:center;
  //border:solid 2px #D4B216;
  border-bottom-width:0;
  gap:30px;
`;

const CloseContainer = styled.View`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  margin-right: 50px;
`

export default function Invite({ onClose, onJoinPress, group }: Props) {
  const lang = useAppSelector(state => langData[state.language].joinRequestPopup)

  return (
    <Container>
      <CloseContainer>
        <FontAwesome size={16} color={"white"} name='close' onPress={onClose} />
      </CloseContainer>
      <ProfilePictureContainer>
        <GetUserPictureProfil id={group.id} type='group'/>
      </ProfilePictureContainer>
      <FText $color='white'>{group.title}</FText>
      <Button
        $background='#24252D'
        $width={width * 0.8 + 'px'}
        onPress={onJoinPress}
      >
        <FText $color='white'>{lang}</FText>
      </Button>
    </Container>
  );
}
