import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OverlayProvider } from 'stream-chat-expo';
import '../global.css';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OverlayProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </OverlayProvider>
    </GestureHandlerRootView>
  );
}
