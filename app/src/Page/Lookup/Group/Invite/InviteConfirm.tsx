import { NavigationProp, useRoute } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { View } from "react-native"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { useLayoutEffect, useState } from "react"
import { SearchInput } from "../Add/AddMember"
import { langData } from "../../../../data/lang/lang"
import { TitleText } from "../../../../Components/FText"
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { trpc } from "../../../../utils/trpc"
import Loading from "../../../../Components/Loading"
import { addChannel } from "../../../../store/slices/channelsSlice"
import { ChannelItem } from "./ChannelItem"

interface Props {
  navigation: NavigationProp<any>
}

interface Route {
  params: {
    id: string;
    addedChannels: Record<number, boolean>;
    addedUsers: Record<number, boolean>;
  };
  key: string;
  name: string;
}

export default function InviteConfirm({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const lang = useAppSelector(state => langData[state.language].inviteConfirm)
  const route = useRoute<Route>()
  const group = useAppSelector(state => state.channels[+route.params.id])
  const channels = useAppSelector(state => {
    const channelsToAdd = Object.entries(route.params.addedChannels)
      .filter(([_, val]) => val)
      .map(([key, _]) => state.channels[key])

    const addedUsers = []//Object.entries(route.params.addedUsers)
    // .filter(([_, val]) => val)
    // .map(([key, _]) => state.users[key])

    return [...channelsToAdd, ...addedUsers]
  })
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  const sendMessage = trpc.channel.message.create.useMutation()
  const createMessage = trpc.channel.create.useMutation()

  const onSendPress = async () => {
    setSending(true)

    for (const channel of channels) {
      if (Array.isArray(channel)) {
        const newChannel = await createMessage.mutateAsync(channel[0].id)

        dispatch(addChannel(newChannel))

        sendMessage.mutate({
          channelId: newChannel.id,
          content: input,
          nonce: 0,
          invite: +route.params.id,
        })

        continue
      }

      sendMessage.mutate({
        channelId: channel.id,
        content: input,
        nonce: 0,
        invite: +route.params.id,
      })
    }

    navigation.goBack()
    navigation.goBack()

    setSending(false)
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <TouchableOpacity onPress={onSendPress}>
          <TitleText font={[Montserrat_700Bold, "Montserrat_700Bold"]} $color="#007aff">
            {lang.send}
          </TitleText>
        </TouchableOpacity>
      }
    })
  })

  if (sending) return <Loading />
  if (group.type !== "group") return null

  return <View style={{ flex: 1, alignItems: "center" }}>
    <SearchInput
      placeholderTextColor={"gray"}
      placeholder={lang.messagePlaceholder}
      // multiline
      style={{
        marginTop: 20,
        maxHeight: 200,
        color: "white",
      }}
      $width="95%"
      value={input}
      onChangeText={setInput}
    />
    <FlatList
      style={{
        marginTop: 20,
        width: "100%",
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={channels}
      renderItem={({ item }) => {
        return <ChannelItem viewMode item={item} addedChannels={{}} setAddedChannels={undefined} />
      }}
      keyExtractor={item => {
        return item.id.toString()
      }}
    />
  </View>
}
