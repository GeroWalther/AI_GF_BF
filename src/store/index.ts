import { Channel as ChannelType } from 'stream-chat';
import { create } from 'zustand';

type State = {
  channel: ChannelType | null;
  setChannel: (channel: ChannelType | null) => void;
};

const useStore = create<State>((set) => ({
  channel: null,
  setChannel: (channel) => set({ channel }),
}));

export default useStore;
