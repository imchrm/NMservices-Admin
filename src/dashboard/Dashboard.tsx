import { Card, CardContent, Typography } from '@mui/material';
import { Title } from 'react-admin';
import { useState, useEffect } from 'react';

// Define stats interface based on spec
interface Stats {
    users: number; // "Total users"
    orders: number; // "Total orders"
    // Spec mentions "Key metrics: Total users, Total orders".
    // Endpoint: /admin/stats
}

export const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        // We use dataProvider.httpClient directly or a custom method provided?
        // dataProvider usually exposes standardized methods.
        // We can use fetch directly with auth header, or extend dataProvider.
        // However, standard dataProvider methods don't include 'getStats'.
        // I will use fetch with the token manually or use a simple custom hook.
        // Spec 5.2 mentions key modules, but Dashboard fetching is in 6.2.

        const fetchStats = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('x-admin-key');
            const headers = new Headers({ Accept: 'application/json' });
            if (token) headers.set('X-Admin-Key', token);

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
