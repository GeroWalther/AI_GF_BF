import { post } from './api.ts';
import { AI_SERVER_URL } from '../config/config';

console.log('AI_SERVER_URL:', AI_SERVER_URL);

export const startAI = async (channelId: string) =>
  post(`${AI_SERVER_URL}/start-ai-agent`, { channel_id: channelId });

export const stopAI = async (channelId: string) =>
  post(`${AI_SERVER_URL}/stop-ai-agent`, { channel_id: channelId });