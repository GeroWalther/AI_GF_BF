import { useQuery } from '@tanstack/react-query';
import { useUser } from '~/src/ctx/AuthProvider';
import { supabase } from '~/src/lib/supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export const useProfile = () => {
  const user = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => getUserProfile(user?.id),
  });

  return { data, isLoading };
};
