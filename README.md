# Mini Store v3

Существующий учебный Expo React Native проект развивается от одноэкранного каталога к многоэкранному приложению. Стек сохранён: Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript, Expo Router и `react-native-safe-area-context`.

## Запуск и проверки

Из корня существующего проекта (Node.js 22.13+):

```bash
npm install
npx expo start
npm run lint
npm run typecheck
```

Откройте совместимый с SDK 57 Expo Go или development build; `a` — Android, `i` — iOS на macOS, `w` — web.

## Что сохранено из предыдущих тем

- `useState`, render cycle, `useEffect`, dependencies и cleanup.
- Стандартный `fetch`, DummyJSON, `response.ok`, loading/error/success, retry и `AbortController`.
- Server-side pagination: `limit=10`, `skip=(page-1)*PAGE_SIZE`, `totalPages=Math.ceil(total/PAGE_SIZE)`.
- `FlatList<Product>`, `ItemSeparatorComponent`, header/footer/empty и pull-to-refresh.
- `ProductCard`, `SearchInput`, `PaginationControls`, `ProductForm`, общие типы `Product` / `ProductsResponse`.
- Controlled `TextInput`, validation, `KeyboardAvoidingView`, `keyboardShouldPersistTaps="handled"`, `Keyboard.dismiss()`.
- Учебный `src/examples/SectionListExample.tsx` сохранён отдельно от routes.

```text
API → useEffect [page, reloadKey] → products → FlatList → pagination
products + search → filteredProducts → ProductCard
TextInput → local form state → validation → onSubmit
```

Поиск локальный: trim и сравнение без учёта регистра только по названию товаров текущей серверной страницы. HTTP-запрос не отправляется. `filteredProducts` вычисляется при render. При переходах Details / modal состояние Products остаётся на его экране.

Refresh и retry увеличивают `reloadKey`, смена страницы меняет `page`. Старые карточки остаются во время запроса и ошибки. Loading блокирует пагинацию; refresh имеет свой индикатор. Пустой поиск показывает все товары страницы; отсутствие совпадений показывает empty state. Cleanup отменяет запрос, а `signal.aborted` защищает state от устаревшего ответа.

Валидация формы сохранена: название минимум 2 символа, описание минимум 5, конечная цена больше нуля (точка или запятая), необязательный URL изображения. Ошибки показываются после попытки submit. Корректная форма вызывает callback, очищает поля и закрывает клавиатуру. `Date.now()` в учебном Product не является серверным id и не используется для перехода в Details.

# Lecture 4 — Expo Router Navigation

## Что изменилось

Главная последовательность: file-based routing → `_layout.tsx` → Stack → Link / useRouter → dynamic routes → route params → route groups → Tabs → Modal → Mini Store v3.

Форма вынесена из header списка на отдельный route. Добавлены root Stack, nested Tabs, Favorites-заглушка, Product Details, `Link` + `asChild`, `useRouter`, `[id]`, `useLocalSearchParams` и modal route. Дополнительной data architecture нет.

## File-based routing

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── favorites.tsx
│   ├── products/
│   │   └── [id].tsx
│   └── add-product.tsx
├── components/
│   ├── ProductCard.tsx
│   ├── ProductForm.tsx
│   ├── SearchInput.tsx
│   └── PaginationControls.tsx
├── examples/
│   └── SectionListExample.tsx
└── types/
    └── product.ts
```

| Файл | URL |
| --- | --- |
| `src/app/(tabs)/index.tsx` | `/` |
| `src/app/(tabs)/favorites.tsx` | `/favorites` |
| `src/app/products/[id].tsx` | `/products/:id`, например `/products/42` |
| `src/app/add-product.tsx` | `/add-product` |

Обычные директории становятся URL segments, `index.tsx` — route текущей директории, `[id].tsx` — dynamic segment. Route group `(tabs)` и `_layout.tsx` не являются URL segments. Все page-файлы имеют default export.

Каждый route имеет URL-представление даже на Android/iOS. Полная настройка Universal Links / App Links и complex deep links в эту тему не входит.

## _layout.tsx

Root `_layout.tsx` описывает navigation hierarchy через Stack; `(tabs)/_layout.tsx` описывает вложенный Tabs. Layout отвечает за navigator, screen configuration и headers. Fetch, search, pagination и form state остаются на соответствующих экранах. Существующий `StatusBar` сохранён.

```text
Root Stack
├── Tabs (без дополнительного root header)
│   ├── Products
│   └── Favorites
├── Product Details
└── Add Product (presentation: modal)
```

Tabs header / Stack header уже занимают верхнюю safe area. Экраны не добавляют верхний safe-area padding; нижний отступ Tabs обеспечивает tab bar, на Details и modal применяется bottom safe area. `FlatList` не вложен в `ScrollView`; modal и Details используют собственные небольшие ScrollView.

## Stack

```text
Products → push Details → back → Products
Products → push Add Product modal → back → Products
```

Stack хранит историю экранов. Details и Add Product находятся поверх Tabs и не являются отдельными вкладками. Header Back и Android Back используют эту иерархию естественным образом.

| Метод | Смысл |
| --- | --- |
| `navigate(route)` | Обычный переход; router может перейти к уже существующему route в hierarchy/history. |
| `push(route)` | Явно добавляет новый route поверх stack в navigation history. |
| `replace(route)` | Заменяет текущий route; Back не возвращает заменённый экран. |
| `back()` | Снимает верхний route и возвращает предыдущий экран. |

`replace` и `navigate` приведены как понятия, искусственно добавлять их в runtime не требуется.

## Link vs useRouter

`Link` — декларативный переход как часть UI. ProductCard сохраняет прежний вид и становится кликабельной:

```tsx
<Link
  href={{ pathname: '/products/[id]', params: { id: product.id } }}
  asChild
