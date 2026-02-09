import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Plus, Building2, UserPlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import CreateOrgModal from '../components/CreateOrgModal';
import CreateOrgAdminModal from '../components/CreateOrgAdminModal';
import EditOrgModal from '../components/EditOrgModal';
import EditOrgAdminModal from '../components/EditOrgAdminModal';
import type { Organization } from '../types';

export default function SystemDashboardPage() {
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState<Organization | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [editingAdmin, setEditingAdmin] = useState<any | null>(null); // Using any temporarily to avoid circular deps if types not perfectly aligned, but preferably OrgAdmin
    const queryClient = useQueryClient();

    const { data: organizations, isLoading, error } = useQuery({
        queryKey: ['organizations'],
        queryFn: systemService.getOrganizations,
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id: string) => systemService.deleteOrgAdmin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to delete admin');
        }
    });

    const handleDeleteAdmin = (admin: any) => {
        if (confirm(`Are you sure you want to delete ${admin.full_name}?`)) {
            deleteAdminMutation.mutate(admin.id);
        }
    };

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
                        <div key={org.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <Building2 className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-3 mb-4">
                                {org.description || 'No description provided'}
                            </p>

                            {/* Org Admins List */}
                            {org.org_admins && org.org_admins.length > 0 && (
                                <div className="mt-auto mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admins</p>
                                    <div className="space-y-2">
                                        {org.org_admins.map(admin => (
                                            <div key={admin.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2">
                                                        {admin.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{admin.full_name}</span>
                                                        <span className="text-xs text-gray-500">{admin.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEditingAdmin(admin)}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                        title="Edit Admin"
                                                    >
                                                        <Pencil className="h-3 w-3 mr-0.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin)}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                        title="Delete Admin"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-0.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* Organization Metadata */}
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>
                                    <span className="font-medium">ID:</span> {org.id}
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">Created:</span> {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
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

            <EditOrgAdminModal
                isOpen={!!editingAdmin}
                onClose={() => setEditingAdmin(null)}
                admin={editingAdmin}
            />


            <CreateOrgAdminModal
                isOpen={!!selectedOrgForAdmin}
                onClose={() => setSelectedOrgForAdmin(null)}
                organization={selectedOrgForAdmin}
            />
        </div>
    );
}
