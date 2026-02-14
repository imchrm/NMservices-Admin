import {
    Create,
    DateTimeInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { API_CONFIG } from '../config/api';

export const OrderCreate = () => (
    <Create>
        <SimpleForm>
            <NumberInput source="user_id" label="User ID" required />
            <ReferenceInput source="service_id" reference="admin/services" />
            <SelectInput
                source="status"
                choices={API_CONFIG.ORDER_STATUSES.map(s => ({ id: s.id, name: s.name }))}
                defaultValue="pending"
            />
            <NumberInput source="total_amount" label="Amount" />
            <TextInput source="address_text" label="Address" fullWidth />
            <DateTimeInput source="scheduled_at" label="Scheduled" />
            <TextInput source="notes" multiline fullWidth />
        </SimpleForm>
    </Create>
);