>
  <Pressable>{/* содержимое карточки */}</Pressable>
</Link>
```

`asChild` передаёт навигационные props дочернему Pressable: Link управляет маршрутом, Pressable остаётся visual/interactive component. Через URL передаётся только `id`, а не объект Product, JSON, цена или изображение.

`useRouter` — императивная navigation command из event handler:

```tsx
const router = useRouter();
router.push('/add-product'); // кнопка «+ Новый товар»
router.back(); // «Отмена» или возврат после подтверждения
```

## Dynamic route

Один `products/[id].tsx` обслуживает `/products/1`, `/products/2`, `/products/42` и другие id:

```tsx
const { id } = useLocalSearchParams<{ id: string }>();
const productId = Number(id);
```

Generic описывает ожидаемую форму параметра, но не заменяет runtime validation. Проверяем строку, положительное безопасное целое число. Некорректный id показывает сообщение без запроса. HTTP 404 показывает «Товар не найден», остальные ошибки — сообщение, приложение не падает.

Dynamic segment `/products/42` идентифицирует ресурс. Query parameter, например `/products?category=beauty`, задаёт дополнительное состояние URL:

```tsx
const { category } = useLocalSearchParams<{ category?: string }>();
```

Это только концептуальный пример; отдельного `/products` route и query-фильтра в runtime нет. URL не используется как хранилище товаров.

## Route parameter + Effect

```text
id → useEffect [id] → fetch /products/{id} → Product
```

Изменился id — изменился внешний ресурс — выполняется новый request. Effect сохраняет знакомую модель `product`, `loading`, `error`, `response.ok` и AbortController cleanup. Отмена не показывается как ошибка. Details отображает image, title, description, price, category и rating.

Заголовок обновляется конфигурацией экрана:

```tsx
<Stack.Screen options={{ title: product?.title ?? 'Product' }} />
```

## Route groups

`(tabs)` организует файлы, общий layout и Tabs navigator. Имя группы не входит в пользовательский URL: `src/app/(tabs)/favorites.tsx` открывается как `/favorites`.

## Tabs

Products и Favorites — устойчивые top-level разделы. Products сохраняет SearchInput + FlatList + PaginationControls. Favorites пока показывает «Общее состояние добавим в следующей теме».

## Modal

`add-product.tsx` — обычная page с `presentation: 'modal'` в root Stack. Кнопка Products вызывает `router.push('/add-product')`. Modal переиспользует ProductForm и её validation.

«Отмена» вызывает `router.back()`. Успешный submit показывает inline подтверждение с названием проверенного товара и пояснением, что он не добавлен в каталог. Кнопка «Вернуться к товарам» вызывает `router.back()`. На web подтверждение тоже видно; flow не зависит от поддержки native Alert.

## Navigation ≠ shared state

```text
ProductsScreen local state ≠ AddProductScreen local state
```

В предыдущей одноэкранной версии ProductForm вызывал callback родителя ProductsScreen, который добавлял товар в `localProducts`. После переноса на отдельный route такого parent-child callback между Products и формой больше нет: callback формы получает AddProductScreen.

Navigation решает переход между screens, но не хранение общих данных приложения. Учебный submit проверяет данные и показывает результат на modal screen. Он не отправляет POST, не добавляет товар в Products и не передаёт его через URL. Favorites намеренно не имеет общего store.

Context, useReducer, Zustand, Redux, query cache, module-level mutable state, events и persistence не используются. Это естественная потребность в shared state, которую изучим позже.

## Что будет дальше

Shared state / architecture — отдельная следующая тема: как согласовать данные каталога, формы и Favorites без обходных решений.

## Проверка на занятии

1. Открыть Products, дождаться карточек. Проверить loading, поиск (регистр, пробелы, отсутствие совпадений), страницы и pull-to-refresh.
2. Нажать карточку: URL `/products/{id}`, loading → Product Details, заголовок товара. Back возвращает Products с прежними поиском и страницей.
3. Перейти Favorites и обратно: два постоянных раздела, без Details / modal в tab bar.
4. Нажать «+ Новый товар», проверить modal, затем «Отмена» и возврат.
5. Открыть modal снова, отправить пустую форму, проверить ошибки. Проверить название из одного символа, короткое описание, цену 0, отрицательную и нечисловую цену.
6. Ввести корректные данные с ценой `12,50`, выполнить submit, увидеть подтверждение, нажать «Вернуться к товарам». Каталог не изменяется.
7. Проверить keyboard avoidance и обработку первого tap при открытой клавиатуре на iOS/Android. Проверить системный Android Back.
8. На web открыть `/products/abc`, `/products/0`, `/products/1.5`: понятная ошибка без запроса. Открыть `/products/999999`: «Товар не найден».
9. В Offline проверить error на Details и ошибку + retry на Products; восстановить сеть. При медленной сети сменить id и убедиться в cleanup предыдущего запроса.

## Документация

- [Expo SDK 57 и совместимость версий](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Link / asChild SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/link/)
- [Stack SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/stack/)
- [React useEffect и cleanup](https://react.dev/reference/react/useEffect)
