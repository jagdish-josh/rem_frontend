import { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../auth/api/authService';
import { cn } from '@/lib/utils';
import {
    Users,
    Contact,
    Megaphone,
    LogOut,
    LayoutDashboard,
    Menu,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

    
    
    const SidebarContent = ({user}: {user: any}) =>{
        const location = useLocation();
         const navigate = useNavigate();
          const [isMobileOpen, setIsMobileOpen] = useState(false);

    
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
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b">
                <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-bold">RealEstateAd</span>
            </div>

            <div className="p-4 border-b">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-9 w-9 border">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {(user.fullName || user.name)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.fullName || user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
                <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Org:</span>
                        <span className="font-medium truncate max-w-[120px]">{user.organizationName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium text-primary capitalize">{user.role.replace('_', ' ').toLowerCase()}</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredNavigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <item.icon
                            className={cn(
                                "mr-3 h-5 w-5 flex-shrink-0",
                                // Highlight icon if active could be handled by parent class text color
                            )}
                            aria-hidden="true"
                        />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                </Button>
            </div>
        </div>
    );
}
    export default SidebarContent;