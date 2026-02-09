import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AgentsList from '../components/AgentsList';
import AddAgentModal from '../components/AddAgentModal';
import EditAgentModal from '../components/EditAgentModal';
import { authService } from '../../auth/api/authService';
import { agentsService } from '../api/agentsService';
import { Plus } from 'lucide-react';
import type { Agent } from '../types';

export default function AgentsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.getUser,
    });

    // Only ORG_ADMIN can add agents
    const canManageAgents = user?.role === 'ORG_ADMIN';

    const deleteMutation = useMutation({
        mutationFn: (id: string) => agentsService.deleteAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setDeletingAgent(null);
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to delete agent');
        }
    });

    const handleDelete = (agent: Agent) => {
        if (confirm(`Are you sure you want to delete ${agent.full_name}?`)) {
            deleteMutation.mutate(agent.id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                    <p className="text-gray-500 mt-1">Manage users who have access to this organization.</p>
                </div>
                {canManageAgents && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Agent
                    </button>
                )}
            </div>

            <AgentsList
                onEdit={setEditingAgent}
                onDelete={handleDelete}
            />

            {isAddModalOpen && (
                <AddAgentModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}

            {editingAgent && (
                <EditAgentModal
                    isOpen={!!editingAgent}
                    onClose={() => setEditingAgent(null)}
                    agent={editingAgent}
                />
            )}
        </div>
    );
}
