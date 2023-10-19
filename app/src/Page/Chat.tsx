import { Text, View, VirtualizedList } from "react-native";
import { FText } from "../Components/FText";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { trpc } from "../utils/trpc";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Group, InfoContainer, ProfilePictureContainer, UserContainer } from "./css/user.css";
import { FontAwesome } from '@expo/vector-icons'; 
import { Channel as IChannel, addChannel } from "../store/slices/channelsSlice";
import { Me } from "../store/slices/meSlice";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();

interface Props {
  navigation: NavigationProp<any>
}

export default function Chat ({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute<{ params: { id: string } | undefined, key: string, name: string }>()
  const channels = trpc.channel.retrieveRecentChannel.useQuery(undefined, {
    staleTime: 0,
  })
  const users = useAppSelector(state => state.users)
  const fetchUsers = trpc.user.retrieve.useMutation()

  useEffect(() => {
    if (!channels.data) return

    channels.data.forEach(channel => {
      dispatch(addChannel(channel))
    })

    
  }, [channels])

  useEffect(() => {
    if (!route.params?.id) return

    navigation.navigate("channel", {
      id: route.params.id,
    })
  })

  return <Stack.Navigator initialRouteName="channelList">
    <Stack.Screen
      name="channelList"
      component={ChannelList}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
}

function ChannelList () {
  const channel = useAppSelector(state => Object.values(state.channels))
  const me = useAppSelector(state => state.me)
  const navigation = useNavigation<any>()

  return <FlatList
    data={channel}
    renderItem={({ item }) => {
      return <TouchableOpacity onPress={() => {
        navigation.navigate("channel", {
          id: item.id,
        })
      }}>
        <ChannelItem item={item} me={me} />
      </TouchableOpacity>
    }}
    keyExtractor={(item) => item.id.toString()}
  />
}

interface ChannelProps {
  item: IChannel
  me: Me | null
}

function ChannelItem ({ item, me }: ChannelProps) {
  if (item.type === "group") {
    return <UserContainer style={{ flex: 1 }} disabled>
      <ProfilePictureContainer>
        <FontAwesome name="user" size={24} />
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <FText>{item.title}</FText>
        </Group>
      </InfoContainer>
    </UserContainer>
  }

  const user = useAppSelector(state => state.users[item.users.find(id => id !== me?.id) || ""])

  return <UserContainer style={{ flex: 1 }} disabled>
    <ProfilePictureContainer>
      <FontAwesome name="user" size={24} />
    </ProfilePictureContainer>
    <InfoContainer>
      <Group style={{ height: "100%" }}>
        <FText $size="18px" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>{user.surname} {user.name}</FText>
      </Group>
    </InfoContainer>
  </UserContainer>
}
