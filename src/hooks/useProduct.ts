import { useEffect, useState } from 'react';

import { getProduct } from '../api/productsApi';
import type { Product } from '../types/product';

export function useProduct(id: number | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    if (id === null || !Number.isSafeInteger(id) || id <= 0) {
      // Сохраняем поведение исходного route: неверный id не запускает запрос.
      return () => controller.abort();
    }
    const productId = id;

    async function loadProduct() {
      setProduct(null);
      setError(null);
      setLoading(true);
      try {
        const data = await getProduct(productId, controller.signal);
        if (!controller.signal.aborted) setProduct(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (controller.signal.aborted) return;
        setError(error instanceof Error ? error.message : 'Не удалось загрузить товар');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProduct();
    return () => controller.abort();
  }, [id]);

  return { product, loading, error };
}
