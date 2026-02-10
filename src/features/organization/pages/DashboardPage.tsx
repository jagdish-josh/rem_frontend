import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/features/contacts/api/contactService';
import { agentsService } from '@/features/agents/api/agentsService';
import { authService } from '@/features/auth/api/authService';
import { Users, Contact, Megaphone, Loader2 } from 'lucide-react';

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
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <div className={`grid grid-cols-1 gap-6 ${isOrgAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {/* Total Contacts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Contacts</p>
                            {loadingContacts ? (
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mt-2" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900 mt-2">{totalContacts.toLocaleString()}</p>
                            )}
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Contact className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Active Campaigns */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Campaigns</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{activeCampaigns}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Megaphone className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Agents - Only show for ORG_ADMIN */}
                {isOrgAdmin && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Agents</p>
                                {loadingAgents ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mt-2" />
                                ) : (
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalAgents.toLocaleString()}</p>
                                )}
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
