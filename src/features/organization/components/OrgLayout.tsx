import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../auth/api/authService';
import { cn } from '@/lib/utils';
import {
    Users,
    Contact,
    Megaphone,
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
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login', { replace: true });
    };

    const navigation = [
        { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, allowedRoles: ['ORG_ADMIN', 'ORG_USER'] },
        { name: 'Agents', href: '/app/agents', icon: Users, allowedRoles: ['ORG_ADMIN'] },
        { name: 'Contacts', href: '/app/contacts', icon: Contact, allowedRoles: ['ORG_ADMIN', 'ORG_USER'] },
        { name: 'Campaigns', href: '/app/campaigns', icon: Megaphone, allowedRoles: ['ORG_ADMIN', 'ORG_USER'] },
    ];

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter(item =>
        item.allowedRoles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <LayoutDashboard className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-xl font-bold text-gray-800">RealEstateAd</span>
                </div>

                <div className="p-4 border-b border-gray-100 mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Details</p>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                {user.fullName?.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName || user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Organization:</span>
                                <span className="text-xs font-medium text-gray-900 truncate ml-2">{user.organizationName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Role:</span>
                                <span className="text-xs font-medium text-blue-600 capitalize">{user.role.replace('_', ' ').toLowerCase()}</span>
                            </div>
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
