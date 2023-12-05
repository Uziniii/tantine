import styled from 'styled-components/native';
import { FText } from './FText';
import { useAppDispatch, useAppSelector } from '../store/store';
import { langData } from '../data/lang/lang';
import { Alert } from 'react-native';
import { trpc } from '../utils/trpc';
import { removeChannelNotification } from '../store/slices/notificationSlice';
import { removeChannel } from '../store/slices/channelsSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const ShowGroupInfoContainer = styled.View`
  width: 220px;
  padding: 8px;
  margin:90px 60px 0 0;
  z-index: 1;
  position: absolute;
  right: 0;
  background-color: #333541;
  border-top-left-radius:12px;
  border-bottom-left-radius:12px;
  border-bottom-right-radius:12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Button = styled.TouchableOpacity`
  width: 100%;
  height: 40px;
  border-top-left-radius:12px;
  border-bottom-left-radius:12px;
  border-bottom-right-radius:12px;
  background-color: #333541;
  padding: 7px 5px 7px 10px;
`;

type Props = {
  type: string;
  channelId: string;
}

export default function ShowGroupInfo({ type, channelId }: Props) {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].groupLookup)

  const deleteGroup = trpc.channel.group.delete.useMutation({
    onSuccess(_, variables) {
      dispatch(removeChannelNotification(+variables.channelId))
      dispatch(removeChannel(+variables.channelId))

      navigation.reset({
        index: 0,
        routes: [{ name: "home" }],
      });
    }
  })

  const quitGroup = trpc.channel.group.quit.useMutation()

  const onQuitGroupPress = () => {
    Alert.alert(lang.quitAlert.title, lang.quitAlert.message, [
      {
        text: lang.cancel,
        style: "cancel",
      },
      {
        text: lang.quitAlert.quitConfirm,
        async onPress() {
          await quitGroup.mutateAsync({
            channelId
          })

          navigation.goBack()
          navigation.goBack()
        },
        style: "destructive",
      }
    ])
  }

  const createDeleteConfirmAlert = () => {
    Alert.alert(lang.deleteGroupAlertTitle, lang.deleteGroupAlertMessage, [
      {
        text: lang.cancel,
        style: "cancel",
      },
      {
        text: lang.deleteConfirm,
        onPress() {
          deleteGroup.mutate({
            channelId
          })
        },
        style: "destructive",
      }
    ])
  }

  const onInvitePress = () => {
    navigation.navigate("invite", {
      id: channelId
    })
  }

  return type === 'admin' ? (
    <ShowGroupInfoContainer>
      <Button onPress={onInvitePress}><FText $color='white'>{lang.invite}</FText></Button>
      <Button onPress={createDeleteConfirmAlert}><FText $color='white'>{lang.deleteGroupButton}</FText></Button>
		</ShowGroupInfoContainer>
	) : (
    <ShowGroupInfoContainer>
      <Button onPress={onQuitGroupPress}><FText $color='white'>{lang.quitGroup}</FText></Button>
    </ShowGroupInfoContainer>
  )
}
