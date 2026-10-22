import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { FavoritesProvider } from '../context/FavoritesContext';

// _layout.tsx описывает navigation hierarchy.
// UI и данные конкретных экранов остаются в route-файлах.
export default function RootLayout() {
  return (
    <FavoritesProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: '#2459C4', contentStyle: { backgroundColor: '#F3F6FA' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="products/[id]" options={{ title: 'Product' }} />
        <Stack.Screen name="add-product" options={{ title: 'New product', presentation: 'modal' }} />
      </Stack>
    </FavoritesProvider>
  );
}
