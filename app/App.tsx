import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { trpc } from './src/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import Constants from "expo-constants";
import Register from './src/Page/Security/Register';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FText } from './src/Components/FText';
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"
import * as Linking from 'expo-linking';
import Home from './src/Page/Home';

const { manifest2 } = Constants;

let host = manifest2 !== null
  ? manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift()
  : process.env.IP
console.log(host);

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

export default function App() {
  const linking = {
    prefixes: [prefix],
  };

  const [login, setLogin] = useState(false)
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

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
          <NavigationContainer linking={linking}>
            <Stack.Navigator initialRouteName="register">
              <Stack.Screen
                name="register"
                component={Register}
                options={{
                  headerTitleAlign: "center",
                  headerTitle() {
                    return <FText
                      font={[ Montserrat_700Bold, "Montserrat_700Bold" ]}
                      $size={"24px"}
                    >
                      S'enregistrer
                    </FText>
                  },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
