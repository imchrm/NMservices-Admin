# Техническое задание: Admin Panel (React Admin)

**Тип проекта:** Frontend приложение (Single Page Application)
**Версия:** 1.2 (Final)
**Дата:** 2026-01-25

## 1. Общее описание
Разработка веб-интерфейса (административной панели) для управления пользователями и заказами. Приложение является полностью независимым клиентом, взаимодействующим с REST API.

**Ключевые особенности:**
- Client-side rendering (SPA).
- Отсутствие зависимости от серверных шаблонов.
- Хранение сессии на клиенте (`localStorage`).

## 2. Технический стек

### Core
- **React** 18.2+
- **TypeScript** 5.9+
- **Vite** 7.2+

### Framework
- **react-admin** 5.14+
- **ra-data-simple-rest** 5.14+

### UI/UX
- **Material-UI (MUI)** 6.x (встроен в react-admin 5)
- **@mui/icons-material**

## 3. Контракт Backend API

Frontend-приложение должно реализовывать взаимодействие с API согласно следующим правилам:

### 3.1. Базовые параметры
- **Base URL:** Задается через `.env`.
- **Auth Header:** `X-API-Key: <key>` (во всех запросах).
- **Date Format:** ISO 8601 (`YYYY-MM-DDTHH:mm:ss.ssssss`).

### 3.2. Параметры запросов (Query Params)
API ожидает параметры в следующем формате:

| Параметр Frontend | Параметр API | Описание / Преобразование |
|-------------------|--------------|---------------------------|
| Pagination (Page) | `skip` | `(page - 1) * perPage` |
| Pagination (Limit)| `limit` | `perPage` |
| Sort Field | `sort_by` | Название поля (напр. `created_at`) |
| Sort Order | `order` | `asc` или `desc` (в нижнем регистре) |
| Filter (Orders) | `status_filter`| Строка статуса (напр. `pending`) |

### 3.3. Формат ответов
**Успешный ответ (List):**
```json
{
  "users": [...], // или "orders": [...]
  "total": 100
}
```

**Ошибки (422 Unprocessable Entity):**
Стандартный формат Pydantic/FastAPI:
```json
{
  "detail": [
    {
      "loc": ["body", "phone_number"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

## 4. Структура проекта

```
admin-panel/
├── src/
│   ├── providers/
│   │   ├── authProvider.ts         # Управление сессией + Timeout
│   │   └── dataProvider.ts         # Адаптер API (Core Logic)
│   ├── users/                      # Компоненты управления пользователями
│   ├── orders/                     # Компоненты управления заказами
│   ├── types/                      # TypeScript интерфейсы
│   ├── App.tsx                     # Роутинг и конфигурация ресурсов
│   └── main.tsx                    # Точка входа
├── .env                            # VITE_API_URL
└── vite.config.ts
```

## 5. Реализация Data Provider (`src/providers/dataProvider.ts`)

Необходимо реализовать кастомный Data Provider.

### 5.1. Маппинг запросов (getList)
При формировании URL для `GET` запросов:
1.  **Пагинация:** Преобразовывать `page/perPage` в `skip/limit`.
2.  **Сортировка:** Преобразовывать `sort.field` в `sort_by`, а `sort.order` ("ASC"/"DESC") приводить к нижнему регистру (`asc`/`desc`) для параметра `order`.
3.  **Фильтрация:**
    - Для ресурса `orders`: если передан фильтр по статусу, добавлять параметр `status_filter`.

### 5.2. Обработка ошибок (Error Handling)
В `httpClient` добавить перехватчик (interceptor):
- Если статус ответа **422**:
    - Распарсить массив `detail` из тела ответа.
    - Сформировать объект ошибок вида `{ field_name: "Error message" }`.
    - Выбросить исключение `HttpError` с кодом 422 и сформированным объектом для подсветки полей в формах React Admin.
- Если статус **401/403**:
    - Выполнить Logout (очистка localStorage) и редирект на Login.

### 5.3. Массовые операции (DeleteMany)
Поскольку API не поддерживает удаление массивом ID:
- Реализовать метод `deleteMany` через `Promise.all`, отправляя отдельный `DELETE` запрос для каждого ID.

### 5.4. Обновление (Update)
- Использовать метод `PATCH`.
- Отправлять JSON с обновляемыми полями.

## 6. Функциональные требования

### 6.1. Аутентификация и Безопасность
- **Хранение:** `localStorage`.
- **Session Timeout:** Реализовать проверку времени жизни сессии (8 часов). При истечении — разлогинивать пользователя.
- **CSP:** При деплое обеспечить корректные заголовки Content-Security-Policy.

### 6.2. Модуль "Пользователи" (`admin/users`)
- **List:**
    - Поля: ID, Phone Number, Created At, Updated At.
    - Сортировка: Включена для всех полей.
- **Create:**
    - Поля: Phone Number (обязательно).
    - Валидация: Обработка 422 ошибки от сервера (например, если формат неверен).
- **Show:**
    - Просмотр деталей пользователя.
    - Связанный список заказов (`ReferenceManyField`).

### 6.3. Модуль "Заказы" (`admin/orders`)
- **List:**
    - Поля: ID, Status, Total Amount, Created At.
    - Сортировка: По дате, сумме, статусу.
    - Фильтрация: Выпадающий список по статусу (`status_filter`).
- **Show/Edit:**
    - Возможность изменения статуса и примечаний.

## 7. TypeScript Интерфейсы

**`src/types/index.ts`**

```typescript
export interface User {
    id: number;
    phone_number: string;
    created_at: string; // ISO 8601 string
    updated_at: string;
}

export interface Order {
    id: number;
    user_id: number;
    status: string; // 'pending', 'completed', 'cancelled' etc.
    total_amount: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
```

## 8. Развертывание (Deployment)

### 8.1. Сборка
- Команда: `npm run build`.
- Артефакт: Статические файлы в директории `dist/`.

### 8.2. Конфигурация окружения (.env)
```bash
VITE_API_URL=https://api.example.com
```

### 8.3. Требования к хостингу
- Поддержка SPA (все маршруты должны перенаправляться на `index.html`, кроме статических ассетов).
- Рекомендовано: Vercel, Netlify или Nginx.

**Пример Nginx config:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```