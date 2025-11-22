import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                {/* 404 Text */}
                <div className="relative">
                    <h1 className="text-[150px] sm:text-[200px] font-black text-slate-900 leading-none tracking-tighter select-none">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent to-slate-50/80 pointer-events-none"></div>
                    <div className="absolute -top-4 right-[20%] animate-bounce duration-[3000ms]">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 rotate-12">
                            <Search className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 -mt-10 relative z-20">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                        Page not found
                    </h2>
                    <p className="text-slate-500 text-lg max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all font-medium group"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Footer Help */}
                <div className="pt-12">
                    <p className="text-sm text-slate-400">
                        Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
