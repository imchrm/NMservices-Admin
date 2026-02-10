import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import { Title } from 'react-admin';
import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface Stats {
    total_users: number;
    total_orders: number;
    orders_by_status: Record<string, number>;
}

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
    pending: 'warning',
    confirmed: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error',
};

export const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [servicesCount, setServicesCount] = useState<number | null>(null);

    useEffect(() => {
        const adminToken = localStorage.getItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY);
        if (!adminToken) return;

        const apiUrl = API_CONFIG.getBaseUrl();

        const fetchStats = async () => {
            const headers = new Headers({ Accept: 'application/json' });
            headers.set(API_CONFIG.ADMIN_AUTH_HEADER, adminToken);
            try {
                const response = await fetch(`${apiUrl}/admin/stats`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        const fetchServices = async () => {
            const headers = new Headers({ Accept: 'application/json' });
            const apiToken = localStorage.getItem(API_CONFIG.API_AUTH_STORAGE_KEY);
            if (apiToken) {
                headers.set(API_CONFIG.API_AUTH_HEADER, apiToken);
            }
            try {
                const response = await fetch(`${apiUrl}/services?limit=1`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setServicesCount(data.total);
                }
            } catch (error) {
                console.error('Failed to fetch services count:', error);
            }
        };

        fetchStats();
        fetchServices();
    }, []);

    return (
        <Card>
            <Title title="NMservices — Admin Panel" />
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Dashboard
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Card variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PeopleIcon color="primary" />
                            <Typography color="textSecondary">Users</Typography>
                        </Box>
                        <Typography variant="h4">
                            {stats ? stats.total_users : '—'}
                        </Typography>
                    </Card>

                    <Card variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ShoppingCartIcon color="primary" />
                            <Typography color="textSecondary">Orders</Typography>
                        </Box>
                        <Typography variant="h4">
                            {stats ? stats.total_orders : '—'}
                        </Typography>
                    </Card>

                    <Card variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BuildIcon color="primary" />
                            <Typography color="textSecondary">Services</Typography>
                        </Box>
                        <Typography variant="h4">
                            {servicesCount !== null ? servicesCount : '—'}
                        </Typography>
                    </Card>
                </Box>

                {stats?.orders_by_status && Object.keys(stats.orders_by_status).length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Orders by Status
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.entries(stats.orders_by_status).map(([status, count]) => (
                                <Chip
                                    key={status}
                                    label={`${status}: ${count}`}
                                    color={STATUS_COLORS[status] || 'default'}
                                    variant="outlined"
                                    sx={{ fontSize: '0.9rem', py: 2 }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {!stats && (
                    <Typography sx={{ mt: 2 }} color="textSecondary">
                        Loading statistics...
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
