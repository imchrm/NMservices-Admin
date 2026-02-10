import { Datagrid, DateField, List, TextField } from 'react-admin';

export const UserList = () => (
    <List>
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
