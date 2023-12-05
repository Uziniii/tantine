import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import { FText } from "../../../../Components/FText"
import { langData } from "../../../../data/lang/lang"
import { Channel } from "../../../../store/slices/channelsSlice"
import { useAppSelector } from "../../../../store/store"
import { Radio, VerticalGroup } from "../../../css/search.css"
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "../../../css/user.css"
import UserItem from "../../../../Components/UserItem"
import { FontAwesome } from '@expo/vector-icons'

interface ViewModeItemProps {
  viewMode: true
  groupMode?: boolean
  item: Channel
  addedChannels: Record<number, boolean>
  setAddedChannels: undefined
}

interface NoViewModeItemProps {
  viewMode?: false
  groupMode?: boolean
  item: Channel
  addedChannels: Record<number, boolean>
  setAddedChannels: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}

type ItemProps = ViewModeItemProps | NoViewModeItemProps

export function ChannelItem({ viewMode, item, addedChannels, setAddedChannels, groupMode }: ItemProps) {
  const lang = useAppSelector(state => langData[state.language].groupLookup)

  const onAdd = () => {
    if (viewMode) return

    setAddedChannels(val => ({
      ...val,
      [item.id]: !val[item.id]
    }))
  }

  if (item.type === "group") {
    return <UserContainer onPress={onAdd} style={{ flex: 1 }}>
      <InfoContainer style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <VerticalGroup>
          <ProfilePictureContainer>
            <FontAwesome name="group" size={24} />
          </ProfilePictureContainer>
          <Group style={{ height: "100%", flexDirection: "column", alignItems: "flex-start" }}>
            <FText $size="18px" $color="white" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
              {item.title}
            </FText>
            <FText $size="15px" $color="white">
              {`${item.users.length} ${item.users.length <= 1 ? lang.member : `${lang.member}s`}`}
            </FText>
          </Group>
        </VerticalGroup>
        {groupMode && (
          <VerticalGroup>
            <Radio style={{
              backgroundColor: addedChannels[item.id] ? "#202E44" : undefined,
            }}>
              {addedChannels[item.id] && <FontAwesome name="check" color={"white"} size={16} />}
            </Radio>
          </VerticalGroup>
        )}
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

  return <UserItem
    strong
    groupMode={viewMode ? undefined : true}
    theme="dark"
    addedUsers={{
      [user.id]: addedChannels[item.id]
    }}
    userPress={onAdd}
    item={user}
  />
}
