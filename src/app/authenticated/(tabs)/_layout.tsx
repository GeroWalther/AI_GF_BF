import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { mainBrandColor } from '../../../config/config';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: mainBrandColor,
          paddingBottom: 65,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#ff0e0e',
        tabBarInactiveTintColor: '#d6d6d6',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Chats',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          headerTitle: 'Find Match',
          tabBarLabel: 'Match',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
