import { SectionList, StyleSheet, Text } from 'react-native';

const sections = [
  { title: 'Electronics', data: [{ id: 'phone', title: 'Phone' }, { id: 'laptop', title: 'Laptop' }] },
  { title: 'Beauty', data: [{ id: 'perfume', title: 'Perfume' }] },
];

// Отдельный учебный пример: основной экран его не импортирует.
export function SectionListExample() {
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderSectionHeader={({ section }) => <Text style={styles.heading}>{section.title}</Text>}
      renderItem={({ item }) => <Text style={styles.item}>{item.title}</Text>}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  heading: { fontSize: 20, fontWeight: '600', backgroundColor: '#F3F6FA', padding: 12 },
  item: { fontSize: 16, padding: 12 },
});
