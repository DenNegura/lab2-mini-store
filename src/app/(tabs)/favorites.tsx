import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.description}>Общее состояние добавим в следующей теме.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#172033' },
  description: { fontSize: 16, lineHeight: 24, color: '#596579' },
});
