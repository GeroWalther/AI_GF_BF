import { router } from 'expo-router';
import { ChannelList } from 'stream-chat-expo';

import useStore from '~/src/store';

export default function Home() {
  const setChannel = useStore((state) => state.setChannel);

  const user = { id: '1234' };
  const filter = {
    members: {
      $in: [user.id],
    },
  };

  return (
    <ChannelList
      filters={filter}
      onSelect={(channel) => {
        setChannel(channel);
        router.push(`/channel`);
      }}
    />
  );
}
