import {
    DateField,
    NumberField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin';

export const OrderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField label="User" source="user_id" reference="admin/users" link="show">
                <TextField source="phone_number" />
            </ReferenceField>
            <ReferenceField label="Service" source="service_id" reference="services" link="show">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
            <NumberField source="total_amount" label="Amount" />
            <TextField source="address_text" label="Address" />
            <DateField source="scheduled_at" label="Scheduled" showTime />
            <TextField source="notes" />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="updated_at" label="Updated" showTime />
        </SimpleShowLayout>
    </Show>
);
