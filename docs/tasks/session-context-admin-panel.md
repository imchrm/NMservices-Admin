# Контекст сессии: Задача 2 — Admin Panel

## Задача

Реализация полной Admin Panel для проекта NMservices согласно `docs/tasks/MVP_PLAN.md` → Задача 2.

---

## Проект NMservices — текущее состояние

### Что уже сделано (Задача 1 — Backend ✅)

Backend полностью реализован и верифицирован (2026-02-10), auth исправлен (2026-02-11):
- FastAPI + SQLAlchemy 2 (async) + PostgreSQL
- Таблицы: `users`, `orders`, `services`
- API endpoints: чтение каталога услуг (X-API-Key), создание заказов, регистрация пользователей
- Admin API: полный CRUD для пользователей, заказов, **услуг** + статистика (X-Admin-Key)
- `/services` — read-only для бота; write-операции перенесены в `/admin/services`
- Тесты: 41/41 passed
- Версия: 0.6.0

### Инфраструктура

| Компонент | Детали |
|-----------|--------|
| Сервер | `dm@id` (192.168.1.191), Linux |
| Клиент/Разработка | `zum@zu` (Windows) |
| БД | PostgreSQL на dm@id, база `nomus`, user: `postgres` |
| Backend | Python 3.11+, FastAPI, uvicorn, порт 8000 |
| Backend путь (сервер) | `~/dev/python/NMservices` |
| Backend путь (Windows) | `C:\Users\zum\dev\python\NMservices` |
| Admin Panel путь (Windows) | `C:\Users\zum\dev\js\NMservices-Admin` |
| Репозиторий Backend | `imchrm/NMservices` |
| Репозиторий Admin | `imchrm/NMservices-Admin` |

### Аутентификация

Два независимых механизма через заголовки:

