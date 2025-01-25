import { Stack } from 'expo-router';

import ChatClient from '~/src/components/ChatClient';

export default function ProtectedLayout() {
  return (
    <ChatClient>
      <Stack>
        <Stack.Screen name="index" options={{ headerTitle: 'Chats' }} />
      </Stack>
    </ChatClient>
  );
}
