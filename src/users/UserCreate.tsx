import { Create, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const UserCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="phone_number" label="Phone Number" required />
            <NumberInput source="telegram_id" label="Telegram ID" />
            <TextInput source="language_code" label="Language Code" />
        </SimpleForm>
    </Create>
);
