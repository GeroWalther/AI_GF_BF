import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import { AITypingIndicatorView, Channel, MessageInput, MessageList } from 'stream-chat-expo';

import { mainBrandColor } from '~/src/config/config';
import { startAI, stopAI } from '~/src/http/request';
import useStore from '~/src/store';

export default function ChannelScreen() {
  const channel = useStore((state) => state.channel);

  useFocusEffect(() => {
    if (channel?.id) {
      startAI(channel.id);
    }
    return () => {
      if (channel?.id) {
        stopAI(channel.id);
      }
    };
  });

  if (!channel) {
    return <Redirect href="/authenticated" />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: mainBrandColor, flex: 1 }}>
      <Stack.Screen options={{ headerTitle: channel.data?.name || 'Chat' }} />

      <Channel channel={channel}>
        <View style={{ flex: 1 }}>
          <MessageList />
          <AITypingIndicatorView />
          <View style={{ marginBottom: 10 }}>
            <MessageInput
              additionalTextInputProps={{
                placeholder: 'Type a message...',
              }}
            />
          </View>
        </View>
      </Channel>
    </SafeAreaView>
  );
}
