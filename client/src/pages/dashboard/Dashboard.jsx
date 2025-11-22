import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'STAFF') {
        return <StaffDashboard />;
    }

    return <AdminDashboard />;
};

export default Dashboard;
