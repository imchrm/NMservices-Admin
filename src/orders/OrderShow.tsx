import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const OrderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="status" />
            <NumberField source="amount" />
            <TextField source="notes" />
            <DateField source="created_at" />
            <DateField source="updated_at" />

            <ReferenceField label="User" source="user_id" reference="admin/users">
                <TextField source="phone" />
            </ReferenceField>
        </SimpleShowLayout>
    </Show>
);
