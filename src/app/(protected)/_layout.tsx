import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect, Stack } from 'expo-router';

import { useAuth } from '../ctx/AuthProvider';

import ChatClient from '~/src/components/ChatClient';
import { mainBrandColor } from '~/src/consts/colors';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <ChatClient>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Chats',
            headerRight: () => (
              <Link href="/profile" asChild>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color={mainBrandColor}
                  title="Profile"
                />
              </Link>
            ),
          }}
        />
      </Stack>
    </ChatClient>
  );
}
