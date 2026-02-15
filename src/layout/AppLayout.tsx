import { AppBar, Layout, type LayoutProps } from 'react-admin';
import { Typography, Box } from '@mui/material';

const VersionAppBar = () => (
    <AppBar>
        <Box flex={1} />
        <Typography variant="caption" sx={{ opacity: 0.7, mr: 2 }}>
            v{__APP_VERSION__}
        </Typography>
    </AppBar>
);

export const AppLayout = (props: LayoutProps) => (
    <Layout {...props} appBar={VersionAppBar} />
);
