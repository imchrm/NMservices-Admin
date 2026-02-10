import {
    BooleanField,
    DateField,
    NumberField,
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin';

export const ServiceShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <NumberField source="base_price" label="Price" options={{ style: 'decimal', minimumFractionDigits: 2 }} />
            <NumberField source="duration_minutes" label="Duration (min)" />
            <BooleanField source="is_active" label="Active" />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="updated_at" label="Updated" showTime />
        </SimpleShowLayout>
    </Show>
);
