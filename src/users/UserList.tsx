import { Datagrid, DateField, DateInput, List, TextField } from 'react-admin';

const userFilters = [
    <DateInput key="date_from" source="date_from" label="From" alwaysOn />,
    <DateInput key="date_to" source="date_to" label="To" alwaysOn />,
];

export const UserList = () => (
    <List filters={userFilters}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="phone_number" label="Phone" />
            <TextField source="telegram_id" label="Telegram ID" />
            <TextField source="language_code" label="Language" />
            <DateField source="created_at" label="Created" />
            <DateField source="updated_at" label="Updated" />
        </Datagrid>
    </List>
);
