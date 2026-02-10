import {
    BooleanInput,
    Edit,
    NumberInput,
    SimpleForm,
    TextInput,
} from 'react-admin';

export const ServiceEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" required />
            <TextInput source="description" multiline fullWidth />
            <NumberInput source="base_price" label="Price" />
            <NumberInput source="duration_minutes" label="Duration (min)" />
            <BooleanInput source="is_active" label="Active" />
        </SimpleForm>
    </Edit>
);
