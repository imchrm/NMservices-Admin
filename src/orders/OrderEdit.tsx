import {
    DateTimeInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { API_CONFIG } from '../config/api';

export const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <SelectInput
                source="status"
                choices={API_CONFIG.ORDER_STATUSES.map(s => ({ id: s.id, name: s.name }))}
            />
            <ReferenceInput source="service_id" reference="services" />
            <NumberInput source="total_amount" label="Amount" />
            <TextInput source="address_text" label="Address" fullWidth />
            <DateTimeInput source="scheduled_at" label="Scheduled" />
            <TextInput source="notes" multiline fullWidth />
        </SimpleForm>
    </Edit>
);
