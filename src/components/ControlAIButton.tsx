import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Channel as ChannelType } from 'stream-chat';

import { useWatchers } from '../hooks/stream/useWatchers';
import { startAI, stopAI } from '../http/request';

export default function ControlAIButton({ channel }: { channel: ChannelType }) {
  const channelId = channel.id;
  const { watchers, loading } = useWatchers({ channel });
  const [isAIOn, setIsAIOn] = useState(false);

  useEffect(() => {
    if (watchers) {
      setIsAIOn(watchers.some((watcher) => watcher.startsWith('ai-bot')));
    }
  }, [watchers]);

  const onPress = async () => {
    if (!channelId) {
      return;
    }

    const handler = () => (isAIOn ? stopAI(channelId) : startAI(channelId));

    await handler();
  };

  return watchers && !loading ? (
    <Pressable
      style={{
        padding: 8,
        position: 'absolute',
        top: 18,
        right: 18,
        backgroundColor: '#D8BFD8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
      }}
      onPress={onPress}>
      <Text style={{ fontSize: 16, fontWeight: '500' }}>
        {isAIOn ? 'Stop AI 🪄' : 'Start AI 🪄'}
      </Text>
    </Pressable>
  ) : null;
}
