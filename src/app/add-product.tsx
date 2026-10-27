import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductForm } from '../components/ProductForm';
import { useLocalProducts } from '../hooks/useLocalProducts';
import type { NewLocalProduct } from '../types/localProduct';

export default function AddProductScreen() {
  const router = useRouter();
  const [submittedProduct, setSubmittedProduct] = useState<NewLocalProduct | null>(null);

  const { addProduct, loading, error } = useLocalProducts();

  async function handleSubmit(product: NewLocalProduct) {
    const saved = await addProduct(product);
    if (saved) setSubmittedProduct(product);
    return saved;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submittedProduct ? (
            <>
              <Text style={styles.title}>Товар сохранён</Text>
              <Text style={styles.description} accessibilityRole="alert">
                Товар «{submittedProduct.title}» сохранён в SQLite. Он доступен во вкладке Local products.
              </Text>
              <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={styles.buttonText}>Вернуться к товарам</Text>
              </Pressable>
            </>
          ) : <ProductForm onSubmit={handleSubmit} saving={loading} />}
          {error && <Text accessibilityRole="alert" style={styles.description}>{error}</Text>}
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  container: { flex: 1 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#172033' },
  description: { fontSize: 16, lineHeight: 24, color: '#596579' },
  button: { backgroundColor: '#2459C4', borderRadius: 12, padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancel: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#2459C4', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.75 },
});
