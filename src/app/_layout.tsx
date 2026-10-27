import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { FavoritesProvider } from '../context/FavoritesContext';

async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

// _layout.tsx описывает navigation hierarchy.
// UI и данные конкретных экранов остаются в route-файлах.
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="mini-store.db" onInit={initDatabase}>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerTintColor: '#2459C4', contentStyle: { backgroundColor: '#F3F6FA' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="products/[id]" options={{ title: 'Product' }} />
          <Stack.Screen name="add-product" options={{ title: 'New product', presentation: 'modal' }} />
        </Stack>
      </FavoritesProvider>
    </SQLiteProvider>
  );
}
