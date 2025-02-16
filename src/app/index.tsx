import { Redirect, Stack } from 'expo-router';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import AppleSignIn from '../components/AppleSignIn';
import { useAuth } from '../ctx/AuthProvider';
import { supabase } from '../lib/supabase';
import { mainBrandColor } from '~/src/config/config';

export default function AppEntrypoint() {
  const { isAuthenticated, session } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (session?.user) {
      checkOnboardingStatus();
    }
  }, [session]);

  const checkOnboardingStatus = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setIsOnboardingCompleted(!!data?.onboarding_completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingCompleted(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Sign in to meet your AI companion</Text>
          </View>
          <View style={styles.buttonContainer}>
            <AppleSignIn />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isOnboardingCompleted === null) {
    return null;
  }

  if (!isOnboardingCompleted && isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/authenticated" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  textContainer: {
    marginBottom: 48,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: mainBrandColor,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#4B5563',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
