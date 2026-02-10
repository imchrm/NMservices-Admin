import {
    BooleanField,
    Datagrid,
    DateField,
    List,
    NumberField,
    TextField,
    TextInput,
    BooleanInput,
} from 'react-admin';

const serviceFilters = [
    <TextInput key="name" source="name" label="Name" alwaysOn />,
    <BooleanInput key="include_inactive" source="include_inactive" label="Include inactive" />,
];

export const ServiceList = () => (
    <List filters={serviceFilters}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="name" />
            <NumberField source="base_price" label="Price" options={{ style: 'decimal', minimumFractionDigits: 2 }} />
            <NumberField source="duration_minutes" label="Duration (min)" />
            <BooleanField source="is_active" label="Active" />
            <DateField source="created_at" label="Created" />
        </Datagrid>
    </List>
);
