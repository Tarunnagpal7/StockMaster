import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    LogOut,
    FileText,
    Truck,
    ClipboardList,
    History,
    Map,
    Users,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarSections = [
        {
            title: 'Main',
            items: [
                { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
            ]
        },
        {
            title: 'Resources',
            items: [
                { path: '/products', icon: Package, label: 'Products' },
                { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
                { path: '/locations', icon: Map, label: 'Locations' },
                ...(user?.role !== 'STAFF' ? [{ path: '/users', icon: Users, label: 'Users' }] : []),
            ]
        },
        {
            title: 'Operations',
            items: [
                { path: '/operations/receipts', icon: FileText, label: 'Receipts' },
                { path: '/operations/deliveries', icon: Truck, label: 'Deliveries' },
                { path: '/operations/adjustments', icon: ClipboardList, label: 'Adjustments' },
                { path: '/transactions', icon: History, label: 'History' },
            ]
        },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">StockMaster</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    {sidebarSections.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 1024 && onClose()}
                                        className={({ isActive }) =>
                                            clsx(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <item.icon className={clsx(
                                                    "w-5 h-5 transition-colors",
                                                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                                )} />
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                    >
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
