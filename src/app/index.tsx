import { Stack } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';

import AppleSignIn from '../components/AppleSignIn';

export default function AppEntrypoint() {
  return (
    <SafeAreaView className="bg-red flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center px-4">
        <View className="mb-12 w-full">
          <Text className="text-center text-4xl font-bold text-red-700">Welcome</Text>
          <Text className="mt-2 text-center text-xl text-gray-600">
            Sign in to meet your AI companion
          </Text>
        </View>

        <View className="w-full items-center justify-center">
          <AppleSignIn />
        </View>
      </View>
    </SafeAreaView>
  );
}
