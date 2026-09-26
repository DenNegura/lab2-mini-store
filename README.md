# Mini Store

Учебный React Native проект для студентов 3 курса: полный цикл загрузки данных находится в одном экране `src/app/index.tsx`.

## Что изучает проект

- useState
- render cycle
- useEffect
- dependency array
- fetch
- loading/error/data и пустой результат
- AbortController
- pagination

## Запуск

Требуется Node.js 22.13+ (или более новая LTS-версия).

```bash
cd mini-store
npm install
npx expo start
```

Если терминал уже открыт в `mini-store`, команду `cd` пропустите. Откройте приложение через Expo Go, совместимый с SDK 57, или нажмите `a` для Android-эмулятора, `i` для iOS-симулятора (macOS), `w` для браузера.

Стек: Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript, Expo Router. Версии закреплены в `package.json` и `package-lock.json`; переход на другой SDK не требуется.

```bash
npm run lint
npm run typecheck
```

## API

https://dummyjson.com/products

HTTP выполняется стандартным `fetch`. Ответ содержит `products`, `total`, `skip`, `limit`. Модель товара находится в `src/types/product.ts`. Поле `product.thumbnail` напрямую передаётся в `Image source={{ uri: product.thumbnail }}`: изображение загружается отдельным HTTP-запросом.

## Pagination

```text
limit = 10
skip = (page - 1) * limit

page 1 → skip 0
page 2 → skip 10
page 3 → skip 20
```

Пример: https://dummyjson.com/products?limit=10&skip=10

`totalPages = Math.ceil(total / PAGE_SIZE)` — вычисляемое значение, а не отдельный state. Количество товаров приходит от сервера: оно не зафиксировано на 194. Каждая страница заменяет список, а не дописывает товары к нему.

## Как читать код

- `useState` хранит данные компонента между render. Setter запрашивает обновление state и новый render.
- Render — React снова вызывает `ProductsScreen`, который возвращает JSX для текущего state. Сам render не выполняет HTTP-запрос.
- `useEffect` синхронизирует компонент с внешней системой — здесь с API товаров.
- `fetch` получает данные, `response.ok` проверяет HTTP-статус, `response.json()` читает JSON.
- `page` запускает новый effect через dependency array. `reloadKey` позволяет повторить запрос той же страницы.

```text
Нажатие «Далее»
  ↓
setPage(prev => prev + 1)
  ↓
Новый state → React снова вызывает ProductsScreen → render → commit
  ↓
Изменилась dependency page в [page, reloadKey]
  ↓
Cleanup старого effect → новый effect → fetch
  ↓
setProducts / setTotal / setLoading
  ↓
Новый render → UI с товарами новой страницы
```

React может объединять несколько обновлений state в один render. Effect также выполняется после первоначального commit. В режиме разработки Strict Mode может дополнительно выполнить setup → cleanup → setup: отменённый запрос при этом ожидаем.

## Состояния интерфейса

- **Loading:** индикатор и «Загрузка товаров...». Пагинация временно отключена.
- **Error:** «Не удалось загрузить товары» и кнопка «Повторить».
- **Success:** карточки с изображением, названием, описанием и ценой.
- **Empty:** «По вашему запросу ничего не найдено» или «Товары отсутствуют». При `total = 0` пагинация скрыта, поэтому нет надписи «1 / 0».

Перед запросом предыдущий `products` не очищается: карточки остаются видимыми, над списком появляется индикатор. При pull-to-refresh используется отдельный refresh indicator. Кнопки сразу выставляют `loading`, чтобы блокировать повторные нажатия ещё до effect. В самом effect `loading` также включается — это необходимо для первого запроса.

Начальное значение `loading` — `true`: при первом открытии показывается индикатор без краткого пустого состояния.

Cleanup вызывает `controller.abort()` при смене dependencies и размонтировании. `AbortError` не показывается пользователю. Проверка `signal.aborted` не позволяет старому запросу менять state, в том числе выключать индикатор нового запроса в `finally`.

## Структура

```text
src/
  app/
    _layout.tsx
    index.tsx
  components/
    ProductCard.tsx
    PaginationControls.tsx
    SearchInput.tsx
    ProductForm.tsx
  examples/
    SectionListExample.tsx
  types/
    product.ts
```

`_layout.tsx` подключает единственный экран через Expo Router. Safe area предоставляется Router и применяется через `SafeAreaView` из `react-native-safe-area-context`. Основной список — `FlatList<Product>`, форма и поиск находятся в его header, пагинация — в footer. Список обёрнут в `KeyboardAvoidingView` внутри Safe Area; вложенного ScrollView нет.

## Проверка на занятии

1. Открыть приложение: дождаться 10 карточек и общего количества товаров.
2. Нажать «Далее»: проверить запрос с `skip=10`, новую страницу и заблокированные на время загрузки кнопки.
3. Вернуться назад: запрос должен содержать `skip=0`; на первой странице «Назад» отключена.
4. Дойти до последней страницы: «Далее» отключена, карточек может быть меньше десяти.
5. В браузерных DevTools включить Offline, перейти на другую страницу: появится ошибка. Вернуть сеть и нажать «Повторить».
6. Для демонстрации Empty временно заменить URL на `https://dummyjson.com/products/search?q=zzzznonexistentproductzzzz`, затем восстановить исходный URL.
7. Для наблюдения cleanup включить замедление сети в DevTools и размонтировать экран во время запроса. Отмена не должна отображаться как ошибка.

## Документация

