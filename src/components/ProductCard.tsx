import { Link } from 'expo-router';
import { Pressable, Image, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../types/product';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    // Link описывает декларативный переход; в URL передаём только id.
    <Link href={{ pathname: '/products/[id]', params: { id: product.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Открыть товар: ${product.title}`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {product.thumbnail ? <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={product.title}
        /> : <View style={styles.placeholder}><Text style={styles.description}>Нет изображения</Text></View>}
        <View style={styles.details}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {product.description}
          </Text>
          {product.category && <Text style={styles.description}>{product.category}</Text>}
          {product.rating !== undefined && <Text style={styles.description}>Рейтинг: {product.rating}</Text>}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    elevation: 2,
  },
  image: { width: '100%', height: 180, backgroundColor: '#F8FAFC', borderRadius: 12 },
  placeholder: { height: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12 },
  details: { gap: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#172033' },
  description: { fontSize: 15, lineHeight: 22, color: '#596579' },
  price: { fontSize: 22, fontWeight: '700', color: '#2459C4' },
});
