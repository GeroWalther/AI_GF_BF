import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../ctx/AuthProvider';

import ChatClient from '~/src/components/ChatClient';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <ChatClient>
      <Stack>
        <Stack.Screen name="index" options={{ headerTitle: 'Chats' }} />
      </Stack>
    </ChatClient>
  );
}
