import {useState} from 'react';
import {Keyboard, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import type {Product} from '../types/product';

type ProductFormProps = {
    onSubmit: (product: Product) => void;
};

export function ProductForm({onSubmit}: ProductFormProps) {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Ошибки вычисляются из state; показываем их после первой попытки submit.
    const titleError = title.trim().length < 2 ? 'Введите название: минимум 2 символа' : null;
    const numericPrice = Number(price.trim().replace(',', '.'));
    const priceError = !price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0
        ? 'Введите цену — число больше 0'
        : null;
    const descriptionError = description.trim().length < 5
        ? 'Введите описание: минимум 5 символов'
        : null;

    function handleSubmit() {
        setSubmitted(true);
        if (titleError || priceError || descriptionError) return;

        onSubmit({
            id: Date.now(),
            title: title.trim(),
            price: numericPrice,
            description: description.trim(),
            thumbnail: imageUrl.trim(),
            category: 'Локальный товар',
        });
        setTitle('');
        setPrice('');
        setDescription('');
        setImageUrl('');
        setSubmitted(false);
        Keyboard.dismiss();
    }

    return (
        <View style={styles.form}>
            <Text style={styles.heading}>Добавить локальный товар</Text>
            <Text style={styles.hint}>Товар хранится только до перезапуска приложения.</Text>
            <Text style={styles.label}>Название</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                accessibilityLabel="Название"
                placeholder="Название товара"
                style={styles.input}
            />
            {submitted && titleError && <Text style={styles.error} accessibilityRole="alert">{titleError}</Text>}
            <Text style={styles.label}>Цена ($)</Text>
            <TextInput
                value={price}
                onChangeText={setPrice}
                inputMode="decimal"
                accessibilityLabel="Цена"
                placeholder="19.99"
                style={styles.input}
            />
            {submitted && priceError && <Text style={styles.error} accessibilityRole="alert">{priceError}</Text>}
            <Text style={styles.label}>Описание</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                accessibilityLabel="Описание"
                placeholder="Краткое описание товара"
                style={[styles.input, styles.description]}
            />
            {submitted && descriptionError &&
                <Text style={styles.error} accessibilityRole="alert">{descriptionError}</Text>}
            <Text style={styles.label}>Image URL (необязательно)</Text>
            <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="URL изображения, необязательно"
                placeholder="https://..."
                style={styles.input}
            />
            <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                style={({pressed}) => [styles.button, pressed && styles.pressed]}
            >
                <Text style={styles.buttonText}>Добавить товар</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    form: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DBE5F3', borderRadius: 18, padding: 16, gap: 8},
    heading: {fontSize: 20, fontWeight: '600', color: '#172033'},
    hint: {fontSize: 14, color: '#596579', lineHeight: 20},
    label: {fontSize: 15, fontWeight: '500', color: '#172033', marginTop: 4},
    input: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#172033',
        backgroundColor: '#F8FAFC'
    },
    description: {minHeight: 96, textAlignVertical: 'top'},
    error: {fontSize: 14, color: '#B42318'},
    button: {backgroundColor: '#2459C4', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8},
    buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
    pressed: {opacity: 0.75},
});
