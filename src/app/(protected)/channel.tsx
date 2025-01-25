import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { Channel, MessageInput, MessageList } from 'stream-chat-expo';

import { mainBrandColor } from '~/src/consts/colors';
import useStore from '~/src/store';

export default function ChannelScreen() {
  const channel = useStore((state) => state.channel);

  if (!channel) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: mainBrandColor }}>
      <Stack.Screen options={{ headerTitle: channel.data?.name || 'Chat' }} />

      <Channel channel={channel}>
        <MessageList />
        <MessageInput />
      </Channel>
    </SafeAreaView>
  );
}
