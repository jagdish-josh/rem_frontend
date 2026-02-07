import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Plus, Building2, UserPlus, Loader2, Pencil } from 'lucide-react';
import CreateOrgModal from '../components/CreateOrgModal';
import CreateOrgAdminModal from '../components/CreateOrgAdminModal';
import EditOrgModal from '../components/EditOrgModal';
import type { Organization } from '../types';

export default function SystemDashboardPage() {
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState<Organization | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

    const { data: organizations, isLoading, error } = useQuery({
        queryKey: ['organizations'],
        queryFn: systemService.getOrganizations,
    });

    const handleCreateOrg = () => {
        setIsOrgModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-500 mt-1">Manage all organizations in the system.</p>
                </div>

                <button
                    onClick={handleCreateOrg}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Organization
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading organizations...</span>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Error loading organizations. Please try again.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations?.map((org) => (
                        <div key={org.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <Building2 className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                                {org.description || 'No description provided'}
                            </p>

                            {/* Organization Metadata */}
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>
                                    <span className="font-medium">ID:</span> {org.id}
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">Created:</span> {new Date(org.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => setEditingOrg(org)}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    title="Edit Organization Details"
                                >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit Org
                                </button>

                                <button
                                    onClick={() => setSelectedOrgForAdmin(org)}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                    title="Add Organization Administrator"
                                >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add Admin
                                </button>
                            </div>
                        </div>
                    ))}

                    {organizations?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            No organizations found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            <CreateOrgModal
                isOpen={isOrgModalOpen}
                onClose={() => setIsOrgModalOpen(false)}
            />

            <EditOrgModal
                isOpen={!!editingOrg}
                onClose={() => setEditingOrg(null)}
                organization={editingOrg}
            />

            <CreateOrgAdminModal
                isOpen={!!selectedOrgForAdmin}
                onClose={() => setSelectedOrgForAdmin(null)}
                organization={selectedOrgForAdmin}
            />
        </div>
    );
}
