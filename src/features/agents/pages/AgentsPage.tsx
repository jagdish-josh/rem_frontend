import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AgentsList from '../components/AgentsList';
import AddAgentModal from '../components/AddAgentModal';
import EditAgentModal from '../components/EditAgentModal';
import { authService } from '../../auth/api/authService';
import { agentsService } from '../api/agentsService';
import { Plus } from 'lucide-react';
import type { Agent } from '../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AgentsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
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
            toast.success('Agent deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to delete agent';
            toast.error(message);
        }
    });

    const handleDelete = (agent: Agent) => {
        if (confirm(`Are you sure you want to delete ${agent.name}?`)) {
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
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Agent
                    </Button>
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
