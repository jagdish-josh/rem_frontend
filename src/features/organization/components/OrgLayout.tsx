import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../auth/api/authService';
import { cn } from '@/lib/utils';
import {
    Building2,
    Users,
    Contact,
    Megaphone,
    Settings,
    LogOut,
    LayoutDashboard
} from 'lucide-react';

export default function OrgLayout() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
        retry: false,
    });

    const location = useLocation();

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const handleLogout = async () => {
        await authService.logout();
        window.location.reload(); // Simple reload to clear state/redirect
    };

    const navigation = [
        { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { name: 'Agents', href: '/app/agents', icon: Users },
        { name: 'Contacts', href: '/app/contacts', icon: Contact },
        { name: 'Campaigns', href: '/app/campaigns', icon: Megaphone },
        { name: 'Organization', href: '/app/organization', icon: Building2 },
        { name: 'Settings', href: '/app/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Building2 className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-xl font-bold text-gray-800">RealEstateAd</span>
                </div>

                <div className="p-4 border-b border-gray-100 mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Organization</p>
                    <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user.orgId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{user.orgId}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
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
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )
                            }
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                    // Highlight icon if active
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
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
