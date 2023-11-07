import { FText } from "../Components/FText";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { trpc } from "../utils/trpc";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import {
  Group,
  InfoContainer,
  ProfilePictureContainer,
  UserContainer,
} from "./css/user.css";
import { FontAwesome } from "@expo/vector-icons";
import { Channel as IChannel, addChannel } from "../store/slices/channelsSlice";
import { Me, set } from "../store/slices/meSlice";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useEffect, useState } from "react";
import { addUsers } from "../store/slices/usersSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import styled from "styled-components/native";
import { setPositions } from "../store/slices/notificationSlice";
import CreateGroup from "../Components/CreateGroup";
import { langData } from "../data/lang/lang";

const Stack = createNativeStackNavigator();

interface Props {
  navigation: NavigationProp<any>;
}

export default function ChannelList({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const route = useRoute<{
    params: { id: string } | undefined;
    key: string;
    name: string;
  }>();
  const channels = trpc.channel.retrieveRecentChannel.useQuery(undefined, {
    staleTime: 0,
  });
  const meQuery = trpc.user.me.useQuery(undefined, {
    staleTime: 0,
  })
  const me = useAppSelector((state) => state.me);
  const users = useAppSelector((state) => state.users);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUsers = trpc.user.retrieve.useMutation({
    onSuccess(data) {
      dispatch(addUsers(data));
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!isLoading || !channels.data) return;

    dispatch(setPositions(channels.data.map((channel) => channel.id)));

    const toFetch: number[] = [];

    channels.data.forEach((channel) => {
      dispatch(addChannel(channel));

      // fetch users
      for (const id of channel.users) {
        if (users[id]) continue;

        toFetch.push(id);
      }
    });

    fetchUsers.mutate(toFetch);
  }, [channels]);

  useEffect(() => {
    if (!route.params?.id) return;

    navigation.navigate("channel", {
      id: route.params.id,
    });
  });

  useEffect(() => {
    if (me !== null) return;

    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        dispatch(
          set({
            ...jwtDecode(token),
            token,
          })
        );
      }
    });

    if (meQuery.data) {
      // dispatch(set({
      //   ...me,
      //   ...meQuery.data,
      // }));
    }
  }, [meQuery]);

  if (isLoading) return <></>;

  return <Stack.Navigator initialRouteName="channelList">
    <Stack.Screen
      name="channelList"
      component={List}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
}

const Container = styled.View`
  height: 100%;
  background-color: white;
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  position: fixed;
  bottom: 0;
  //margin: 50px 0 0 0;
  padding: 20px 10px 0 10px;
`

function List() {
  const channels = useAppSelector((state) => {
    return state.notification.positions.map(id => state.channels[id])
  });
  const me = useAppSelector((state) => state.me);
  const navigation = useNavigation<any>();

  const onChannelPress = (id: number) => {
    navigation.navigate("channel", {
      id: id,
    });
  };

  return <Container>
    <FlatList
      data={channels}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity onPress={() => onChannelPress(item.id)}>
            <ChannelItem item={item} me={me} />
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id.toString()}
      />
      <CreateGroup/>
  </Container>
}

interface ChannelProps {
  item: IChannel;
  me: Me | null;
}

function ChannelItem({ item, me }: ChannelProps) {
  const notification = useAppSelector((state) => state.notification.notifications[item.id]);
  const lang = useAppSelector(state => langData[state.language].groupLookup);

  const user = useAppSelector(
    (state) => state.users[item.users.find((id) => id !== me?.id) || ""]
  );

  return (
    <UserContainer style={{ flex: 1 }} disabled>
      <ProfilePictureContainer>
        <FontAwesome name="user" size={24} />
      </ProfilePictureContainer>
      <InfoContainer>
        <Group>
          <Group style={{ height: "100%", flexDirection: "column", alignItems: "flex-start" }}>
            <FText $size="18px" $color="#202E44" font={[Montserrat_700Bold, "Montserrat_700Bold"]}>
              {item.type === "group" ? item.title : `${user.surname} ${user.name}`}
            </FText>
            <FText $size="15px" $color="#202E44">
              {item.type === "group" ? `${item.users.length} ${lang.member}` : user.email}
            </FText>
          </Group>
          <Group>
            <FText>{notification}
          </FText>
          </Group>
        </Group>
      </InfoContainer>
    </UserContainer>
  );
}
