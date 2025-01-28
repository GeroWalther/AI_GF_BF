import { post } from './api.ts';
const AI_AGENT_URL = 'http://localhost:3000';
console.log('AI_AGENT_URL:', AI_AGENT_URL);

export const startAI = async (channelId: string) =>
  post(`${AI_AGENT_URL}/start-ai-agent`, { channel_id: channelId });
export const stopAI = async (channelId: string) =>
  post(`${AI_AGENT_URL}/stop-ai-agent`, { channel_id: channelId });