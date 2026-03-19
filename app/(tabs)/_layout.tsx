import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#126900',
      headerStyle: {backgroundColor: '#126900'},
      headerTitleStyle: {fontWeight:'bold', color: '#fff'}
     }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Device1',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="hardware-chip-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="screen2"
        options={{
          title: 'Device2',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="hardware-chip-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}