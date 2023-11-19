import { NavigationProp, useRoute } from "@react-navigation/native"
import { useAppSelector } from "../../../../store/store"
import { View } from "react-native"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { ChannelItem } from "./Invite"
import { useLayoutEffect, useState } from "react"
import { TextInput } from "../../../../utils/formHelpers"
import { langData } from "../../../../data/lang/lang"
import { FText } from "../../../../Components/FText"
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { trpc } from "../../../../utils/trpc"

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
  const lang = useAppSelector(state => langData[state.language].inviteConfirm)
  const route = useRoute<Route>()
  const group = useAppSelector(state => state.channels[+route.params.id])
  const channels = useAppSelector(state => {
    const channelsToAdd = Object.entries(route.params.addedChannels)
      .filter(([_, val]) => val)
      .map(([key, _]) => +key)

    return [...channelsToAdd.map(id => state.channels[id]), route.params.addedUsers]
  })
  const [input, setInput] = useState("")

  const sendMessage = trpc.channel.message.create.useMutation()

  const onSendPress = async () => {
    for (const channel of channels) {
      sendMessage.mutate({
        channelId: channel.id,
        content: input,
        nonce: 0,
        invite: +route.params.id,
      })
    }

    navigation.goBack()
    navigation.goBack()
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <TouchableOpacity onPress={onSendPress}>
          <FText font={[Montserrat_700Bold, "Montserrat_700Bold"]} $color="#007aff">
            {lang.send}
          </FText>
        </TouchableOpacity> 
      }
    })
  })

  if (group.type !== "group") return null

  return <View style={{ flex: 1, alignItems: "center" }}>
    <TextInput
      placeholder={lang.messagePlaceholder}
      multiline
      style={{
        marginTop: 20,
        maxHeight: 200,
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
      renderItem={({ item }) => <ChannelItem viewMode item={item} addedChannels={route.params.addedChannels} setAddedChannels={undefined} />}
      keyExtractor={item => item.id.toString()}
    />
  </View>
}
