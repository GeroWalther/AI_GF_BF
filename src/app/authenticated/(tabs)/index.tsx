import { router } from 'expo-router';

import { ChannelList } from 'stream-chat-expo';
import { useUser } from '~/src/ctx/AuthProvider';

import useStore from '~/src/store';

export default function Home() {
  const setChannel = useStore((state) => state.setChannel);
  const user = useUser();

  // useEffect(() => {
  //   async function testInvoke() {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     const result = await supabase.functions.invoke('stream-token-provider', {
  //       headers: { Authorization: `Bearer ${session?.access_token}` },
  //     });
  //     // console.log('Function invoke result:', result);
  //   }
  //   testInvoke();
  // }, []);

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
        router.push('/authenticated/channel');
      }}
    />
  );
}
