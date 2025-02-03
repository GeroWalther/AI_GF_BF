import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAnimatedReaction, useSharedValue, runOnJS } from 'react-native-reanimated';

import MatchCard from './MatchCard';
import { supabase } from '../lib/supabase';

const MatchCardsComponent = () => {
  const [agents, setAgents] = useState<any[] | null>([]);
  const activeIndex = useSharedValue(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase.from('ai_agents').select('*');
      console.log(data);
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
        setAgents((prevAgents) => (prevAgents ? [...prevAgents, ...prevAgents.reverse()] : []));
      }
    }
  }, [index]);

  const onResponse = (res: boolean) => {
    console.log('on Response: ', res);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* <Text style={{ top: 70, position: 'absolute' }}>
        Current index: {index}
      </Text> */}
      {agents?.map((agent, index) => (
        <MatchCard
          key={`${agent.id}-${index}`}
          agent={agent}
          numOfCards={agents.length}
          index={index}
          activeIndex={activeIndex}
          onResponse={onResponse}
        />
      ))}
    </View>
  );
};

export default MatchCardsComponent;
