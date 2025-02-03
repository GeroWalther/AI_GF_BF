import { Redirect, Stack } from 'expo-router';
import { SafeAreaView, Text, View, StyleSheet, Button } from 'react-native';
import { supabase } from '../lib/supabase';

import AppleSignIn from '../components/AppleSignIn';
import { useAuth } from '../ctx/AuthProvider';

import { mainBrandColor } from '~/src/config/config';

export default function AppEntrypoint() {
  const { isAuthenticated } = useAuth();

  const testFunction = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('stream-token-provider', {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    // console.log('Function response:', { data, error });
  };

  if (isAuthenticated) {
    return <Redirect href="/authenticated" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Button title="Test Function" onPress={testFunction} />
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
