import { Pressable, StyleSheet, Text } from 'react-native';

import { useFavorites } from '../hooks/useFavorites';
import type { Product } from '../types/product';

export function FavoriteButton({ product }: { product: Product }) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const selected = isFavorite(product.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${selected ? 'Удалить из избранного' : 'Добавить в избранное'}: ${product.title}`}
      accessibilityState={{ selected }}
      onPress={() => {
        if (selected) removeFavorite(product.id);
        else addFavorite(product);
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>{selected ? '♥' : '♡'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-end', minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 30, color: '#2459C4' },
  pressed: { opacity: 0.75 },
});
