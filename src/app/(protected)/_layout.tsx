import { Stack } from 'expo-router';

import ChatClient from '~/src/components/ChatClient';

export default function ProtectedLayout() {
  return (
    <ChatClient>
      <Stack />
    </ChatClient>
  );
}
