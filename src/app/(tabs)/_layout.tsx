import { Tabs } from 'expo-router';
import { Text } from 'react-native';

// route group (tabs) не появляется в URL; её layout объединяет разделы.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTintColor: '#2459C4', tabBarActiveTintColor: '#2459C4' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Text accessible={false} style={{ color, fontSize: size }}>▦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size, focused }) => (
            <Text accessible={false} style={{ color, fontSize: size }}>{focused ? '♥' : '♡'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
