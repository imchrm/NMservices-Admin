# Проблема: Несоответствие auth-ключей в /services endpoints

**Дата:** 2026-02-11
**Статус:** Требует решения
**Затрагивает:** NMservices (Backend), NMservices-Admin (Admin Panel)
**Приоритет:** Средний (не блокирует, но нарушает архитектуру безопасности)

---

## 1. Суть проблемы

### Первоначальный замысел

В проекте предусмотрены два уровня доступа через разные ключи:

| Ключ | Заголовок | Кто использует | Для чего |
|------|-----------|----------------|----------|
| API Key | `X-API-Key` | Telegram-бот (клиент) | Регистрация пользователей, создание заказов, чтение каталога услуг |
| Admin Key | `X-Admin-Key` | Admin Panel (администратор) | Управление пользователями, заказами, статистика |

Это разделение реализовано в `src/nms/api/dependencies.py`:

```python
# Два независимых ключа
get_api_key()   → проверяет X-API-Key   (для бота)
get_admin_key() → проверяет X-Admin-Key (для админки)
```

### Что сейчас не так

Все endpoints `/services` (включая write-операции) используют `get_api_key` вместо `get_admin_key`:

**Файл:** `src/nms/api/services.py`

| Endpoint | Метод | Текущий auth | Комментарий в коде | Проблема |
|----------|-------|--------------|--------------------|----------|
| `/services` | GET | `get_api_key` | "Get list of services" | OK — бот читает каталог |
| `/services/{id}` | GET | `get_api_key` | "Get service by ID" | OK — бот читает детали |
| `/services` | POST | `get_api_key` | **"Create new service (admin)"** | BUG — бот может создавать услуги |
| `/services/{id}` | PATCH | `get_api_key` | **"Update service (admin)"** | BUG — бот может редактировать услуги |
| `/services/{id}` | DELETE | `get_api_key` | **"Deactivate service (admin)"** | BUG — бот может удалять услуги |

Обратите внимание: в summary самих endpoints написано `(admin)`, но dependency — `get_api_key`. Это подтверждает, что это непреднамеренная ошибка, а не осознанное решение.

### Для сравнения — правильная реализация в `/admin/*`

Все endpoints под `/admin/*` корректно используют `get_admin_key`:

```
/admin/users/*    → get_admin_key ✓
/admin/orders/*   → get_admin_key ✓
/admin/stats      → get_admin_key ✓
```

---

## 2. Последствия

### Безопасность
Любой клиент с `X-API-Key` (в т.ч. Telegram-бот) может:
- Создавать новые услуги (`POST /services`)
- Изменять цены, названия, описания (`PATCH /services/{id}`)
- Деактивировать услуги (`DELETE /services/{id}`)

Это нарушение принципа минимальных привилегий — бот должен только **читать** каталог.

### Влияние на Admin Panel
Admin Panel сейчас вынужден хранить и отправлять **оба ключа**: `X-Admin-Key` для `/admin/*` и `X-API-Key` для `/services`. Это усложняет конфигурацию и нарушает принцип "один клиент — один ключ".

---

## 3. Полная карта auth по endpoints (текущее состояние)

### Endpoints с `X-API-Key` (get_api_key)

```
POST   /users/register                → Регистрация (бот)
GET    /users/by-telegram/{id}        → Поиск пользователя (бот)
PATCH  /users/{id}/language           → Смена языка (бот)
POST   /orders                        → Создание заказа (бот)
GET    /services                      → Каталог услуг (бот) ← OK
GET    /services/{id}                 → Детали услуги (бот) ← OK
POST   /services                      → Создание услуги ← ОШИБКА
PATCH  /services/{id}                 → Редактирование  ← ОШИБКА
DELETE /services/{id}                 → Деактивация     ← ОШИБКА
POST   /register                      → (deprecated)
POST   /create_order                  → (deprecated)
```

### Endpoints с `X-Admin-Key` (get_admin_key)

```
GET    /admin/users                   → Список пользователей
POST   /admin/users                   → Создание пользователя
GET    /admin/users/{id}              → Детали пользователя
DELETE /admin/users/{id}              → Удаление пользователя
GET    /admin/users/{id}/orders       → Заказы пользователя
GET    /admin/orders                  → Список заказов
POST   /admin/orders                  → Создание заказа
GET    /admin/orders/{id}             → Детали заказа
PATCH  /admin/orders/{id}             → Редактирование заказа
DELETE /admin/orders/{id}             → Удаление заказа
GET    /admin/stats                   → Статистика
```

