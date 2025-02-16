import React from 'react';
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
    <>
      <Stack.Screen options={{ headerTitle: channel.data?.name || 'Chat' }} />
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <Channel channel={channel} keyboardVerticalOffset={0}>
          <MessageList />
          <AITypingIndicatorView />
          <MessageInput
            additionalTextInputProps={{
              placeholder: 'Type a message...',
            }}
          />
        </Channel>
      </SafeAreaView>
    </>
  );
}
