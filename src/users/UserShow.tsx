import {
    Datagrid,
    DateField,
    NumberField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin';

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="phone_number" label="Phone" />
            <TextField source="telegram_id" label="Telegram ID" />
            <TextField source="language_code" label="Language" />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="updated_at" label="Updated" showTime />

            <ReferenceManyField label="Orders" reference="admin/orders" target="user_id">
                <Datagrid rowClick="show">
                    <TextField source="id" />
                    <TextField source="status" />
                    <NumberField source="total_amount" label="Amount" />
                    <DateField source="created_at" label="Created" />
                </Datagrid>
            </ReferenceManyField>
        </SimpleShowLayout>
    </Show>
);
