import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/features/contacts/api/contactService';
import { agentsService } from '@/features/agents/api/agentsService';
import { authService } from '@/features/auth/api/authService';
import { Users, Contact, Megaphone, Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
    const { data: user } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
    });

    const { data: contactsData, isLoading: loadingContacts } = useQuery({
        queryKey: ['contacts', 'paginated', 1],
        queryFn: () => contactService.getPaginatedContacts(1, 1), // Fetch only 1 contact to get total count
    });

    const { data: agentsData, isLoading: loadingAgents } = useQuery({
        queryKey: ['agents'],
        queryFn: agentsService.getAgents,
        enabled: user?.role === 'ORG_ADMIN', // Only fetch for ORG_ADMIN
    });

    const totalContacts = contactsData?.pagination?.total_count || 0;
    const totalAgents = agentsData?.length || 0;
    const activeCampaigns = 0; // Not implemented yet
    const isOrgAdmin = user?.role === 'ORG_ADMIN';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

            <div className={`grid gap-4 md:grid-cols-2 ${isOrgAdmin ? 'lg:grid-cols-3' : ''}`}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Contacts
                        </CardTitle>
                        <Contact className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingContacts ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Current contact database size
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Campaigns
                        </CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCampaigns}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Campaigns currently running
                        </p>
                    </CardContent>
                </Card>

                {isOrgAdmin && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Agents
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loadingAgents ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                <div className="text-2xl font-bold">{totalAgents.toLocaleString()}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Registered agents in organization
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
