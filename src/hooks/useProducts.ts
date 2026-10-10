import { useEffect, useState } from 'react';

import { getProducts } from '../api/productsApi';
import type { Product } from '../types/product';

const PAGE_SIZE = 10;

export function useProducts(page: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // page и reloadKey — dependencies: изменение любого запускает effect снова.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProducts(page, PAGE_SIZE, controller.signal);
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

  function refresh() {
    if (loading || refreshing) return;
    setRefreshing(true);
    setLoading(true);
    setReloadKey(prev => prev + 1);
  }

  function retry() {
    setLoading(true);
    setReloadKey(prev => prev + 1);
  }

  // Сохраняем немедленную блокировку pagination до запуска следующего effect.
  function preparePageChange() {
    setLoading(true);
  }

  return {
    products,
    total,
    loading,
    error,
    refreshing,
    pageSize: PAGE_SIZE,
    refresh,
    retry,
    preparePageChange,
  };
}
