import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren, useEffect, useState } from 'react';
import { trpc } from './src/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import Constants from "expo-constants";
import Register from './src/Page/Auth/Register';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FText } from './src/Components/FText';
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import * as Linking from 'expo-linking';
import Login from './src/Page/Auth/Login';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import Chat from './src/Page/Chat';
import { store, useAppDispatch, useAppSelector } from './src/store/store';
import { setLogin } from './src/store/slices/loginSlice';
import { Provider } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, Feather } from '@expo/vector-icons'; 
import Settings from './src/Page/Settings';
import { Platform, View } from 'react-native';
import Search from './src/Page/Search';
import { set } from './src/store/slices/meSlice';
import jwtDecode from 'jwt-decode';
import Channel from './src/Page/Channel';
import useWebSocket from 'react-use-websocket';
import { addMessage } from './src/store/slices/messagesSlice';
import { allSchemaEvent } from './schema';
import { addChannel } from './src/store/slices/channelsSlice';
import { addUsers } from './src/store/slices/usersSlice';

export default function App() {
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <Base />
    </Provider>
  </GestureHandlerRootView>
}

const { manifest2 } = Constants;

let host = manifest2 !== null
  ? manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift()
  : process.env.IP

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

function Base() {
  const linking = {
    prefixes: [prefix],
  };

  const login = useAppSelector(state => state.login)
  const dispatch = useAppDispatch()

  useEffect(() => {
    AsyncStorage.getItem("token").then(token => {
      if (token) {
        dispatch(setLogin(true))
        dispatch(set({
          ...jwtDecode(token),
          token,
        }))
      }
    })
  }, [])
  
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink<any>({
          url: `http://${host}:3000`,
          async headers() {
            const token = await AsyncStorage.getItem("token")

            if (!token) return {}

            return {
              Authorization: `Bearer ${token}`
            } as any
          },
        }),
      ],
      transformer: superjson
    }),
  );

  return <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      {login 
        ? <WSLayer>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              initialRouteName='home'
            >
              <Stack.Screen
                name='home'
                component={Home}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name='search'
                component={Search}
                options={{
                  presentation: "modal",
                  animation: Platform.OS === "android" ? "slide_from_right" : "default",
                }}
              />
              <Stack.Screen
                name="channel"
                component={Channel}
                options={{
                  animation: Platform.OS === "android" ? "slide_from_right" : "default"
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </WSLayer>
        : <NavigationContainer linking={linking}> 
          <Stack.Navigator 
            screenOptions={{
              animation: "slide_from_right",
              statusBarTranslucent: false,
            }} 
            initialRouteName={"register"}
          >
            {AuthRoute()}
          </Stack.Navigator>
        </NavigationContainer>
      }
      <StatusBar style="auto" />
    </QueryClientProvider>
  </trpc.Provider>
}

function WSLayer ({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)
  const channels = useAppSelector(state => state.channels)
  const users = useAppSelector(state => state.users)
  const fecthChannel = trpc.channel.retrieve.useMutation()
  const fetchUsers = trpc.user.retrieve.useMutation()

  const { sendJsonMessage } = useWebSocket(`ws://${host}:3001/${me?.token}`, {
    onOpen() {
      sendJsonMessage({
        event: "init",
        payload: me?.token
      })
    },
    async onMessage(ev: MessageEvent<string>) {
      let event = allSchemaEvent.safeParse(JSON.parse(ev.data));
      console.log(event);

      if (!event.success) return

      const { payload } = event.data 

      switch(event.data.event) {
        case "createMessage":
          if (!channels[payload.channelId]) {
            const channel = await fecthChannel.mutateAsync({
              channelId: payload.channelId,
            })

            const toFetch: number[] = []

            for (const id of channel.users) {
              if (users[id]) continue

              toFetch.push(id)
            }

            const fetchedUsers = await fetchUsers.mutateAsync(toFetch)
            dispatch(addUsers(fetchedUsers))
            dispatch(addChannel(channel))

            return
          }

          dispatch(addMessage({
            channelId: payload.channelId,
            message: {
              id: payload.id,
              authorId: payload.authorId,
              content: payload.content,
              createdAt: payload.createdAt.toString(),
              updatedAt: payload.updatedAt.toString(),
            }
          }))
          break;
      }
    },
    heartbeat: {
      message: "ping",
      interval: 25000,
    }
  });
  
  return children
}

const Tab = createBottomTabNavigator();

function Home () {
  return <Tab.Navigator screenOptions={{
    tabBarStyle: {
      height: '10%',
      paddingBottom: 16,
    },
  }}>
    {AllRoute()}
  </Tab.Navigator>
}

function AllRoute() {
  return [
    <Tab.Screen
      name="chat"
      key={"chat"}
      component={Chat}
      options={{
        tabBarIcon(props) {
          return <FontAwesome name="comments" size={30} color={props.color} />
        },
        tabBarLabel(props) {
          return <FText $color={props.color} $size='12px'>Discussions</FText>
        },
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            Discussions
          </FText>
        },
        headerRight() {
          const navigation = useNavigation()

          return <View style={{ width: "100%", flex: 1, alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity onPress={() => navigation.navigate("search" as never)}>
              <Feather name="edit" size={24} color={"#007aff"}/>
            </TouchableOpacity>
          </View>
        },
        // headerShown: false
      }}
    />,
    <Tab.Screen
      name='settings'
      key={"settings"}
      component={Settings}
      options={{
        tabBarIcon(props) {
          return <FontAwesome name="gear" size={30} color={props.color} />
        },
        tabBarLabel(props) {
          return <FText $color={props.color} $size='12px'>Réglage</FText>
        },
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            Réglages
          </FText>
        },
      }}
    />
  ]
}

function AuthRoute() {
  return [
    <Stack.Screen
      name="register"
      key={"register"}
      component={Register}

      options={{
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            S'enregistrer
          </FText>
        },
      }}
    />,
    <Stack.Screen
      name="login"
      key={"login"}
      component={Login}
      options={{
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerTitle() {
          return <FText
            font={[Montserrat_700Bold, "Montserrat_700Bold"]}
            $size={"24px"}
          >
            Se connecter
          </FText>
        },
      }}
    />
  ]
}
