import { Channel, MessageInput, MessageList, useChatContext } from 'stream-chat-expo';

export default function ChannelScreen() {
  const { client } = useChatContext();
  const channel = client.channel('messaging', 'the_park');

  return (
    <Channel channel={channel}>
      <MessageList />
      <MessageInput />
    </Channel>
  );
}