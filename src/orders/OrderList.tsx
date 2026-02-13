import {
    Datagrid,
    DateField,
    DateInput,
    List,
    NumberField,
    ReferenceField,
    SelectInput,
    TextField,
} from 'react-admin';
import { API_CONFIG } from '../config/api';

const orderFilters = [
    <SelectInput
        key="status"
        source="status"
        label="Status"
        choices={API_CONFIG.ORDER_STATUSES.map(s => ({ id: s.id, name: s.name }))}
        alwaysOn
    />,
    <DateInput key="date_from" source="date_from" label="From" alwaysOn />,
    <DateInput key="date_to" source="date_to" label="To" alwaysOn />,
];

export const OrderList = () => (
    <List filters={orderFilters}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <ReferenceField label="User" source="user_id" reference="admin/users" link="show">
                <TextField source="phone_number" />
            </ReferenceField>
            <TextField source="status" />
            <NumberField source="total_amount" label="Amount" />
            <TextField source="address_text" label="Address" />
            <DateField source="scheduled_at" label="Scheduled" showTime />
            <DateField source="created_at" label="Created" />
        </Datagrid>
    </List>
);
