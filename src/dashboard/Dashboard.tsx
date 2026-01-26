import { Card, CardContent, Typography } from '@mui/material';
import { Title } from 'react-admin';
import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface Stats {
    users: number;
    orders: number;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const apiUrl = API_CONFIG.getBaseUrl();
            const token = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY);
            const headers = new Headers({ Accept: 'application/json' });
            if (token) headers.set(API_CONFIG.AUTH_HEADER, token);

            try {
                const response = await fetch(`${apiUrl}/admin/stats`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <Title title="Welcome to the Administration" />
            <CardContent>
                <Typography variant="h5" component="h2">
                    Statistics
                </Typography>
                {stats ? (
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <Card variant="outlined" style={{ padding: '20px' }}>
                            <Typography color="textSecondary">Total Users</Typography>
                            <Typography variant="h4">{stats.users}</Typography>
                        </Card>
                        <Card variant="outlined" style={{ padding: '20px' }}>
                            <Typography color="textSecondary">Total Orders</Typography>
                            <Typography variant="h4">{stats.orders}</Typography>
                        </Card>
                    </div>
                ) : (
                    <Typography>Loading stats...</Typography>
                )}
            </CardContent>
        </Card>
    );
};
