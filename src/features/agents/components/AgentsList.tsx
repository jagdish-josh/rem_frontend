import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { authService } from '../../auth/api/authService';
import { Mail, Phone, MoreVertical, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { Agent } from '../types';

interface AgentsListProps {
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
}

export default function AgentsList({ onEdit, onDelete }: AgentsListProps) {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const { data: agents, isLoading, error } = useQuery({
        queryKey: ['agents'],
        queryFn: agentsService.getAgents,
    });

    const { data: currentUser } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
    });

    // Only ORG_ADMIN can manage agents
    const canManageAgents = currentUser?.role === 'ORG_ADMIN';

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                Error loading agents. Please try again later.
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Agent
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {canManageAgents && (
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents?.length === 0 ? (
                            <tr>
                                <td colSpan={canManageAgents ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                                    No agents found. Add your first agent!
                                </td>
                            </tr>
                        ) : (
                            agents?.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                                {(agent.name || agent.full_name)?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{agent.name || agent.full_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                                {agent.email}
                                            </div>
                                            {agent.phone && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                                                    {agent.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                            {agent.role_name ? agent.role_name.replace('_', ' ').toLowerCase() : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm border border-green-200">
                                            Active
                                        </span>
                                    </td>
                                    {canManageAgents && agent.role_name === 'ORG_USER' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                            <button
                                                onClick={() => setActiveMenuId(activeMenuId === agent.id ? null : agent.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </button>

                                            {activeMenuId === agent.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveMenuId(null)}
                                                    />
                                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    onEdit(agent);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                            >
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Edit Agent
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    onDelete(agent);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Agent
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    )}
                                    {canManageAgents && agent.role_name !== 'ORG_USER' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Empty cell for non-editable users */}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
