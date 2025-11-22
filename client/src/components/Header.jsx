import React, { useState } from 'react';
import { Bell, Search, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = React.useRef(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
            <div className="h-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search Bar - Hidden on mobile for now to save space */}
                    <div className="hidden md:flex items-center relative max-w-md w-full">
                        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-1 hover:bg-slate-50 rounded-lg p-1 transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500">{user?.role || 'Staff'}</p>
                            </div>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-sm font-semibold text-blue-700">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                                    <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500">{user?.role || 'Staff'}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    My Profile
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
