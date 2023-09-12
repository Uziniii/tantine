import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { trpc } from './utils/trpc';
import { httpBatchLink } from '@trpc/client';
import superjson from "superjson";
import Constants from "expo-constants";
import IndexPage from './src/IndexPage';

const { manifest2 } = Constants;

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink<any>({
          url: `http://${manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift() }:3000`,
        }),
      ],
      transformer: superjson
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <IndexPage />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
