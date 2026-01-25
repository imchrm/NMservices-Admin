import { Create, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const OrderCreate = () => (
    <Create>
        <SimpleForm>
            <NumberInput source="amount" />
            <TextInput source="status" />
            <TextInput source="notes" multiline />
        </SimpleForm>
    </Create>
);
