# ТЗ Frontend — NMservices-Admin

## Общие сведения

- **Репозиторий:** NMservices-Admin
- **Стек:** React 18 + React-Admin v5 + Material-UI v6 + TypeScript
- **Ветка:** `claude/review-admin-panel-context-u8OxO`

---

## Задача 1: UI фильтра дат (диапазон от–до)

### Цель
Добавить в списки Orders, Services и Users компонент фильтрации по диапазону дат (`created_at`).

### Затрагиваемые файлы

| Файл | Что меняется |
|---|---|
| `src/orders/OrderList.tsx` | Добавить `DateInput` фильтры `date_from`, `date_to` |
| `src/services/ServiceList.tsx` | Добавить `DateInput` фильтры `date_from`, `date_to` |
| `src/users/UserList.tsx` | Добавить `DateInput` фильтры `date_from`, `date_to` |
| `src/providers/dataProvider.ts` | Обеспечить передачу `date_from` / `date_to` как query-параметров |

### Спецификация

#### UI-компонент

Используем стандартный `DateInput` из `react-admin`:

```tsx
import { DateInput } from 'react-admin';

// Добавить в массив фильтров каждого списка:
<DateInput key="date_from" source="date_from" label="From" alwaysOn />
<DateInput key="date_to" source="date_to" label="To" alwaysOn />
```

#### Поведение
- Фильтры `date_from` и `date_to` отображаются **всегда** (`alwaysOn`) в панели фильтров
- При выборе даты — react-admin передаёт значение в `dataProvider.getList()` как часть `params.filter`
- Значения передаются на backend как ISO-строки (формат: `YYYY-MM-DD` или `YYYY-MM-DDTHH:mm:ss`)

#### Data Provider

Функция `buildFilterParams` в `dataProvider.ts` уже пробрасывает все неизвестные фильтры напрямую. Параметры `date_from` и `date_to` будут переданы на backend **без дополнительных изменений**.

Проверить, что `DateInput` передаёт значения в нужном формате. При необходимости — добавить трансформацию в `buildFilterParams`:

```ts
// Если react-admin передаёт Date-объект, конвертировать в ISO-строку:
if (key === 'date_from' || key === 'date_to') {
    result[key] = value instanceof Date ? value.toISOString() : value;
}
```

---

## Задача 2: Использование `total_services` из `/admin/stats`

### Цель
Убрать отдельный fetch к `/admin/services?limit=1` для получения количества сервисов. Вместо этого брать `total_services` из ответа `/admin/stats`.

### Затрагиваемый файл

| Файл | Что меняется |
|---|---|
| `src/dashboard/Dashboard.tsx` | Убрать `fetchServices()`, использовать `stats.total_services` |

### Спецификация

#### Изменение интерфейса `Stats`

```ts
interface Stats {
    total_users: number;
    total_orders: number;
    total_services: number;    // <-- НОВОЕ ПОЛЕ
    orders_by_status: Record<string, number>;
}
```

#### Удалить

- State `servicesCount` и `setServicesCount`
- Функцию `fetchServices()`
- Вызов `fetchServices()` в `useEffect`

#### Заменить в JSX

```diff
- {servicesCount !== null ? servicesCount : '—'}
+ {stats ? stats.total_services : '—'}
```

---

## Задача 3: Кнопка деактивации сервиса из карточки

### Цель
Добавить кнопку "Deactivate" на страницу просмотра сервиса (`ServiceShow`) с модальным окном подтверждения.

### Затрагиваемый файл

| Файл | Что меняется |
|---|---|
| `src/services/ServiceShow.tsx` | Добавить кнопку Deactivate + модальное окно |

### Спецификация

#### UI

1. **Кнопка "Deactivate"** — отображается в toolbar карточки сервиса
   - Видна **только** если сервис активен (`is_active === true`)
   - Цвет: `warning` или `error` (MUI Button variant)

2. **Модальное окно подтверждения** (MUI `Dialog`):
   - Заголовок: "Deactivate Service"
   - Текст: "Are you sure you want to deactivate this service? It will no longer be available for new orders."
   - Кнопки: "Cancel" (закрыть) и "Deactivate" (выполнить)

#### Логика

При нажатии "Deactivate" в модальном окне:

1. Вызвать `dataProvider.delete('admin/services', { id: record.id })`
   - Это отправит `DELETE /admin/services/{id}` на backend
   - Backend выполнит soft-delete (`is_active = False`)
2. Показать уведомление об успехе (`useNotify`)
3. Обновить данные (`useRefresh`) для отображения нового статуса
4. Закрыть модальное окно

#### Пример реализации

```tsx
import { useState } from 'react';
import {
    Show, SimpleShowLayout, TextField, NumberField,
    BooleanField, DateField, useRecordContext,
    useDataProvider, useNotify, useRefresh,
    TopToolbar,
    EditButton,
} from 'react-admin';
import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const DeactivateButton = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);

    if (!record || !record.is_active) return null;

    const handleDeactivate = async () => {
        try {
            await dataProvider.delete('admin/services', {
                id: record.id,
                previousData: record,
            });
            notify('Service deactivated', { type: 'success' });
            refresh();
        } catch (error) {
            notify('Failed to deactivate service', { type: 'error' });
        }
        setOpen(false);
    };

    return (
        <>
            <Button
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => setOpen(true)}
            >
                Deactivate
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Deactivate Service</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to deactivate this service?
                        It will no longer be available for new orders.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeactivate} color="error">
                        Deactivate
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const ServiceShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeactivateButton />
    </TopToolbar>
);

export const ServiceShow = () => (
    <Show actions={<ServiceShowActions />}>
        <SimpleShowLayout>
            {/* ...existing fields... */}
        </SimpleShowLayout>
    </Show>
);
```

#### Зависимости от backend
- Endpoint `DELETE /admin/services/{id}` **уже реализован** — выполняет `is_active = False`
- Дополнительных изменений backend не требуется
