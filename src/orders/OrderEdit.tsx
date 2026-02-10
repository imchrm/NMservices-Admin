import {
    Edit,
    NumberInput,
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
            <NumberInput source="total_amount" label="Amount" />
            <TextInput source="notes" multiline fullWidth />
        </SimpleForm>
    </Edit>
);
