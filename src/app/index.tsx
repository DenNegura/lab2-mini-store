import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaginationControls } from '../components/PaginationControls';
import { ProductCard } from '../components/ProductCard';
import type { Product, ProductsResponse } from '../types/product';

const PAGE_SIZE = 10;

export default function ProductsScreen() {
  // State сохраняется между render. Setter запрашивает новый render компонента.
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Derived value: пересчитывается при render, отдельный state не нужен.
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // page и reloadKey — dependencies: изменение любого запускает effect снова.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);

      // Страница 1 → skip 0, страница 2 → skip 10, страница 3 → skip 20.
      const skip = (page - 1) * PAGE_SIZE;

      try {
        const response = await fetch(
          `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        if (controller.signal.aborted) return;

        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (controller.signal.aborted) return;

        setError('Не удалось загрузить товары');
      } finally {
        // Старый отменённый запрос не должен выключить loading нового запроса.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProducts();

    // Cleanup перед следующим effect и при размонтировании отменяет запрос.
    return () => controller.abort();
  }, [page, reloadKey]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mini Store</Text>
          <Text style={styles.subtitle}>Products from DummyJSON</Text>
          <Text style={styles.total}>Всего товаров: {total}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.message}>
              <ActivityIndicator size="large" color="#2459C4" />
              <Text style={styles.messageText}>Загрузка товаров...</Text>
            </View>
          ) : error ? (
            <View style={styles.message}>
              <Text style={styles.error} accessibilityRole="alert">{error}</Text>
              <Pressable
                accessibilityRole="button"
                style={styles.retry}
                onPress={() => {
                  setLoading(true);
                  setReloadKey(prev => prev + 1);
                }}
              >
                <Text style={styles.retryText}>Повторить</Text>
              </Pressable>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.message}>
              <Text style={styles.messageText}>Товары не найдены</Text>
            </View>
          ) : (
            // На странице 10 товаров: ScrollView + map достаточно для урока.
            products.map(product => <ProductCard key={product.id} product={product} />)
          )}
        </ScrollView>

        {totalPages > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPrevious={() => {
              // Блокируем кнопки сразу, ещё до выполнения effect.
              setLoading(true);
              setPage(prev => prev - 1);
            }}
            onNext={() => {
              setLoading(true);
              setPage(prev => prev + 1);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F6FA' },
  container: { flex: 1, padding: 16, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { gap: 6 },
  title: { fontSize: 32, fontWeight: '700', color: '#172033' },
  subtitle: { fontSize: 16, color: '#596579' },
  total: { fontSize: 14, color: '#2459C4', marginTop: 4 },
  content: { flexGrow: 1, gap: 16, paddingBottom: 8 },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  messageText: { fontSize: 16, color: '#596579', textAlign: 'center' },
  error: { fontSize: 16, color: '#B42318', textAlign: 'center' },
  retry: { backgroundColor: '#2459C4', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
