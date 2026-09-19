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
- **Empty:** «Товары не найдены». При `total = 0` пагинация скрыта, поэтому нет надписи «1 / 0».

Перед запросом предыдущий `products` не очищается; на время загрузки карточки заменяются индикатором. Кнопки сразу выставляют `loading`, чтобы блокировать повторные нажатия ещё до effect. В самом effect `loading` также включается — это необходимо для первого запроса.

Начальное значение `loading` — `false`, как в примере лекции. После первого commit effect включает индикатор; до него возможен краткий render пустого состояния.

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
  types/
    product.ts
```

`_layout.tsx` подключает единственный экран через Expo Router. Safe area предоставляется Router и применяется через `SafeAreaView` из `react-native-safe-area-context`. На странице всего 10 товаров, поэтому достаточно `ScrollView` и `map`.

## Проверка на занятии

1. Открыть приложение: дождаться 10 карточек и общего количества товаров.
2. Нажать «Далее»: проверить запрос с `skip=10`, новую страницу и заблокированные на время загрузки кнопки.
3. Вернуться назад: запрос должен содержать `skip=0`; на первой странице «Назад» отключена.
4. Дойти до последней страницы: «Далее» отключена, карточек может быть меньше десяти.
5. В браузерных DevTools включить Offline, перейти на другую страницу: появится ошибка. Вернуть сеть и нажать «Повторить».
6. Для демонстрации Empty временно заменить URL на `https://dummyjson.com/products/search?q=zzzznonexistentproductzzzz`, затем восстановить исходный URL.
7. Для наблюдения cleanup включить замедление сети в DevTools и размонтировать экран во время запроса. Отмена не должна отображаться как ошибка.

## Документация

- [Совместимость версий Expo](https://docs.expo.dev/versions/latest/)
- [React useEffect и cleanup](https://react.dev/reference/react/useEffect)
- [Expo Router layouts](https://docs.expo.dev/router/basics/navigation-layouts/)
