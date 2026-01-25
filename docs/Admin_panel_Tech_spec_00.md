# Техническое задание: Admin Panel (React Admin)

**Тип проекта:** Frontend приложение (Single Page Application)
**Версия:** 1.0

## 1. Общее описание
Разработка веб-интерфейса (административной панели) для управления пользователями и заказами базы данных через существующий REST API. Приложение должно быть полностью независимым от серверной части, с собственной сборкой и циклом развертывания.

## 2. Технический стек

### Core
- **React** 18.2+
- **TypeScript** 5.3+
- **Vite** 5.0+ (Сборщик)

### Framework
- **react-admin** 4.16+ (Основной фреймворк)
- **ra-data-simple-rest** 4.16+ (Data Provider)

### UI/UX
- **Material-UI (MUI)** 5.15+
- **@mui/icons-material**
- **@emotion/react** + **@emotion/styled**

### Взаимодействие с API
- **Fetch API** (через react-admin)
- Аутентификация через заголовок `X-Admin-Key`

## 3. Требования к Backend API (Контракт)

Приложение должно взаимодействовать с API по следующим правилам:

*   **Base URL:** Настраивается через `.env` (например, `http://localhost:8000`).
*   **Auth Header:** Все запросы должны содержать заголовок `X-Admin-Key: <secret_key>`.
*   **Pagination:** Параметры `skip` и `limit`.
*   **Response Format:**
    ```json
    {
      "users": [...], // или "orders": [...]
      "total": 100
    }
    ```

## 4. Структура проекта

Предлагаемая структура файлов и директорий:

```
admin-panel/
├── src/
│   ├── App.tsx                     # Конфигурация ресурсов React Admin
│   ├── main.tsx                    # Точка входа
│   ├── vite-env.d.ts
│   │
│   ├── providers/
│   │   ├── authProvider.ts         # Логика входа/выхода
│   │   └── dataProvider.ts         # Адаптер для REST API
│   │
│   ├── dashboard/
│   │   └── Dashboard.tsx           # Главная страница (статистика)
│   │
│   ├── users/                      # Управление пользователями
│   │   ├── UserList.tsx
│   │   ├── UserShow.tsx
│   │   └── UserCreate.tsx
│   │
│   ├── orders/                     # Управление заказами
│   │   ├── OrderList.tsx
│   │   ├── OrderShow.tsx
│   │   ├── OrderCreate.tsx
│   │   └── OrderEdit.tsx
│   │
│   └── types/                      # TypeScript интерфейсы
│       ├── user.ts
│       └── order.ts
│
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 5. Реализация ключевых модулей

### 5.1. Auth Provider (`src/providers/authProvider.ts`)
Логика аутентификации без использования cookie/session, только локальное хранение ключа.

*   **Login:** Принимает введенный ключ, сохраняет в `localStorage`.
*   **Logout:** Удаляет ключ из `localStorage`.
*   **CheckAuth:** Проверяет наличие ключа.
*   **CheckError:** При получении статусов 401 или 403 выполняет logout.

### 5.2. Data Provider (`src/providers/dataProvider.ts`)
Кастомная обертка над `simpleRestProvider` для соответствия спецификации API:

1.  **HttpClient:** Автоматически добавляет заголовок `X-Admin-Key` из localStorage ко всем запросам.
2.  **GetList:** Конвертирует параметры пагинации `page/perPage` в `skip/limit`. Обрабатывает ответ, извлекая массив данных (из поля `users` или `orders`) и общее количество (`total`).
3.  **Update:** Использует метод `PATCH` вместо стандартного `PUT`.

### 5.3. Конфигурация приложения (`src/App.tsx`)
Описание ресурсов:

```typescript
<Admin dataProvider={dataProvider} authProvider={authProvider} dashboard={Dashboard}>
    <Resource name="admin/users" list={UserList} show={UserShow} create={UserCreate} />
    <Resource name="admin/orders" list={OrderList} show={OrderShow} create={OrderCreate} edit={OrderEdit} />
</Admin>
```

## 6. Функциональные требования к интерфейсу

### 6.1. Аутентификация
- Экран входа с одним полем (API Key).
- Обработка ошибок неверного ключа.

### 6.2. Dashboard (Главная)
- Отображение виджетов статистики (данные из endpoint `/admin/stats`).
- Ключевые метрики: Всего пользователей, Всего заказов.

### 6.3. Пользователи (Users)
- **List:** Таблица с ID, телефоном, датами создания/обновления.
- **Show:** Карточка пользователя + связанный список его заказов (ReferenceManyField).
- **Create:** Форма создания (обязательное поле: телефон).

### 6.4. Заказы (Orders)
- **List:** Таблица с ID, статусом, суммой. Фильтрация по статусу.
- **Show:** Детальная информация о заказе, ссылка на пользователя.
- **Create/Edit:** Управление статусом, примечаниями, суммой. Используется метод PATCH для обновлений.

## 7. Интеграция (Endpoints Mapping)

| Ресурс React Admin | Метод API | Endpoint API |
|-------------------|-----------|--------------|
| `admin/users` (list) | GET | `/admin/users?skip=0&limit=25` |
| `admin/users` (create) | POST | `/admin/users` |
| `admin/users` (getOne) | GET | `/admin/users/{id}` |
| `admin/orders` (list) | GET | `/admin/orders?skip=0&limit=25` |
| `admin/orders` (update) | PATCH | `/admin/orders/{id}` |

## 8. Сборка и запуск

### Development
```bash
npm install
# Создать .env файл
# VITE_API_URL=http://localhost:8000
npm run dev
```

### Production Build
```bash
npm run build
# Результат в папке dist/
```

### Environment Variables
Файл `.env` должен содержать:
- `VITE_API_URL` — URL адрес API сервера (например, `https://api.example.com`).

## 9. Деплой

Приложение собирается в статические файлы (`dist/`) и может быть развернуто на любом веб-сервере (Nginx, Apache) или CDN-платформе (Vercel, Netlify).

**Пример конфигурации Nginx:**
```nginx
server {
    listen 80;
    server_name admin.example.com;
    root /var/www/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```