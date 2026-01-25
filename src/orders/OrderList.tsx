import { Datagrid, List, NumberField, TextField, TextInput } from 'react-admin';

const orderFilters = [
    <TextInput source="status" label="Status" alwaysOn />,
];

export const OrderList = () => (
    <List filters={orderFilters}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="status" />
            <NumberField source="amount" />
        </Datagrid>
    </List>
);
