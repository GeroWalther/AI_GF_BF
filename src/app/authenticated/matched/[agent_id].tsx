import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { supabase } from '~/src/lib/supabase';

const fetchAgentbyId = async (agent_id: string) => {
  const { data, error } = await supabase.from('ai_agents').select('*').eq('id', agent_id).single();
  if (error) {
    throw error;
  }
  return data;
};

const Matched = () => {
  const { agent_id } = useLocalSearchParams<{ agent_id: string }>();

  const {
    data: agent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agent', agent_id],
    queryFn: () => fetchAgentbyId(agent_id),
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!agent) {
    return <Text>Agent not found</Text>;
  }

  return (
    <View>
      <Text>Matched</Text>
      <Text>{agent.name}</Text>
    </View>
  );
};

export default Matched;

const styles = StyleSheet.create({});
