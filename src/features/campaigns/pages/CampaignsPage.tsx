import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { Plus, Megaphone, FileText, Loader2, Users, Edit, Trash2 } from 'lucide-react';
import CreateTemplateForm from '../components/CreateTemplateForm';
import CreateEmailTypeModal from '../components/CreateEmailTypeModal';
import CreateCampaignModal from '../components/CreateCampaignModal';
import CreateUpdateAudienceModal from '../components/CreateUpdateAudienceModal';
import type { Audience } from '../types';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function CampaignsPage() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'audiences'>('templates');
    const [isCreating, setIsCreating] = useState(false);
    const [showEmailTypeModal, setShowEmailTypeModal] = useState(false);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [showAudienceModal, setShowAudienceModal] = useState(false);
    const [editingAudience, setEditingAudience] = useState<Audience | null>(null);

    const queryClient = useQueryClient();

    const { data: templates, isLoading, error } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: activeTab === 'templates' && !isCreating
    });

    const { data: audiences, isLoading: isLoadingAudiences } = useQuery({
        queryKey: ['audiences'],
        queryFn: campaignsService.getAudiences,
        enabled: activeTab === 'audiences'
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => campaignsService.deleteAudience(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audiences'] });
            toast.success('Audience deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || 'Failed to delete audience';
            toast.error(message);
        },
    });

    const handleEditAudience = (audience: Audience) => {
        setEditingAudience(audience);
        setShowAudienceModal(true);
    };

    const handleCloseAudienceModal = () => {
        setShowAudienceModal(false);
        setEditingAudience(null);
    };

    const handleDeleteAudience = (id: number) => {
        if (confirm('Are you sure you want to delete this audience?')) {
            deleteMutation.mutate(id);
        }
    };

    const getActiveFiltersCount = (audience: Audience): number => {
        let count = 0;
        if (audience.bhk_type_id) count++;
        if (audience.furnishing_type_id) count++;
        if (audience.location_id) count++;
        if (audience.property_type_id) count++;
        if (audience.power_backup_type_id) count++;
        return count;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Campaigns & Templates</h1>
                    <p className="text-muted-foreground mt-1">Manage your email marketing campaigns and design templates.</p>
                </div>
                {activeTab === 'campaigns' && (
                    <Button
                        onClick={() => setShowCampaignModal(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Campaign
                    </Button>
                )}
                {activeTab === 'templates' && !isCreating && (
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowEmailTypeModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Email Type
                        </Button>
                        <Button
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Template
                        </Button>
                    </div>
                )}
                {activeTab === 'audiences' && (
                    <Button
                        onClick={() => setShowAudienceModal(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Audience
                    </Button>
                )}
            </div>

            {isCreating ? (
                <CreateTemplateForm onClose={() => setIsCreating(false)} />
            ) : (
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'campaigns' | 'templates' | 'audiences')} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="templates">Email Templates</TabsTrigger>
                        <TabsTrigger value="audiences">Audiences</TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                <div className="col-span-full flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="col-span-full p-4 bg-destructive/15 text-destructive rounded-lg">
                                    Error loading templates.
                                </div>
                            ) : templates?.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                    No templates found. Create your first one!
                                </div>
                            ) : (
                                templates?.map(template => (
                                    <Card key={template.id} className="hover:shadow-md transition-shadow flex flex-col">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold">
                                                    {template.name}
                                                </CardTitle>
                                            </div>
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {template.subject}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="mt-auto pt-4 border-t text-xs text-muted-foreground">
                                            <span>Last updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="audiences" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoadingAudiences ? (
                                <div className="col-span-full flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : audiences?.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                    No audiences found. Create your first one!
                                </div>
                            ) : (
                                audiences?.map(audience => (
                                    <Card key={audience.id} className="hover:shadow-md transition-shadow flex flex-col">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold">
                                                    {audience.name}
                                                </CardTitle>
                                            </div>
                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                {getActiveFiltersCount(audience)} filter{getActiveFiltersCount(audience) !== 1 ? 's' : ''} applied
                                            </p>
                                        </CardContent>
                                        <CardFooter className="mt-auto pt-4 border-t flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                Created: {new Date(audience.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditAudience(audience)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteAudience(audience.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="campaigns">
                        <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <div className="flex flex-col items-center">
                                <Megaphone className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p>Campaign management coming soon.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            <CreateEmailTypeModal
                isOpen={showEmailTypeModal}
                onClose={() => setShowEmailTypeModal(false)}
            />

            <CreateCampaignModal
                isOpen={showCampaignModal}
                onClose={() => setShowCampaignModal(false)}
            />

            <CreateUpdateAudienceModal
                isOpen={showAudienceModal}
                onClose={handleCloseAudienceModal}
                audience={editingAudience}
            />
        </div>
    );
}
