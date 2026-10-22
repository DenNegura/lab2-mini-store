import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '../../components/ProductCard';
import { useFavorites } from '../../hooks/useFavorites';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={favorites}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <ProductCard product={item} />}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={<Text style={styles.title}>Favorites</Text>}
        ListEmptyComponent={<Text style={styles.description}>Нет избранных товаров</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  list: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  content: { flexGrow: 1, padding: 16 },
  separator: { height: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#172033', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: '#596579' },
});
