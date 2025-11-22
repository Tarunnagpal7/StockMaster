import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import {
    User, Mail, Shield, Calendar, LogOut,
    Camera, MapPin, Phone, Globe, Bell,
    Lock, Settings, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setProfileData(response.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setProfileData(user);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Header Section */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
                <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                <div className="px-8 pb-6">
                    <div className="relative flex flex-col sm:flex-row items-end -mt-12 mb-4 gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-xl">
                                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-4xl font-bold border border-slate-200">
                                    {profileData?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{profileData?.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    {profileData?.role}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    San Francisco, CA
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-2">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm shadow-blue-200">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-8 border-t border-slate-200">
                    <div className="flex gap-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Email</p>
                                    <p className="text-sm font-medium truncate">{profileData?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Phone</p>
                                    <p className="text-sm font-medium">+1 (555) 000-0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <Globe className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Website</p>
                                    <p className="text-sm font-medium text-blue-600">stockmaster.io</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Pro Member</h3>
                        <p className="text-blue-100 text-sm mb-4">You have full access to all premium features.</p>
                        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                            <div className="bg-white w-3/4 h-full rounded-full"></div>
                        </div>
                        <p className="text-xs text-blue-100">75% of storage used</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Overview</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:text-blue-700">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-1">User ID</p>
                                    <p className="text-lg font-bold text-slate-900 font-mono">{profileData?.id?.slice(0, 8)}...</p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 group-hover:text-purple-700">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-1">Account Role</p>
                                    <p className="text-lg font-bold text-slate-900">{profileData?.role}</p>
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Recent Activity</h4>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">Updated inventory stock</p>
                                            <p className="text-xs text-slate-500">2 hours ago</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Password</p>
                                            <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Change</button>
                                </div>
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500">Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm text-slate-700">Email Notifications</span>
                                    </div>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm text-slate-700">Language</span>
                                    </div>
                                    <span className="text-sm text-slate-500">English (US)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
