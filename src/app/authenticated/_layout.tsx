import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../ctx/AuthProvider';

import ChatClient from '~/src/components/ChatClient';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <ChatClient>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
        <Stack.Screen name="matched/[agent_id]" options={{ headerShown: false, title: 'Match' }} />
        <Stack.Screen name="channel" options={{ title: 'Chat', headerTransparent: true }} />
      </Stack>
    </ChatClient>
  );
}
