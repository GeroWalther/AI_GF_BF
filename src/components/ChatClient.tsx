import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useCreateChatClient, Chat, MessageType } from 'stream-chat-expo';

import { useUser } from '../ctx/AuthProvider';
import { streamTokenProvider } from '../utils/stream';

export default function ChatClient({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Starting...');
  const [clientReady, setClientReady] = useState(false);
  const user = useUser();

  const client = useCreateChatClient({
    apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider: streamTokenProvider,
    userData: {
      id: user.id,
      name: user.email,
    },
  });

  useEffect(() => {
    let mounted = true;

    const setupChannel = async () => {
      if (!client) return;

      try {
        setStatus('Setting up channel...');

        // First connect user explicitly
        const token = await streamTokenProvider();
        await client.connectUser({ id: user.id, name: user.email }, token);

        // Then create channel
        const channel = client.channel('messaging', 'the_park', {
          name: 'The Park',
          members: [user.id],
        });

        await channel.watch();

        if (mounted) {
          setStatus('Ready');
          setClientReady(true);
        }
      } catch (error: any) {
        console.error('Channel setup error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          response: error.response?.data,
        });
        if (mounted) {
          setError(error?.message || 'Unknown error');
          setStatus('Channel setup failed');
        }
      }
    };

    setupChannel();

    return () => {
      mounted = false;
      if (client?.wsConnection?.isHealthy) {
        client.disconnectUser();
      }
    };
  }, [client, user.id, streamTokenProvider]);

  if (!client || !clientReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="black" size="large" />
        <Text style={styles.statusText}>{status}</Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </SafeAreaView>
    );
  }

  return (
    <Chat client={client} isMessageAIGenerated={(message: MessageType) => !!message.ai_generated}>
      {children}
    </Chat>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 14,
  },
});
