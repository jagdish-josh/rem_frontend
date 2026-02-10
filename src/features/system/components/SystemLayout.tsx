import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../auth/api/authService';
import { cn } from '@/lib/utils';
import {
    ShieldCheck,
    LayoutDashboard,
    LogOut,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SystemLayout() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
        retry: false,
    });

    const location = useLocation();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
        navigate('/login', { replace: true });
    };

    const navigation = [
        { name: 'Organizations', href: '/admin/organizations', icon: LayoutDashboard },
    ];

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gray-100 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 hidden md:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <ShieldCheck className="h-8 w-8 text-indigo-500 mr-2" />
                        <span className="text-xl font-bold text-white">SysAdmin</span>
                    </div>

                    <div className="p-4 border-b border-slate-800 mb-2">
                        <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <Avatar className="h-10 w-10 border-2 border-indigo-500/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                <AvatarFallback className="bg-indigo-600 text-white">
                                    {user.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Tooltip key={item.name} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <NavLink
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
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{item.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign out
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 overflow-auto bg-gray-50/50">
                    <div className="p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
