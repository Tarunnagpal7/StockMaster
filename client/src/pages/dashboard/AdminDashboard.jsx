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
    Check,
    Calendar
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import Loader from '../../components/Loader';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [graphLoading, setGraphLoading] = useState(false);
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

    const [graphPeriod, setGraphPeriod] = useState('WEEKLY'); // WEEKLY, MONTHLY, 3WEEKS

    useEffect(() => {
        loadWarehouses();
    }, []);

    useEffect(() => {
        loadStats();
    }, [filters]);

    useEffect(() => {
        loadGraphData();
    }, [filters.warehouseId, graphPeriod]);

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

    const loadGraphData = async () => {
        setGraphLoading(true);
        try {
            const data = await api.getDashboardGraphData({ 
                warehouseId: filters.warehouseId, 
                period: graphPeriod 
            });
            // Format dates for display
            const formattedData = data.map(item => ({
                ...item,
                displayDate: format(new Date(item.date), graphPeriod === 'MONTHLY' ? 'MMM d' : 'EEE')
            }));
            setGraphData(formattedData);
        } catch (error) {
            console.error('Failed to load graph data', error);
        } finally {
            setGraphLoading(false);
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

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-all duration-200">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your inventory performance</p>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={statsLoading}
                        className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2.5 hover:border-blue-500 transition-all duration-200 min-w-[220px] justify-between disabled:opacity-60 disabled:cursor-not-allowed group"
                    >
                        <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-slate-400 mr-2 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-slate-700">
                                {filters.warehouseId === 'ALL' 
                                    ? 'All Warehouses' 
                                    : warehouses.find(w => w.id === filters.warehouseId)?.name || 'Select Warehouse'}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-4 py-2">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Filter by Warehouse
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 my-1" />
                            
                            <button
                                onClick={() => {
                                    setFilters({ ...filters, warehouseId: 'ALL' });
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
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
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    icon={Package} 
                    colorClass="text-violet-600" 
                    bgClass="bg-violet-50" 
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats.lowStockCount} 
                    icon={AlertTriangle} 
                    colorClass="text-amber-600" 
                    bgClass="bg-amber-50" 
                />
                <StatCard 
                    title="Pending Receipts" 
                    value={stats.pendingReceipts} 
                    icon={ArrowDownLeft} 
                    colorClass="text-emerald-600" 
                    bgClass="bg-emerald-50" 
                />
                <StatCard 
                    title="Pending Deliveries" 
                    value={stats.pendingDeliveries} 
                    icon={ArrowUpRight} 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Stock Movement</h3>
                            <p className="text-sm text-slate-500">Incoming vs Outgoing stock over time</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['WEEKLY', '3WEEKS', 'MONTHLY'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setGraphPeriod(period)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        graphPeriod === period 
                                            ? 'bg-white text-slate-900 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {period === 'WEEKLY' ? '7 Days' : period === '3WEEKS' ? '3 Weeks' : 'Month'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        {graphLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : graphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="displayDate" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area 
                                        name="Incoming"
                                        type="monotone" 
                                        dataKey="incoming" 
                                        stroke="#10b981" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorIn)" 
                                    />
                                    <Area 
                                        name="Outgoing"
                                        type="monotone" 
                                        dataKey="outgoing" 
                                        stroke="#ef4444" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorOut)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <BarChart className="w-12 h-12 mb-2 opacity-20" />
                                <p>No data for this period</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                        {stats.recentActivity.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 p-2 rounded-full ${
                                                activity.type === 'IN' ? 'bg-emerald-100 text-emerald-600' :
                                                activity.type === 'OUT' ? 'bg-blue-100 text-blue-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                                {activity.type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> :
                                                 activity.type === 'OUT' ? <ArrowUpRight className="w-4 h-4" /> :
                                                 <TrendingUp className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {activity.items[0]?.product.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {activity.type} • {activity.items[0]?.quantity} units
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-900">
                                                    {format(new Date(activity.date), 'MMM d')}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {format(new Date(activity.date), 'h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 mt-auto">
                        <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            View All Transactions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
