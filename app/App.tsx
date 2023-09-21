import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { trpc } from './src/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import Constants from "expo-constants";
import Register from './src/Components/Security/Register';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FText } from './src/FText';
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat"

const { manifest2 } = Constants;

let host = manifest2 !== null
  ? manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift()
  : process.env.IP

const Stack = createNativeStackNavigator();

export default function App() {
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
        <View style={{ backgroundColor: "#F0F0F5", width: "100%" }}>
          <NavigationContainer>
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
        </View>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
