import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductForm } from '../../components/ProductForm';
import { useLocalProducts } from '../../hooks/useLocalProducts';
import type { LocalProduct } from '../../types/localProduct';

export default function LocalProductsScreen() {
  const router = useRouter();
  const { products, loading, error, loadProducts, updateProduct, removeProduct } = useLocalProducts();
  const [editing, setEditing] = useState<LocalProduct | null>(null);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <FlatList<LocalProduct>
        data={products}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Локальные товары</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.push('/add-product')}>
              <Text style={styles.buttonText}>+ Новый товар</Text>
            </Pressable>
            {loading && <ActivityIndicator color="#2459C4" />}
            {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
            {error && <Pressable accessibilityRole="button" disabled={loading} onPress={() => { void loadProducts(); }}>
              <Text style={styles.action}>Повторить</Text>
            </Pressable>}
          </View>
        }
        ListEmptyComponent={!loading && !error ? <Text style={styles.description}>Локальных товаров пока нет</Text> : undefined}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {editing?.id === item.id ? (
              <>
                <ProductForm
                  key={item.id}
                  initialProduct={editing}
                  saving={loading}
                  onSubmit={async product => {
                    const saved = await updateProduct(item.id, product);
                    if (saved) setEditing(null);
                    return saved;
                  }}
                />
                <Pressable accessibilityRole="button" disabled={loading} onPress={() => setEditing(null)}>
                  <Text style={styles.action}>Отмена</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.name}>${item.price.toFixed(2)}</Text>
                <View style={styles.actions}>
                  <Pressable accessibilityRole="button" disabled={loading} onPress={() => setEditing(item)}>
                    <Text style={styles.action}>Изменить</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" disabled={loading} onPress={() => { void removeProduct(item.id); }}>
                    <Text style={styles.error}>Удалить</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  content: { flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 12 },
  header: { gap: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#172033' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DBE5F3', borderRadius: 18, padding: 16, gap: 12 },
  name: { fontSize: 20, fontWeight: '600', color: '#172033' },
  description: { fontSize: 16, lineHeight: 24, color: '#596579' },
  actions: { flexDirection: 'row', gap: 24, paddingVertical: 8 },
  action: { fontSize: 16, color: '#2459C4' },
  error: { fontSize: 16, color: '#B42318' },
  button: { backgroundColor: '#2459C4', borderRadius: 12, padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
