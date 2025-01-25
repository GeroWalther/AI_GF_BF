import { Redirect, Stack } from 'expo-router';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';

import AppleSignIn from '../components/AppleSignIn';
import { useAuth } from './ctx/AuthProvider';

import { mainBrandColor } from '~/src/consts/colors';

export default function AppEntrypoint() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(protected)" />;
  }

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
