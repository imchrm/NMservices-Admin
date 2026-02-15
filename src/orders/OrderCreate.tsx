import {
    AutocompleteInput,
    Create,
    DateTimeInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { API_CONFIG } from '../config/api';
import { AutoAmountInput } from './AutoAmountInput';

export const OrderCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="user_id" reference="admin/users">
                <AutocompleteInput
                    label="User"
                    optionText={(record) => record ? `${record.id} (${record.phone_number})` : ''}
                    filterToQuery={(q: string) => ({ q })}
                />
            </ReferenceInput>
            <ReferenceInput source="service_id" reference="admin/services" />
            <SelectInput
                source="status"
                choices={API_CONFIG.ORDER_STATUSES.map(s => ({ id: s.id, name: s.name }))}
                defaultValue="pending"
            />
            <AutoAmountInput />
            <TextInput source="address_text" label="Address" fullWidth />
            <DateTimeInput source="scheduled_at" label="Scheduled" />
            <TextInput source="notes" multiline fullWidth />
        </SimpleForm>
    </Create>
);
