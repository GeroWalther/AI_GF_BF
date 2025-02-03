import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedReaction, useSharedValue, runOnJS } from 'react-native-reanimated';

import MatchCard from './MatchCard';
import { supabase } from '../lib/supabase';
import { mainBrandColor } from '../config/config';

const MatchCardsComponent = () => {
  const [agents, setAgents] = useState<any[] | null>([]);
  const activeIndex = useSharedValue(0);
  const [index, setIndex] = useState(0);

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

  const onMatch = (res: boolean, agent: any) => {
    console.log('on Response: ', res);
    console.log('agent: ', agent);
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
          onResponse={(res) => onMatch(res, agent)}
        />
      ))}
      {index > (agents?.length ?? 0) - 3 && (
        <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Inter' }}>
          No Models left. You have seen them all.
        </Text>
      )}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}>
          <Text style={{ color: 'rgba(255,0,0,0.6)', fontSize: 24, marginRight: 8 }}>←</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'Inter' }}>
            Swipe left to pass
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 20,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'Inter' }}>
            Swipe right to match
          </Text>
          <Text style={{ color: 'rgba(0,255,0,0.6)', fontSize: 24, marginLeft: 8 }}>→</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default MatchCardsComponent;
