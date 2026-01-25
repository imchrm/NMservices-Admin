import { Edit, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <NumberInput source="amount" />
            <TextInput source="status" />
            <TextInput source="notes" multiline />
        </SimpleForm>
    </Edit>
);
