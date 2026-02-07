import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../auth/api/authService';
import { cn } from '@/lib/utils';
import {
    ShieldCheck,
    LayoutDashboard,
    LogOut,
} from 'lucide-react';

export default function SystemLayout() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
        retry: false,
    });

    const location = useLocation();

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
    }

    // Redirect if not logged in or not a system admin
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Safety check for role - ensuring strictly SYSTEM_ADMIN
    if (user.role !== 'SYSTEM_ADMIN') {
        return <Navigate to="/app/dashboard" replace />;
    }

    const handleLogout = async () => {
        await authService.logout();
        window.location.reload();
    };

    const navigation = [
        { name: 'Organizations', href: '/admin/organizations', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <ShieldCheck className="h-8 w-8 text-indigo-500 mr-2" />
                    <span className="text-xl font-bold text-white">SysAdmin</span>
                </div>

                <div className="p-4 border-b border-slate-800 mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">User</p>
                    <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            SA
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{user.email}</p>
                            <p className="text-xs text-slate-400">System Admin</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )
                            }
                        >
                            <item.icon
                                className="mr-3 h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