| Тип | Заголовок | Env-переменная | Для чего |
|-----|-----------|----------------|----------|
| API Key | `X-API-Key` | `API_SECRET_KEY` | Клиентские endpoints (/users, /orders, /services — только чтение) |
| Admin Key | `X-Admin-Key` | `ADMIN_SECRET_KEY` | Админские endpoints (/admin/*) — все write-операции |

**Принцип:** один клиент — один ключ. Бот использует только `X-API-Key`, Admin Panel использует только `X-Admin-Key`.

Реальные ключи на сервере указаны в `.env` файле проекта NMservices.

### CORS

Настройка в `src/nms/config.py`:
```
CORS_ORIGINS=http://localhost:5173    # Vite dev server (по умолчанию)
```
Разрешённые методы: GET, POST, PUT, PATCH, DELETE, OPTIONS. Headers: все.

**Важно:** для разработки Admin Panel может потребоваться добавить URL в `CORS_ORIGINS` на сервере.

---

## Полная карта API endpoints

### Health Check
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/` | Нет | `{"message": "NoMus API is running"}` |

### Users (X-API-Key)
| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/users/register` | `{phone_number, telegram_id?, language_code?}` | `{status, message, user_id}` |
| GET | `/users/by-telegram/{telegram_id}` | — | `{id, phone_number, telegram_id, language_code, created_at, updated_at}` |
| PATCH | `/users/{user_id}/language` | `{language_code}` | `{status}` |

### Services (X-API-Key) — только чтение
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | `/services?include_inactive=false` | — | `{services: [...], total}` | 200 |
| GET | `/services/{service_id}` | — | `{id, name, description, base_price, duration_minutes, is_active}` | 200 |

> **Примечание:** Write-операции (POST/PATCH/DELETE) перенесены в `/admin/services` — см. ниже.

### Orders (X-API-Key)
| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/orders` | `{user_id, service_id, address_text?, scheduled_at?, notes?}` | `{status, order_id, message}` |

### Admin Users (X-Admin-Key)
| Method | Path | Query params | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/admin/users` | `skip=0, limit=100, sort_by=[id\|phone_number\|created_at\|updated_at], order=[asc\|desc]` | — | `{users: [...], total}` |
| POST | `/admin/users` | — | `{phone_number, telegram_id?, language_code?}` | AdminUserResponse (201) |
| GET | `/admin/users/{user_id}` | — | — | AdminUserResponse |
| DELETE | `/admin/users/{user_id}` | — | — | `{status, message, orders_deleted}` |
| GET | `/admin/users/{user_id}/orders` | — | — | `[AdminOrderResponse, ...]` |

### Admin Orders (X-Admin-Key)
| Method | Path | Query params | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/admin/orders` | `skip=0, limit=100, status_filter?, sort_by=[id\|user_id\|status\|total_amount\|created_at\|updated_at], order=[asc\|desc]` | — | `{orders: [...], total}` |
| POST | `/admin/orders` | — | `{user_id, status?, total_amount?, notes?}` | AdminOrderResponse (201) |
| GET | `/admin/orders/{order_id}` | — | — | AdminOrderWithUserResponse (includes nested user object) |
| PATCH | `/admin/orders/{order_id}` | — | `{status?, total_amount?, notes?}` | AdminOrderResponse |
| DELETE | `/admin/orders/{order_id}` | — | — | `{status, message}` |

### Admin Services (X-Admin-Key)
| Method | Path | Query params | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/admin/services` | `skip=0, limit=100, include_inactive=true, sort_by=[id\|name\|base_price\|is_active], order=[asc\|desc]` | — | `{services: [...], total}` |
| GET | `/admin/services/{service_id}` | — | — | ServiceResponse |
| POST | `/admin/services` | — | `{name, description?, base_price?, duration_minutes?, is_active?}` | ServiceResponse (201) |
| PATCH | `/admin/services/{service_id}` | — | `{name?, description?, base_price?, duration_minutes?, is_active?}` | ServiceResponse |
| DELETE | `/admin/services/{service_id}` | — | — (soft delete: is_active=false) | 204 |

> **Примечание:** `include_inactive=true` по умолчанию — админ видит все услуги, включая деактивированные. Поддерживает сортировку и пагинацию аналогично `/admin/users` и `/admin/orders`.

### Admin Stats (X-Admin-Key)
| Method | Path | Response |
|--------|------|----------|
| GET | `/admin/stats` | `{total_users, total_orders, orders_by_status: {"pending": N, ...}}` |

### Legacy (deprecated)
| Method | Path | Note |
|--------|------|------|
| POST | `/register` | Использовать `/users/register` |
| POST | `/create_order` | Использовать `/orders` |

---

## Схема БД (актуальная, реализованная)

### users
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | SERIAL | PK |
| phone_number | VARCHAR(20) | UNIQUE NOT NULL |
| telegram_id | BIGINT | UNIQUE, nullable |
| language_code | VARCHAR(5) | nullable |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

### services
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | SERIAL | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| base_price | DECIMAL(10,2) | nullable |
| duration_minutes | INTEGER | nullable |
| is_active | BOOLEAN | NOT NULL, default true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

### orders
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | SERIAL | PK |
| user_id | INTEGER | NOT NULL, FK → users.id ON DELETE CASCADE |
| service_id | INTEGER | nullable, FK → services.id ON DELETE SET NULL |
| status | VARCHAR(50) | NOT NULL, default 'pending' |
| total_amount | DECIMAL(10,2) | nullable |
| address_text | TEXT | nullable |
| scheduled_at | TIMESTAMP | nullable |
| notes | TEXT | nullable |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

**Статусы заказов:** pending, confirmed, in_progress, completed, cancelled

### Текущие данные в БД
- **users:** 22+ записей
- **services:** 4 записи (Классический массаж 150000, Спортивный 180000, Спины 100000, Антицеллюлитный 200000)
- **orders:** 22+ записей

---

## Что сделано (Задача 2 — Admin Panel ✅)

### 2.1. Инициализация проекта ✅
- [x] Проект создан: Vite 7.2 + React 18.2 + TypeScript 5.9
- [x] react-admin 5.14 установлен с зависимостями (Material-UI, query-string)
- [x] dataProvider настроен (`src/providers/dataProvider.ts`) — пагинация skip/limit, сортировка sort_by/order, фильтрация, извлечение данных из обёрток API
- [x] authProvider настроен (`src/providers/authProvider.ts`) — login/logout/checkAuth через `X-Admin-Key` в localStorage

### 2.2. Dashboard ✅
- [x] Статистика: кол-во пользователей, заказов (GET /admin/stats), услуг (GET /admin/services)
- [x] Заказы по статусам — цветные Chip (pending=warning, confirmed=info, in_progress=primary, completed=success, cancelled=error)

### 2.3. Услуги (admin/services) ✅
- [x] Список (`ServiceList.tsx`) — таблица с колонками id, name, base_price, duration_minutes, is_active, created_at
- [x] Просмотр (`ServiceShow.tsx`) — детальная карточка со всеми полями
- [x] Создание (`ServiceCreate.tsx`) — форма: name (required), description, base_price, duration_minutes, is_active
- [x] Редактирование (`ServiceEdit.tsx`) — форма с теми же полями
- [x] Деактивация — через поле is_active + стандартный Delete в react-admin

### 2.4. Заказы (admin/orders) ✅
- [x] Список (`OrderList.tsx`) — таблица с фильтрацией по статусу (SelectInput), ссылка на пользователя
- [x] Просмотр (`OrderShow.tsx`) — детали: user (ссылка), service (ссылка), status, total_amount, address_text, scheduled_at, notes
- [x] Редактирование (`OrderEdit.tsx`) — смена статуса (SelectInput), total_amount, notes
- [x] Создание (`OrderCreate.tsx`) — user_id, status, total_amount, notes

### 2.5. Пользователи (admin/users) ✅
- [x] Список (`UserList.tsx`) — таблица: id, phone_number, telegram_id, language_code, created_at, updated_at
- [x] Просмотр (`UserShow.tsx`) — профиль + история заказов (ReferenceManyField → Datagrid)
- [x] Создание (`UserCreate.tsx`) — phone_number (required), telegram_id, language_code

### 2.6. Тесты ✅
- [x] `apiConfig.test.ts` — 6 тестов на конфигурацию
- [x] `authProvider.test.ts` — 9 тестов на авторизацию
- [x] `dataProvider.test.ts` — 15 тестов на CRUD, пагинацию, сортировку, фильтрацию, auth headers
- [x] Итого: 30/30 passed

---

## Особенности реализации dataProvider

### Пагинация
DataProvider конвертирует react-admin пагинацию в формат API:
```
react-admin: { page: 2, perPage: 25 }  →  API: { skip: 25, limit: 25 }
```

### Сортировка
DataProvider маппит react-admin sort в API-параметры:
```
react-admin: { field: 'created_at', order: 'DESC' }  →  API: { sort_by: 'created_at', order: 'desc' }
```

### Фильтрация
Для заказов DataProvider маппит `status` → `status_filter`:
```
react-admin: { status: 'pending' }  →  API: { status_filter: 'pending' }
```

### Ответы — извлечение из обёртки
`extractListData()` извлекает массив по последнему сегменту пути ресурса:
```json
// GET /admin/users → { "users": [...], "total": 5 }     → key = "users"
// GET /admin/orders → { "orders": [...], "total": 10 }   → key = "orders"
// GET /admin/services → { "services": [...], "total": 4 } → key = "services"
```

### Единый auth
- `httpClient()` добавляет `X-Admin-Key` ко всем запросам
- Ключ хранится в `localStorage['x-admin-key']`
- Admin Panel **не использует** `X-API-Key` — все ресурсы под `/admin/*`

---

## Связанные документы

- `docs/tasks/MVP_PLAN.md` — глобальный план (Задача 2)
- `docs/tasks/MVP_services_table.md` — ТЗ на Backend (Задача 1, завершена)
- `docs/development/database-schema-mvp.md` — полная схема БД
- `docs/session-context-mvp-services.md` — контекст предыдущей сессии (Задача 1)
- `docs/tasks/TODO_pydantic_v2_config.md` — мелкий рефакторинг (не блокирует)

---

## Известные нюансы

1. **CORS:** по умолчанию разрешён только `http://localhost:5173`. Если Admin Panel запускается на другом порту — добавить в `CORS_ORIGINS` на сервере (в `.env`)
2. **Единый ключ для Admin Panel:** Admin Panel использует только `X-Admin-Key` для всех ресурсов (`/admin/users`, `/admin/orders`, `/admin/services`, `/admin/stats`). `X-API-Key` не требуется
3. **Сервер запускать из корня:** `cd ~/dev/python/NMservices && poetry run uvicorn nms.main:app --host 0.0.0.0 --port 8000` (не из поддиректории, иначе `.env` не найдётся)
4. **psql доступ:** `sudo -u postgres psql -d nomus` (peer auth, не по паролю)
5. **Swagger UI:** доступен по `http://192.168.1.191:8000/docs` — можно тестировать API интерактивно
6. **Admin Order Create** (`POST /admin/orders`): не принимает `service_id` — это ограничение текущего admin API. Для создания заказа с услугой используется `POST /orders` (с X-API-Key)
