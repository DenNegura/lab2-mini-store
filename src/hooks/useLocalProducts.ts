import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { LocalProduct, NewLocalProduct } from '../types/localProduct';

export function useLocalProducts() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await db.getAllAsync<LocalProduct>(
        'SELECT id, title, description, price, created_at FROM local_products ORDER BY created_at DESC, id DESC',
      );
      setProducts(rows);
      return true;
    } catch {
      setError('Не удалось загрузить локальные товары');
      return false;
    } finally {
      setLoading(false);
    }
  }, [db]);

  // При открытии экрана перечитываем сохранённые данные из SQLite.
  useFocusEffect(useCallback(() => { void loadProducts(); }, [loadProducts]));

  async function writeProduct(sql: string, params: (string | number)[]) {
    setLoading(true);
    setError(null);
    try {
      await db.runAsync(sql, params);
      // SQLite не обновляет React state: перечитываем список после каждой записи.
      return await loadProducts();
    } catch {
      setError('Не удалось сохранить изменения локальных товаров');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function addProduct(product: NewLocalProduct) {
    return writeProduct(
      'INSERT INTO local_products (title, description, price, created_at) VALUES (?, ?, ?, ?)',
      [product.title, product.description, product.price, Date.now()],
    );
  }

  function updateProduct(id: number, product: NewLocalProduct) {
    return writeProduct(
      'UPDATE local_products SET title = ?, description = ?, price = ? WHERE id = ?',
      [product.title, product.description, product.price, id],
    );
  }

  function removeProduct(id: number) {
    return writeProduct('DELETE FROM local_products WHERE id = ?', [id]);
  }

  return { products, loading, error, loadProducts, addProduct, updateProduct, removeProduct };
}
