import type { Product, ProductsResponse } from '../types/product';

const BASE_URL = 'https://dummyjson.com/products';

export async function getProducts(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const skip = (page - 1) * pageSize;
  const response = await fetch(`${BASE_URL}?limit=${pageSize}&skip=${skip}`, { signal });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

export async function getProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, { signal });

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Товар не найден' : 'Не удалось загрузить товар');
  }

  return response.json();
}
