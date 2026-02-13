import { useState } from 'react';
import {
    BooleanField,
    DateField,
    EditButton,
    NumberField,
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const DeactivateButton = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);

    if (!record || !record.is_active) return null;

    const handleDeactivate = async () => {
        try {
            await dataProvider.delete('admin/services', {
                id: record.id,
                previousData: record,
            });
            notify('Service deactivated', { type: 'success' });
            refresh();
        } catch {
            notify('Failed to deactivate service', { type: 'error' });
        }
        setOpen(false);
    };

    return (
        <>
            <Button
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => setOpen(true)}
            >
                Deactivate
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Deactivate Service</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to deactivate this service?
                        It will no longer be available for new orders.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeactivate} color="error">
                        Deactivate
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const ServiceShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeactivateButton />
    </TopToolbar>
);

export const ServiceShow = () => (
    <Show actions={<ServiceShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <NumberField source="base_price" label="Price" options={{ style: 'decimal', minimumFractionDigits: 2 }} />
            <NumberField source="duration_minutes" label="Duration (min)" />
            <BooleanField source="is_active" label="Active" />
            <DateField source="created_at" label="Created" showTime />
            <DateField source="updated_at" label="Updated" showTime />
        </SimpleShowLayout>
    </Show>
);
