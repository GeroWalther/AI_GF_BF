import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { OverlayProvider } from 'stream-chat-expo';

export default function Layout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <OverlayProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </OverlayProvider>
    </GestureHandlerRootView>
  );
}
