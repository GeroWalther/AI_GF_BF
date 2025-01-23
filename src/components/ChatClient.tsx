import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useCreateChatClient, Chat, MessageType } from 'stream-chat-expo';

export default function ChatClient({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Starting...');
  const [clientReady, setClientReady] = useState(false);

  const client = useCreateChatClient({
    apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCJ9.uXrTIldOXzowLRVRmfqP3liSvigYtnmIL93xGeq7v4M',
    userData: {
      id: '1234',
      name: 'Gero',
    },
  });

  useEffect(() => {
    if (!client) return;

    const setupChannel = async () => {
      try {
        setStatus('Setting up channel...');
        const channel = client.channel('messaging', 'the_park', {
          name: 'The Park',
          members: ['1234'],
        });

        await channel.create();
        await channel.watch();
        setStatus('Ready');
        setClientReady(true);
      } catch (error: any) {
        setError(error?.message || 'Unknown error');
        setStatus('Channel setup failed');
      }
    };

    setupChannel();

    return () => {
      client.disconnectUser();
    };
  }, [client]);

  if (!client || !clientReady) {
    return (
      <View className="flex-1 items-center justify-center bg-amber-50">
        <ActivityIndicator color="black" size="large" />
        <Text className="mt-4 text-lg">{status}</Text>
        {error && <Text className="mt-2 text-center text-red-500">Error: {error}</Text>}
      </View>
    );
  }

  return (
    <Chat client={client} isMessageAIGenerated={(message: MessageType) => !!message.ai_generated}>
      {children}
    </Chat>
  );
}
