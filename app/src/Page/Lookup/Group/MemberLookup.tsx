import { NavigationProp, useRoute } from "@react-navigation/native"
import { useAppSelector } from "../../../store/store"
import { Container, Group } from "../../css/lookup.css"
import { ProfilePictureContainer } from "../../css/user.css"
import { TitleText } from "../../../Components/FText"
import { FontAwesome } from '@expo/vector-icons'
import { Button } from "../../css/auth.css"
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { langData } from "../../../data/lang/lang"
import { Dimensions } from "react-native"
import { trpc } from "../../../utils/trpc"
import { useMemo } from "react"
import GetUserPictureProfil from "../../../Components/GetUserPictureProfil"

const width = Dimensions.get("window").width

interface Props {
  navigation: NavigationProp<any>
}

export default function MemberLookup({ navigation }: Props) {
  const lang = useAppSelector(state => langData[state.language].memberLookup)
  const route = useRoute<{ params: { id: string, channelId: string }, key: string, name: string }>()
  const user = useAppSelector(state => state.users[+route.params.id])
  const group = useAppSelector(state => state.channels[+route.params.channelId])
  const isAdmin = useMemo(() => {
    if (user === undefined || group.type !== "group") return false

    return group.admins.includes(user.id)
  }, [user, group])
  const me = useAppSelector(state => state.me)
  const removeMember = trpc.channel.group.removeMember.useMutation({
    onSuccess() {
      navigation.goBack()
    }
  })
  const putAdmin = trpc.channel.group.putAdmin.useMutation()

  if (group.type !== "group" || me === null) return null

  const onRemovePress = () => {
    removeMember.mutate({
      channelId: +route.params.channelId,
      memberId: +route.params.id,
    })
  }

  const onPutAdminPress = () => {
    if (putAdmin.isLoading) return

    putAdmin.mutate({
      channelId: +route.params.channelId,
      memberId: +route.params.id,
    })
  }

  const onRemoveAdminPress = () => {

  }

  return <Container>
    <Group>
      <TitleText $color="white" $size="24px">
        {group.authorId === user.id
          ? lang.author
          : (
            isAdmin
              ? lang.admin
              : lang.member
          )}
      </TitleText>
    </Group>
    <ProfilePictureContainer $margin="0px" $size="200px">
      <GetUserPictureProfil id={user.id} type="user" />
    </ProfilePictureContainer>
    <Group>
      <TitleText $color="white" $size="24px">{user.surname} {user.name}</TitleText>
      <TitleText $color="white" $size="16px">{user.email}</TitleText>
    </Group>
    {user.id !== me.id && (
      <Button $width={`${width * 0.8}px`}>
        <TitleText $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{lang.sendMessage}</TitleText>
      </Button>
    )}
    {(group.authorId === me.id && user.id !== me.id) && (
      <Button onPress={isAdmin ? onRemoveAdminPress : onPutAdminPress} $width={`${width * 0.8}px`}>
        <TitleText $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
          {isAdmin ? lang.removeAdmin : lang.putAdmin}
        </TitleText>
      </Button>
    )}
    {(group.authorId !== user.id && user.id !== me.id && group.admins.includes(me.id)) && (
      <Button onPress={onRemovePress} $background="red" $width={`${width * 0.8}px`}>
        <TitleText $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{lang.remove}</TitleText>
      </Button>
    )}
  </Container>
}
