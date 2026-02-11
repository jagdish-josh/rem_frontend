import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Plus, Building2, UserPlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import CreateOrgModal from '../components/CreateOrgModal';
import CreateOrgAdminModal from '../components/CreateOrgAdminModal';
import EditOrgModal from '../components/EditOrgModal';
import EditOrgAdminModal from '../components/EditOrgAdminModal';
import type { Organization } from '../types';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function SystemDashboardPage() {
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState<Organization | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
    const queryClient = useQueryClient();

    const { data: organizations, isLoading, error } = useQuery({
        queryKey: ['organizations'],
        queryFn: systemService.getOrganizations,
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id: string) => systemService.deleteOrgAdmin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success('Admin deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to delete admin';
            toast.error(message);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Organizations</h1>
                    <p className="text-muted-foreground mt-1">Manage all organizations in the system.</p>
                </div>

                <Button
                    onClick={handleCreateOrg}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Organization
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="ml-3 text-muted-foreground">Loading organizations...</span>
                </div>
            ) : error ? (
                <div className="p-4 bg-destructive/15 text-destructive rounded-lg border border-destructive/20">
                    <p>Error loading organizations. Please try again.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations?.map((org) => (
                        <Card key={org.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">
                                        {org.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {org.description || 'No description provided'}
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                {/* Org Admins List */}
                                {org.org_admins && org.org_admins.length > 0 && (
                                    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admins</p>
                                        <div className="space-y-2">
                                            {org.org_admins.map(admin => (
                                                <div key={admin.id} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center">
                                                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2">
                                                            {admin.full_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{admin.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{admin.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-blue-600"
                                                            onClick={() => setEditingAdmin(admin)}
                                                            title="Edit Admin"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDeleteAdmin(admin)}
                                                            title="Delete Admin"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 text-xs text-muted-foreground text-right">
                                    ID: {org.id}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t border-border/50 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setEditingOrg(org)}
                                >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit Org
                                </Button>

                                <Button
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => setSelectedOrgForAdmin(org)}
                                >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add Admin
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {organizations?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed text-sm">
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
