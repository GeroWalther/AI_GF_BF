import { supabase } from '../lib/supabase';

export const streamTokenProvider = async () => {
  const response = await supabase.functions.invoke('stream-token-provider');
  console.log(response);
  return response.data?.token || '';
};
