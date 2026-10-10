import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProduct } from '../../hooks/useProduct';

export default function ProductDetailsScreen() {
  // [id].tsx создаёт dynamic route. Значение id приходит из URL.
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsedId = Number(id);
  const productId = typeof id === 'string' && Number.isSafeInteger(parsedId) && parsedId > 0
    ? parsedId
    : null;
  const { product, loading, error } = useProduct(productId);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: product?.title ?? 'Product' }} />
      {loading ? (
        <View style={styles.message}>
          <ActivityIndicator size="large" color="#2459C4" />
          <Text style={styles.description}>Загрузка товара...</Text>
        </View>
      ) : error ? (
        <View style={styles.message}>
          <Text style={styles.error} accessibilityRole="alert">{error}</Text>
        </View>
      ) : product ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" accessibilityLabel={product.title} />
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.category && <Text style={styles.description}>Категория: {product.category}</Text>}
          {product.rating !== undefined && <Text style={styles.description}>Рейтинг: {product.rating}</Text>}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 16 },
  image: { width: '100%', height: 280, borderRadius: 18, backgroundColor: '#FFFFFF' },
  title: { fontSize: 26, fontWeight: '700', color: '#172033' },
  description: { fontSize: 16, lineHeight: 24, color: '#596579' },
  price: { fontSize: 26, fontWeight: '700', color: '#2459C4' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  error: { fontSize: 16, color: '#B42318', textAlign: 'center' },
});
