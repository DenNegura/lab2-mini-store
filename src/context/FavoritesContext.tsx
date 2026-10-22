import { createContext, useReducer, type ReactNode } from 'react';

import type { Product } from '../types/product';

type FavoritesAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: number }
  | { type: 'clear' };

export function favoritesReducer(state: Product[], action: FavoritesAction): Product[] {
  switch (action.type) {
    case 'add':
      if (state.some(product => product.id === action.product.id)) return state;
      return [...state, action.product];
    case 'remove':
      return state.filter(product => product.id !== action.productId);
    case 'clear':
      return [];
  }
}

type FavoritesContextValue = {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (id: number) => void;
  clearFavorites: () => void;
  isFavorite: (id: number) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);

  function addFavorite(product: Product) {
    dispatch({ type: 'add', product });
  }

  function removeFavorite(id: number) {
    dispatch({ type: 'remove', productId: id });
  }

  function clearFavorites() {
    dispatch({ type: 'clear' });
  }

  function isFavorite(id: number) {
    return favorites.some(product => product.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, clearFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
