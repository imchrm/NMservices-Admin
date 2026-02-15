import {
    Datagrid,
    DateField,
    DateInput,
    List,
    NumberField,
    ReferenceManyField,
    ReferenceField,
    TextField,
} from 'react-admin';

const userFilters = [
    <DateInput key="date_from" source="date_from" label="From" alwaysOn />,
    <DateInput key="date_to" source="date_to" label="To" alwaysOn />,
];

const UserOrdersExpand = () => (
    <ReferenceManyField reference="admin/orders" target="user_id" label="Orders">
        <Datagrid bulkActionButtons={false} rowClick="show">
            <TextField source="id" label="Order ID" />
            <TextField source="status" />
            <NumberField source="total_amount" label="Amount" options={{ style: 'decimal', minimumFractionDigits: 2 }} />
            <ReferenceField source="service_id" reference="admin/services" label="Service" link={false}>
                <TextField source="name" />
            </ReferenceField>
            <DateField source="created_at" label="Created" />
        </Datagrid>
    </ReferenceManyField>
);

export const UserList = () => (
    <List filters={userFilters}>
        <Datagrid rowClick="show" expand={<UserOrdersExpand />}>
            <TextField source="id" />
            <TextField source="phone_number" label="Phone" />
            <TextField source="telegram_id" label="Telegram ID" />
            <TextField source="language_code" label="Language" />
            <DateField source="created_at" label="Created" />
            <DateField source="updated_at" label="Updated" />
        </Datagrid>
    </List>
);
