import { Datagrid, DateField, NumberField, ReferenceManyField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="phone" />
            <DateField source="created_at" />
            <DateField source="updated_at" />

            <ReferenceManyField label="Orders" reference="admin/orders" target="user_id">
                <Datagrid rowClick="show">
                    <TextField source="id" />
                    <TextField source="status" />
                    <NumberField source="amount" />
                    <DateField source="created_at" />
                </Datagrid>
            </ReferenceManyField>
        </SimpleShowLayout>
    </Show>
);
