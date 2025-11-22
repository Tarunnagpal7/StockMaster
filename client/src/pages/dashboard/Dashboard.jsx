import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../utils/api';
import {
    TrendingUp,
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Package,
    Clock,
    MoreVertical,
    Building2,
    ChevronDown,
    Check
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { format } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [filters, setFilters] = useState({
        warehouseId: 'ALL',
        category: 'ALL',
        status: 'ALL',
        type: 'ALL'
    });

    useEffect(() => {
        loadWarehouses();
    }, []);

    useEffect(() => {
        loadStats();
    }, [filters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadWarehouses = async () => {
        try {
            const data = await api.getWarehouses();
            setWarehouses(data);
        } catch (error) {
            console.error('Failed to load warehouses', error);
        }
    };

    const loadStats = async () => {
        setStatsLoading(true);
        setError(null);
        try {
            const data = await api.getDashboardStats(filters);
            setStats(data);
        } catch (error) {
            console.error(error);
            setError('Failed to load dashboard data.');
        } finally {
            setInitialLoading(false);
            setStatsLoading(false);
        }
    };

    if (initialLoading) return <div className="flex justify-center py-12"><Loader size="lg" /></div>;

    if (error && !stats) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">{error}</p>
                <button onClick={loadStats} className="btn btn-primary">Retry</button>
            </div>
        );
    }

    if (!stats) return null;

    // Mock data for sparklines
    const generateSparklineData = () => Array.from({ length: 20 }, (_, i) => ({
        value: 50 + Math.random() * 50 - 25 + (i * 2)
    }));

    const SparklineCard = ({ title, value, trend, color }) => {
        const data = generateSparklineData();
        
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                        <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                        <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
                        {trend && (
                            <span className={`flex items-center text-sm font-medium ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {trend.startsWith('+') ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
                                {trend}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mb-4">vs last month</p>
                </div>
                
                <div className="h-16 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color} 
                                strokeWidth={2} 
                                fill={`url(#gradient-${title})`} 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your inventory performance</p>
                </div>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={statsLoading}
                        className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2 hover:border-blue-500 transition-all duration-200 min-w-[200px] justify-between disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-sm font-medium text-slate-700">
                                {filters.warehouseId === 'ALL' 
                                    ? 'All Warehouses' 
                                    : warehouses.find(w => w.id === filters.warehouseId)?.name || 'Select Warehouse'}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-2 py-1.5">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                                    Filter by Warehouse
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 my-1" />
                            
                            <button
                                onClick={() => {
                                    setFilters({ ...filters, warehouseId: 'ALL' });
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                            >
                                <span className={`${filters.warehouseId === 'ALL' ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                                    All Warehouses
                                </span>
                                {filters.warehouseId === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
                            </button>

                            {warehouses.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => {
                                        setFilters({ ...filters, warehouseId: w.id });
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className={`${filters.warehouseId === w.id ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                                        {w.name}
                                    </span>
                                    {filters.warehouseId === w.id && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Grid */}
            <div className={`transition-opacity duration-200 ${statsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <SparklineCard
                        title="Total Products"
                        value={stats.totalProducts}
                        trend="+12%"
                        color="#7c3aed" // Violet
                    />
                    <SparklineCard
                        title="Low Stock Items"
                        value={stats.lowStockCount}
                        trend="-2%"
                        color="#f59e0b" // Amber
                    />
                    <SparklineCard
                        title="Pending Receipts"
                        value={stats.pendingReceipts}
                        trend="+5%"
                        color="#10b981" // Emerald
                    />
                    <SparklineCard
                        title="Pending Deliveries"
                        value={stats.pendingDeliveries}
                        trend="+8%"
                        color="#3b82f6" // Blue
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">Stock Movement</h3>
                            <button className="text-sm font-medium text-slate-500 hover:text-slate-900">View Report</button>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: 'Mon', in: 40, out: 24 },
                                    { name: 'Tue', in: 30, out: 13 },
                                    { name: 'Wed', in: 20, out: 98 },
                                    { name: 'Thu', in: 27, out: 39 },
                                    { name: 'Fri', in: 18, out: 48 },
                                    { name: 'Sat', in: 23, out: 38 },
                                    { name: 'Sun', in: 34, out: 43 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: '1px solid #e2e8f0', 
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            padding: '8px 12px'
                                        }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="in" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                                    <Area type="monotone" dataKey="out" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                                        <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recentActivity.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-medium text-slate-900">
                                                {activity.items[0]?.product.name}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    activity.type === 'IN' ? 'bg-emerald-50 text-emerald-700' :
                                                    activity.type === 'OUT' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {activity.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-500">
                                                {activity.items[0]?.quantity}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-400 text-right">
                                                {format(new Date(activity.date), 'MMM d, h:mm a')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {stats.recentActivity.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-8">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