- [Совместимость версий Expo](https://docs.expo.dev/versions/v57.0.0/)
- [React useEffect и cleanup](https://react.dev/reference/react/useEffect)
- [Expo Router layouts](https://docs.expo.dev/router/basics/navigation-layouts/)


# Lecture 4 — Lists, Inputs and Forms

## Что добавлено

- `FlatList<Product>`: `data`, `renderItem`, `keyExtractor`, `contentContainerStyle`.
- `ListHeaderComponent`: заголовок, поиск, форма и состояние запроса.
- `ListFooterComponent`: существующая Previous / Next пагинация.
- `ListEmptyComponent`: пустые данные или отсутствие совпадений поиска.
- `ItemSeparatorComponent`: отступ между карточками.
- Pull-to-refresh: `refreshing` и `onRefresh` повторяют запрос текущей страницы через `reloadKey`.
- `TextInput`, controlled inputs, локальный search, forms и ручная validation.
- `KeyboardAvoidingView` с `Platform.OS`, `keyboardShouldPersistTaps="handled"` и `Keyboard.dismiss()`.
- Отдельный `SectionListExample.tsx`, который не подключён к основному приложению.

## ScrollView vs FlatList

`ScrollView` рендерит children сразу и подходит для небольшого ограниченного контента.

`FlatList` рассчитан на коллекции и использует virtualization: элементы создаются по мере необходимости. Он предоставляет `renderItem`, header/footer/empty, refresh, `onEndReached`, `horizontal` и `numColumns`. Здесь сохраняется явная пагинация кнопками; infinite scroll не включён.

`extraData` здесь не нужен: `renderItem` использует только item из `data`. Он понадобится, если карточки будут зависеть от внешнего state, например выбранного товара, который иначе не передаётся списку.

## Controlled input

```text
value → TextInput → onChangeText → setState → render → value
```

State — источник текущего значения. `SearchInput` получает `value={search}` и `onChangeText={setSearch}` от экрана. Поля формы хранят отдельные строки через `useState`, включая цену: промежуточный ввод ещё может не быть числом.

## Search

```text
products + localProducts → visibleProducts
visibleProducts + search → filteredProducts → FlatList → ProductCard
```

Базовая идея `products + search → filteredProducts` расширена локальными товарами. Поиск работает только по названию товаров текущей серверной страницы и всех локальных товаров. Он обрезает пробелы и не учитывает регистр. Пустой запрос показывает весь объединённый список. При смене страницы запрос поиска сохраняется.

`filteredProducts` — derived value, вычисляемое во время render. Отдельные state и useEffect добавили бы ненужную синхронизацию. Поиск не отправляет HTTP-запросов.

## Form

```text
TextInput → state → validation → onSubmit → localProducts → FlatList
```

`ProductForm` содержит `title`, `price`, `description`, `imageUrl` и `submitted`. Название после trim должно содержать минимум 2 символа, описание — минимум 5. Цена обязательна, должна быть конечным числом больше нуля; принимается десятичная точка или запятая. URL изображения необязателен; без него карточка показывает «Нет изображения».

Ошибки вычисляются из текущих значений, но отображаются только после первой попытки submit. При ошибках callback не вызывается. При успехе форма создаёт Product с `id: Date.now()`, вызывает `onSubmit`, очищает поля и `submitted`, затем закрывает клавиатуру через `Keyboard.dismiss()`.

Экран добавляет товар через `setLocalProducts(prev => [newProduct, ...prev])`. Локальные товары не отправляются в DummyJSON, не увеличивают серверный total и остаются при refresh и смене страницы. После перезапуска они исчезнут. Активный поиск может скрыть новый товар: очистите поиск, чтобы увидеть все товары.

## Что остаётся из Lecture 3

- `useState`, render и `useEffect` с dependencies `[page, reloadKey]`.
- Стандартный `fetch`, `response.ok`, `loading/error/data` и retry.
- `AbortController`, cleanup и защита от записи результатов отменённых запросов.
- Server-side pagination: `limit=10`, `skip=(page-1)*PAGE_SIZE`, `totalPages`, Previous / Next.

```text
Lecture 3: API → useEffect → products → список → pagination
Lecture 4: API → products + localProducts → visibleProducts
           visibleProducts + search → filteredProducts → FlatList → ProductCard
```

`loading` означает запрос в процессе и блокирует пагинацию. `refreshing` отличает pull-to-refresh от первой загрузки и смены страницы. Сетевая логика остаётся в одном effect; retry и refresh увеличивают `reloadKey`. Отменённый запрос не выключает индикаторы нового запроса.

## Проверка Lecture 4 на занятии

1. Открыть экран: заголовок и форма доступны во время загрузки, затем появляются карточки.
2. Ввести часть названия в поиск, изменить регистр, добавить пробелы. Ввести несуществующее название и проверить empty state, затем очистить поиск.
3. Отправить пустую форму: ошибки возле трёх обязательных полей. Проверить название из одного символа, короткое описание, цену 0, отрицательную цену и нечисловой ввод.
4. Добавить корректный товар с ценой `12,50` без изображения: форма очищается, клавиатура закрывается, товар появляется первым при пустом поиске.
5. Сменить страницу и потянуть список вниз на мобильном устройстве: локальный товар остаётся, обновляется только текущая страница API, индикатор прекращается.
6. При открытой клавиатуре прокрутить форму и нажать «Добавить товар»: первое нажатие должно обрабатываться. Проверить на iOS и Android.
7. В Offline повторить refresh: увидеть ошибку и сохранённые карточки; восстановить сеть и нажать «Повторить».
8. Проверить границы пагинации и отключение кнопок во время запроса.
