import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useCreateChatClient, Chat, MessageType } from 'stream-chat-expo';

export default function ChatClient({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Starting...');
  const [clientReady, setClientReady] = useState(false);

  const user = { id: '1234', name: 'Gero' };

  const client = useCreateChatClient({
    apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCJ9.JvAwz1IFHYlx8rxfdsryokJrlSdJ0DaUAUNft7suUes',
    userData: user,
  });

  useEffect(() => {
    if (!client) return;

    const setupChannel = async () => {
      try {
        setStatus('Setting up channel...');
        const channel = client.channel('messaging', 'the_park', {
          name: 'The Park',
          members: [user.id],
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
