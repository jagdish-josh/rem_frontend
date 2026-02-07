import { useState } from 'react';
import AgentsList from '../components/AgentsList';
import AddAgentModal from '../components/AddAgentModal';
import { Plus } from 'lucide-react';

export default function AgentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                    <p className="text-gray-500 mt-1">Manage users who have access to this organization.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Agent
                </button>
            </div>

            <AgentsList />

            {isModalOpen && (
                <AddAgentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
