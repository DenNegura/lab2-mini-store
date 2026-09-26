import {StyleSheet, TextInput} from 'react-native';

type SearchInputProps = {
    value: string;
    onChangeText: (value: string) => void;
};

export function SearchInput({value, onChangeText}: SearchInputProps) {
    // controlled input: state родителя является источником текущего значения TextInput.
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Поиск товаров..."
            accessibilityLabel="Поиск товаров"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#172033'
    },
});
