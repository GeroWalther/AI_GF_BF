import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OverlayProvider } from 'stream-chat-expo';

import '../global.css';
import { AuthProvider } from '../ctx/AuthProvider';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OverlayProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </QueryClientProvider>
      </OverlayProvider>
    </GestureHandlerRootView>
  );
}
