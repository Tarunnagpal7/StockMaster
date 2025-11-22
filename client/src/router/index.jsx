import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ResetOTP from '../pages/auth/ResetOTP';
import Dashboard from '../pages/dashboard/Dashboard';
import ProductsList from '../pages/products/ProductsList';
import Transactions from '../pages/transactions/Transactions';
import NewTransaction from '../pages/transactions/NewTransaction';
import Receipts from '../pages/transactions/Receipts';
import ReceiptForm from '../pages/transactions/ReceiptForm';
import Deliveries from '../pages/transactions/Deliveries';
import DeliveryForm from '../pages/transactions/DeliveryForm';
import Adjustments from '../pages/transactions/Adjustments';
import AdjustmentForm from '../pages/transactions/AdjustmentForm';
import Transfers from '../pages/transactions/Transfers';
import TransferForm from '../pages/transactions/TransferForm';
import Warehouses from '../pages/resources/Warehouses';
import Locations from '../pages/resources/Locations';
import Users from '../pages/resources/Users';
import ProductForm from '../pages/products/ProductForm';
import ProductDetail from '../pages/products/ProductDetail';
import Profile from '../pages/profile/Profile';
import NotFound from '../pages/NotFound';

// Auth Guard (Simple wrapper for now)
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/signup',
        element: <Signup />,
    },
    {
        path: '/reset-otp',
        element: <ResetOTP />,
    },
    {
        path: '/',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
            { path: 'profile', element: <Profile /> },
            { index: true, element: <Dashboard /> },
            { path: 'products', element: <ProductsList /> },
            { path: 'products/new', element: <ProductForm /> },
            { path: 'products/:id', element: <ProductDetail /> },
            { path: 'products/:id/edit', element: <ProductForm /> }, // View/Edit
            { path: 'warehouses', element: <Warehouses /> },
            { path: 'locations', element: <Locations /> },
            { path: 'users', element: <Users /> },
            { path: 'transactions', element: <Transactions /> },
            { path: 'transactions/new', element: <NewTransaction /> },

            // Operations
            { path: 'operations/receipts', element: <Receipts /> },
            { path: 'operations/receipts/new', element: <ReceiptForm /> },
            { path: 'operations/deliveries', element: <Deliveries /> },
            { path: 'operations/deliveries/new', element: <DeliveryForm /> },
            { path: 'operations/adjustments', element: <Adjustments /> },
            { path: 'operations/adjustments/new', element: <AdjustmentForm /> },
            { path: 'operations/transfers', element: <Transfers /> },
            { path: 'operations/transfers/new', element: <TransferForm /> },

            { path: '*', element: <NotFound /> },
        ]
    }
]);