### Без авторизации

```
GET    /                              → Health check
```

---

## 4. Предлагаемое решение

### Вариант A: Перенести write-операции в `/admin/services/*` (рекомендуется)

Создать новые admin-endpoints для услуг, аналогично `/admin/users` и `/admin/orders`:

**Backend (NMservices) — изменения:**

```
# Оставить как есть (X-API-Key, для бота):
GET    /services                      → чтение каталога
GET    /services/{id}                 → чтение деталей

# Новые endpoints (X-Admin-Key, для админки):
GET    /admin/services                → список всех услуг (вкл. неактивные)
POST   /admin/services                → создание услуги
PATCH  /admin/services/{id}           → редактирование услуги
DELETE /admin/services/{id}           → деактивация услуги

# Удалить (или сделать deprecated):
POST   /services                      → deprecated, перенесён в /admin/services
PATCH  /services/{id}                 → deprecated
DELETE /services/{id}                 → deprecated
```

**Конкретные шаги в NMservices:**

1. Создать `src/nms/api/admin/services.py` — новый роутер с `get_admin_key`
2. Перенести логику POST/PATCH/DELETE из `src/nms/api/services.py`
3. Добавить `include_inactive` по умолчанию в `GET /admin/services` (админ видит все)
4. Зарегистрировать новый роутер в `main.py`
5. В `src/nms/api/services.py` — оставить только GET (read-only для бота)
6. Обновить тесты

**Admin Panel (NMservices-Admin) — изменения:**

1. В `App.tsx` — изменить ресурс `services` на `admin/services`
2. В `dataProvider.ts` — убрать special-case для services (все `/admin/*` уже используют `X-Admin-Key`)
3. Удалить `API_AUTH_HEADER` и `API_AUTH_STORAGE_KEY` из config (админке больше не нужен `X-API-Key`)

**Плюсы:**
- Полное соответствие первоначальному замыслу: один клиент — один ключ
- Admin Panel использует только `X-Admin-Key`
- Бот не может модифицировать каталог
- Консистентная структура: все admin-операции под `/admin/*`

**Минусы:**
- Нужны изменения в обоих репозиториях
- Нужно обновить тесты

### Вариант B: Исправить auth в существующих `/services` endpoints

Оставить URL-структуру как есть, но поменять auth на write-операциях:

```python
# services.py — изменить 3 строки:
@router.post("", dependencies=[Depends(get_admin_key)], ...)     # было get_api_key
@router.patch("/{id}", dependencies=[Depends(get_admin_key)], ...)  # было get_api_key
@router.delete("/{id}", dependencies=[Depends(get_admin_key)], ...) # было get_api_key
```

**Плюсы:**
- Минимальные изменения (3 строки в Backend)
- Быстро

**Минусы:**
- `/services` POST/PATCH/DELETE потребуют `X-Admin-Key`, но URL не указывает на admin-ресурс
- Admin Panel по-прежнему обращается к `/services` (не `/admin/services`), что нарушает единообразие
- Один URL `/services` будет требовать разные ключи для чтения (X-API-Key) и записи (X-Admin-Key)

### Вариант C: Оставить как есть

Не менять ничего, принять что `/services` CRUD доступен по `X-API-Key`.

**Плюсы:**
- Ноль работы

**Минусы:**
- Бот технически может менять каталог услуг
- Admin Panel хранит два ключа
- Нарушение security-модели

---

## 5. Рекомендация

**Вариант A** — единственный, который полностью решает проблему и приводит архитектуру в соответствие с замыслом. Объём работ невелик: новый файл `admin/services.py` в Backend + минимальные правки в Admin Panel.

---

## 6. Связанные файлы

### Backend (NMservices)
- `src/nms/api/dependencies.py` — определение `get_api_key` и `get_admin_key`
- `src/nms/api/services.py` — **здесь баг** (строки 91, 127, 168)
- `src/nms/api/admin/users.py` — пример правильной реализации
- `src/nms/api/admin/orders.py` — пример правильной реализации
- `src/nms/main.py` — регистрация роутеров

### Admin Panel (NMservices-Admin)
- `src/config/api.ts` — хранит оба ключа (должен хранить только admin)
- `src/providers/dataProvider.ts` — special-case для services auth
- `src/App.tsx` — ресурс `services` (станет `admin/services`)
