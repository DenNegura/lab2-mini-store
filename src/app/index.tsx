import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaginationControls } from '../components/PaginationControls';
import { ProductCard } from '../components/ProductCard';
import { ProductForm } from '../components/ProductForm';
import { SearchInput } from '../components/SearchInput';
import type { Product, ProductsResponse } from '../types/product';

const PAGE_SIZE = 10;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export default function ProductsScreen() {
  // State сохраняется между render. Setter запрашивает новый render компонента.
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const visibleProducts = [...localProducts, ...products];
  const normalizedSearch = search.trim().toLowerCase();

  // filteredProducts вычисляется во время render.
  // Его не нужно хранить в state или синхронизировать через useEffect.
  const filteredProducts = visibleProducts.filter(product =>
    product.title.toLowerCase().includes(normalizedSearch),
  );

  function addProduct(newProduct: Product) {
    // functional update: новое значение зависит от предыдущего массива.
    setLocalProducts(prev => [newProduct, ...prev]);
  }

  // Derived value: пересчитывается при render, отдельный state не нужен.
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // page и reloadKey — dependencies: изменение любого запускает effect снова.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);

      // server-side pagination: page определяет skip.
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
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadProducts();

    // Cleanup перед следующим effect и при размонтировании отменяет запрос.
    return () => controller.abort();
  }, [page, reloadKey]);
  // keyboardShouldPersistTaps:
  // "never"	tap по контенту обычно закрывает клавиатуру
  // "handled"	интерактивный элемент получает tap, если он его обрабатывает
  // "always"	tap по контенту не закрывает клавиатуру автоматически
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* FlatList получает данные через data
            и превращает каждый item в ProductCard через renderItem. */}
        <FlatList<Product>
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={item => String(item.id)}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshing={refreshing}
          onRefresh={() => {
            if (loading || refreshing) return;
            setRefreshing(true);
            setLoading(true);
            setReloadKey(prev => prev + 1);
          }}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Mini Store</Text>
              <Text style={styles.subtitle}>Products from DummyJSON</Text>
              <Text style={styles.total}>На сервере: {total} · Локальных: {localProducts.length}</Text>
              <SearchInput value={search} onChangeText={setSearch} />
              <ProductForm onSubmit={addProduct} />
              <Text style={styles.sectionTitle}>Товары</Text>
              <Text style={styles.subtitle}>
                Поиск по текущей странице и локальным товарам. Найдено: {filteredProducts.length}
              </Text>
            </View>
          }
          ListEmptyComponent={
            !loading && !refreshing && !error ? (
              <View style={styles.message}>
                <Text style={styles.messageText}>
                  {normalizedSearch ? 'По вашему запросу ничего не найдено' : 'Товары отсутствуют'}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={totalPages > 0 ? (
            <View style={styles.footer}>
              <PaginationControls
                page={page}
                totalPages={totalPages}
                loading={loading || refreshing}
                onPrevious={() => {
                  setLoading(true);
                  setPage(prev => prev - 1);
                }}
                onNext={() => {
                  setLoading(true);
                  setPage(prev => prev + 1);
                }}
              />
            </View>
          ) : null}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F6FA' },
  container: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { gap: 12, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#172033' },
  subtitle: { fontSize: 16, color: '#596579' },
  total: { fontSize: 14, color: '#2459C4' },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: '#172033' },
  content: { flexGrow: 1, padding: 16 },
  separator: { height: 12 },
  footer: { paddingTop: 20, paddingBottom: 8 },
  message: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  messageText: { fontSize: 16, color: '#596579', textAlign: 'center' },
  error: { fontSize: 16, color: '#B42318', textAlign: 'center' },
  retry: { backgroundColor: '#2459C4', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
});
