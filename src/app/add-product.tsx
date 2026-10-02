import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductForm } from '../components/ProductForm';
import type { Product } from '../types/product';

export default function AddProductScreen() {
  const router = useRouter();
  const [submittedProduct, setSubmittedProduct] = useState<Product | null>(null);

  function handleSubmit(product: Product) {
    // Navigation не создаёт shared application state: результат остаётся на этом экране.
    setSubmittedProduct(product);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submittedProduct ? (
            <>
              <Text style={styles.title}>Форма заполнена</Text>
              <Text style={styles.description} accessibilityRole="alert">
                Данные «{submittedProduct.title}» прошли проверку. Товар не добавлен в каталог.
                Общее состояние добавим в следующей теме.
              </Text>
              <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={styles.buttonText}>Вернуться к товарам</Text>
              </Pressable>
            </>
          ) : <ProductForm onSubmit={handleSubmit} />}
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
