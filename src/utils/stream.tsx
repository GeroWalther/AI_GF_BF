import { supabase } from '../lib/supabase';
import { AI_SERVER_URL } from '../config/config';

export const streamTokenProvider = async () => {
  const response = await supabase.functions.invoke('stream-token-provider');
  console.log(response);
  return response.data?.token || '';
};

export const startAIAgent = async (channelId: string) => {
  try {
    const response = await fetch(`${AI_SERVER_URL}/start-ai-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel_id: channelId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start AI agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting AI agent:', error);
    throw error;
  }
};
