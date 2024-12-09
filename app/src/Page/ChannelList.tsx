import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { trpc } from "../utils/trpc";
import { useAppDispatch, useAppSelector } from "../store/store";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { addChannel } from "../store/slices/channelsSlice";
import { set } from "../store/slices/meSlice";
import { useEffect, useState } from "react";
import { addUsers } from "../store/slices/usersSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import styled from "styled-components/native";
import { setPositions } from "../store/slices/notificationSlice";
import ChannelItem from "../Components/ChannelItem";
import Loading from "../Components/Loading";
import { MTitleText, SText } from "../Components/FText";
import { langData } from "../data/lang/lang";
import { GrayGradientFull } from "./css/gradient.css";
import colorCss from "./css/color.css";
import Feather from '@expo/vector-icons/Feather';
import { Image, View } from "react-native";

const noMessagesImage = require("../../assets/no-messages.png")

const Stack = createNativeStackNavigator();

interface Props {
  navigation: NavigationProp<any>;
}

const ContainerTitle = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px 20px 30px;
  border-color: ${colorCss.lightGray};
  border-bottom-width: 1px;
`;

export const TabContentContainer = styled.View`
  width: 100%;
  height: 100%;
  background-color: none;
  border: 1px ${colorCss.lightGray};
  border-top-right-radius: 50px;
  border-top-left-radius: 50px;
  position: fixed;
  bottom: 0;
`

const ContainerPictureProfil = styled.View`
  width: 200px;
  height: 200px;
  background-color:white;
  border-radius: 99999px;
`

const ButtonSearch = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background-color: ${colorCss.gold};
  display: flex;
  align-items: center;
  justify-content:center;
`

export default function ChannelList({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const route = useRoute<{
    params: { id: string } | undefined;
    key: string;
    name: string;
  }>();
  const channels = trpc.channel.retrieveRecentChannels.useQuery(undefined, {
    staleTime: Infinity,
  });
  const meQuery = trpc.user.me.useQuery(undefined, {
    staleTime: Infinity,
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
    if (meQuery.isError && meQuery.error?.data?.code === "UNAUTHORIZED") {
      AsyncStorage.removeItem("token");
      dispatch({ type: "RESET" })
    }

    if (me !== null) return;

    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        dispatch(
          set({
            ...jwtDecode(token),
            token,
            ...(meQuery.data ?? {})
          })
        );
      }
    });
  }, [meQuery]);

  if (isLoading) return <Loading />;

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

function List() {
  const lang = useAppSelector((state) => langData[state.language].channelList);
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

  return <GrayGradientFull colors={[""]}>
    <TabContentContainer>
      <ContainerTitle>
        <MTitleText $color="white" $size="18px">{lang.recentMessage}</MTitleText>
        <ButtonSearch>
          <Feather name="search" size={25} color={colorCss.primaryBg} />
        </ButtonSearch>
      </ContainerTitle>
      {channels.length === 0
        ? <View style={{ flex: 1, alignItems: "center", alignContent: "center", justifyContent: "space-evenly" }}>
          <Image source={noMessagesImage} style={{ width: 200, height: 150 }} />
          <View>
            <SText $color="#E5E5E5" style={{ textAlign: "center" }}>{lang.noChannel[0]}</SText>
            <SText $color="#E5E5E5" style={{ textAlign: "center" }}>{lang.noChannel[1]}</SText>
          </View>
        </View>
        : <FlatList
          style={{ paddingHorizontal: 20 }}
          data={channels}
          renderItem={({ item }) => {
            if (item?.id === undefined) return null;

            return (
              <TouchableOpacity onPress={() => onChannelPress(item.id)}>
                <ChannelItem item={item} me={me} />
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />
      }
    </TabContentContainer >
  </GrayGradientFull>
}
