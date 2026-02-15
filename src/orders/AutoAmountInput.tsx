import { useEffect } from 'react';
import { NumberInput, useGetOne } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';

export const AutoAmountInput = () => {
    const serviceId = useWatch({ name: 'service_id' });
    const { setValue } = useFormContext();
    const { data: service } = useGetOne(
        'admin/services',
        { id: serviceId },
        { enabled: !!serviceId },
    );

    useEffect(() => {
        if (service?.base_price != null) {
            setValue('total_amount', service.base_price);
        }
    }, [service?.base_price, setValue]);

    return <NumberInput source="total_amount" label="Amount" readOnly />;
};
