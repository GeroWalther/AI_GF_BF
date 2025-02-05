import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAnimatedReaction, useSharedValue, runOnJS } from 'react-native-reanimated';

import MatchCard from './MatchCard';
import { mainBrandColor } from '../config/config';
import { useUser } from '../ctx/AuthProvider';
import { supabase } from '../lib/supabase';

const MatchCardsComponent = () => {
  const [agents, setAgents] = useState<any[] | null>([]);
  const activeIndex = useSharedValue(0);
  const [index, setIndex] = useState(0);

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
      const { data, error } = await supabase.functions.invoke('create-match-channel', {
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

      console.log('Channel created:', data);

      // 3. Navigate to chat or update UI as needed
      // router.push('/authenticated/channel'); // Uncomment if you want to navigate to chat
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
