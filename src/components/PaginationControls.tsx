import { Pressable, StyleSheet, Text, View } from 'react-native';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  loading: boolean;
};

export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext,
  loading,
}: PaginationControlsProps) {
  const previousDisabled = loading || page === 1;
  const nextDisabled = loading || page >= totalPages;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={previousDisabled}
        onPress={onPrevious}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, previousDisabled && styles.disabled]}
      >
        <Text style={styles.buttonText}>← Назад</Text>
      </Pressable>
      <Text style={styles.page}>Страница {page} / {totalPages}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={nextDisabled}
        onPress={onNext}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, nextDisabled && styles.disabled]}
      >
        <Text style={styles.buttonText}>Далее →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { backgroundColor: '#2459C4', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, minHeight: 48 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  page: { flex: 1, textAlign: 'center', color: '#172033', fontSize: 14 },
});
