import {useState} from 'react';
import {Keyboard, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import type {NewLocalProduct} from '../types/localProduct';

type ProductFormProps = {
    onSubmit: (product: NewLocalProduct) => Promise<boolean>;
    initialProduct?: NewLocalProduct;
    saving?: boolean;
};

export function ProductForm({onSubmit, initialProduct, saving = false}: ProductFormProps) {
    const [title, setTitle] = useState(initialProduct?.title ?? '');
    const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
    const [description, setDescription] = useState(initialProduct?.description ?? '');
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

    async function handleSubmit() {
        setSubmitted(true);
        if (saving || titleError || priceError || descriptionError) return;

        const saved = await onSubmit({
            title: title.trim(),
            price: numericPrice,
            description: description.trim(),
        });
        if (!saved) return;
        setTitle('');
        setPrice('');
        setDescription('');
        setSubmitted(false);
        Keyboard.dismiss();
    }

    return (
        <View style={styles.form}>
            <Text style={styles.heading}>{initialProduct ? 'Изменить товар' : 'Новый товар'}</Text>
            <Text style={styles.hint}>Товар сохраняется локально на устройстве.</Text>
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
            <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                disabled={saving}
                style={({pressed}) => [styles.button, pressed && styles.pressed]}
            >
                <Text style={styles.buttonText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
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
