import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { trpc } from './src/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, useAppDispatch, useAppSelector } from './src/store/store';
import { setLogin } from './src/store/slices/loginSlice';
import { Provider, useDispatch } from 'react-redux';
import { Platform, Text, View } from 'react-native';
import { set } from './src/store/slices/meSlice';
import jwtDecode from 'jwt-decode';
import { LogBox } from 'react-native';
import { setLanguage } from './src/store/slices/languageSlice';
import Auth from './src/Routes/Auth';
import AllRoute from './src/Routes/All';
import { host, port } from './src/utils/host';
import WSLayer from './src/WSLayer';
import Loading from './src/Components/Loading';
import * as SplashScreen from 'expo-splash-screen';
import { SText } from './src/Components/FText';
import { Container } from './src/Page/css/auth.css';
import { BigGoldGradient } from './src/Page/css/gradient.css';
import { Image } from 'expo-image';

const splashLogo = require("./assets/splash.png")

const IGNORED_LOGS = [
  "Node of type",
  "Selector unknown returned"
]

LogBox.ignoreLogs(IGNORED_LOGS);

if (__DEV__) {
  const withoutIgnored = (logger: any) => (...args: any) => {
    const output = args.join(' ');

    if (!IGNORED_LOGS.some(log => output.includes(log))) {
      logger(...args);
    }
  };

  console.log = withoutIgnored(console.log);
  console.info = withoutIgnored(console.info);
  console.warn = withoutIgnored(console.warn);
  console.error = withoutIgnored(console.error);
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <Base />
    </Provider>
  </GestureHandlerRootView>
}

const prefix = Linking.createURL('/');

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#24252D' // "#F4F4F4",
  },
}

function Base() {
  const linking = {
    prefixes: [prefix],
  };

  const me = useAppSelector(state => state.me)

  const [token, setToken] = useState<string | undefined>(me?.token)
  const login = useAppSelector(state => state.login)
  const [isReady, setIsReady] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    setIsReady(false)

    AsyncStorage.getItem("token").then(token => {
      if (token) {
        setToken(token)
        setIsReady(true)

        dispatch(setLogin(true))
        dispatch(set({
          ...jwtDecode(token),
          token,
        }))
      } else {
        setIsReady(true)
      }
    })

    AsyncStorage.getItem("language").then(lang => {
      if (lang) {
        dispatch(setLanguage(lang as any))
      }
    })
  }, [login])

  const [queryClient, setQueryClient] = useState(() => new QueryClient());
  const [trpcClient, setTrpcClient] = useState(() => createTrpcClient(''));

  useEffect(() => {
    if (!token) return

    setQueryClient(new QueryClient());
    setTrpcClient(createTrpcClient(token));
  }, [token]);

  function createTrpcClient(token: string) {
    return trpc.createClient({
      links: [
        httpBatchLink<any>({
          url: `http://${host}:${port}/trpc/`,
          async headers() {
            if (!token) return {}

            return {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            } as any
          },
        }),
      ],
      transformer: superjson
    });
  }

  useEffect(() => {
    if (isReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return <BigGoldGradient colors={[]}>
    <Image source={splashLogo} style={{ width: '50%', height: 146 }} contentFit="cover" />
  </BigGoldGradient>

  if (login && !token) return <Loading />

  return <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      {login
        ? token
          ? (
            <WSLayer>
              <NavigationContainer theme={Theme} linking={linking}>
                <AllRoute />
              </NavigationContainer>
            </WSLayer>
          ) : (
            <Loading />
          )
        : <NavigationContainer theme={Theme} linking={linking}>
          <Auth />
        </NavigationContainer>
      }
      <StatusBar backgroundColor='red' style={"light"} hidden={false} translucent={false} />
    </QueryClientProvider>
  </trpc.Provider>
}
