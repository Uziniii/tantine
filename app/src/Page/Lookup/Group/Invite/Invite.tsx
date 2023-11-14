import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { NavigationProp, useRoute } from "@react-navigation/native"
import { useLayoutEffect, useState } from "react"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { FText } from "../../../../Components/FText"
import { useAppSelector } from "../../../../store/store"
import { langData } from "../../../../data/lang/lang"
import { View } from "react-native"
import { SearchInput } from "../Add/AddMember"
import { Channel } from "../../../../store/slices/channelsSlice"
import GroupItem from "../../../../Components/GroupItem"
import UserItem from "../../../../Components/UserItem"
import { InfoContainer, ProfilePictureContainer, UserContainer } from "../../../css/user.css"
import { Group } from "../../../css/lookup.css"
import { FontAwesome } from "@expo/vector-icons"

interface Props {
  navigation: NavigationProp<any>
}

export default function Invite({ navigation }: Props) {
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const [addedChannels, setAddedChannels] = useState<Record<number, boolean>>({})
  const lang = useAppSelector(state => langData[state.language].addMember)
  const [search, setSearch] = useState("")
  const channels = useAppSelector((state) => {
    return state.notification.positions.map(id => state.channels[id])
  });

  const onNextPress = () => {
    const channelsToAdd = Object.entries(addedChannels)
      .filter(([_, val]) => val)

    if (channelsToAdd.length === 0) return

    navigation.navigate("addMemberConfirm", {
      id: route.params.id,
      addedChannels,
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <TouchableOpacity onPress={onNextPress}>
          <FText font={[Montserrat_700Bold, "Montserrat_700Bold"]} $color="#007aff">{lang.next}</FText>
        </TouchableOpacity>
      }
    })
  })

  return <View>
    <SearchInput
      placeholder={lang.search}
      onChangeText={setSearch}
      value={search}
    />
    <FlatList
      style={{
        marginTop: 20
      }}
      contentInsetAdjustmentBehavior="automatic"
      data={channels}
      renderItem={({ item }) => <Item item={item} addedChannels={addedChannels} setAddedChannels={setAddedChannels} />}
      keyExtractor={item => item.id.toString()}
    />
  </View>;
}

interface ItemProps {
  item: Channel
  addedChannels: Record<number, boolean>
  setAddedChannels: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}

function Item ({ item, addedChannels, setAddedChannels }: ItemProps) {
  const lang = useAppSelector(state => langData[state.language].groupLookup)

  const onAdd = () => {
    setAddedChannels(val => ({
      ...val,
      [item.id]: !val[item.id]
    }))
  }

  if (item.type === "group") {
    return <UserContainer onPress={onAdd} style={{ flex: 1 }}>
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

  const user = useAppSelector(state => {
    const meId = state.me?.id

    if (!meId) return undefined

    const user = item.users.find(id => id !== meId)

    if (!user) return undefined

    return state.users[user]
  })

  if (user === undefined) return null

  return <UserItem strong theme="dark" groupMode addedUsers={addedChannels} userPress={onAdd} item={user} />
}
