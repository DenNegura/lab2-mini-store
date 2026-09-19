import { Image, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../types/product';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.thumbnail }}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel={product.title}
      />
      <View style={styles.details}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {product.description}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    elevation: 2,
  },
  image: { width: '100%', height: 180, backgroundColor: '#F8FAFC', borderRadius: 12 },
  details: { gap: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#172033' },
  description: { fontSize: 15, lineHeight: 22, color: '#596579' },
  price: { fontSize: 22, fontWeight: '700', color: '#2459C4' },
});
