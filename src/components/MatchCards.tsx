import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAnimatedReaction, useSharedValue, runOnJS } from 'react-native-reanimated';
import { useChatContext } from 'stream-chat-expo';

import MatchCard from './MatchCard';
import { mainBrandColor } from '../config/config';
import { useUser } from '../ctx/AuthProvider';
import { supabase } from '../lib/supabase';
import { startAIAgent } from '../utils/stream';
import { newAIMessage } from '../http/request';
import useStore from '../store';

const MatchCardsComponent = () => {
  const [agents, setAgents] = useState<any[] | null>([]);
  const activeIndex = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const { client } = useChatContext();
  const setChannel = useStore((state) => state.setChannel);
  const user = useUser();

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase.from('ai_agents').select('*');
      // console.log(data);
      setAgents(data);
    };
    fetchAgents();
  }, []);

  useAnimatedReaction(
    () => activeIndex.value,
    (value, prevValue) => {
      if (Math.floor(value) !== index) {
        runOnJS(setIndex)(Math.floor(value));
      }
    }
  );

  useEffect(() => {
    if (agents) {
      if (index > agents.length - 3) {
        console.warn('Last 2 cards remaining. Fetch more!');
        // setAgents((prevAgents) => (prevAgents ? [...prevAgents, ...prevAgents.reverse()] : []));
      }
    }
  }, [index]);

  const onMatch = async (res: boolean, agent: any) => {
    if (!res) return;

    try {
      // 0. First sync the agent to Stream
      const { error: syncError } = await supabase.functions.invoke('sync_agents_to_stream', {
        body: { agent },
      });

      if (syncError) {
        console.error('Error syncing agent:', syncError);
        throw syncError;
      }

      // 1. Create match in Supabase
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          agent_id: agent.id,
        })
        .select()
        .single();

      if (matchError) throw matchError;
      if (!match) throw new Error('No match data returned');

      console.log('Match created:', match);

      // 2. Create Stream channel via edge function
      const { data: channelData, error } = await supabase.functions.invoke('create-match-channel', {
        body: {
          matchId: match.id,
          userId: user.id,
          agentId: agent.id,
          agentName: agent.name,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // 3. Get the channel from the authenticated Stream client
      const channel = client.channel('messaging', match.id, {
        members: [user.id, agent.id],
        created_by_id: user.id,
        name: agent.name,
      });

      // Set the channel in the store
      setChannel(channel);

      console.log('Channel created:', channelData);

      // 4. Start the AI agent for this channel
      await startAIAgent(match.id);
      console.log('AI agent started for channel:', match.id);

      // 5. Send a new message to the channel - Do NOT REMOVE THIS. Its needed for Production
      //await newAIMessage(match.id);

      // 6. Navigate to Matched screen
      router.push(`/authenticated/matched/${agent.id}`);
    } catch (error) {
      console.error('Error creating match:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: mainBrandColor,
      }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* <Text style={{ top: 70, position: 'absolute', color: 'white', fontFamily: 'Inter' }}>
        Models available: {index}
      </Text> */}

      {agents?.map((agent, index) => (
        <MatchCard
          key={`${agent.id}-${index}`}
          agent={agent}
          numOfCards={agents.length}
          index={index}
          activeIndex={activeIndex}
          onMatch={(res) => onMatch(res, agent)}
        />
      ))}
      {index > (agents?.length ?? 0) - 3 && (
        <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter' }}>
          No Models left. You have seen them all.
        </Text>
      )}
    </View>
  );
};

export default MatchCardsComponent;
