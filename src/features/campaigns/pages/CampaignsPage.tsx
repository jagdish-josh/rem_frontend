import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { Plus, Megaphone, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreateTemplateForm from '../components/CreateTemplateForm';

export default function CampaignsPage() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('templates');
    const [isCreating, setIsCreating] = useState(false);

    const { data: templates, isLoading, error } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: activeTab === 'templates' && !isCreating
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaigns & Templates</h1>
                    <p className="text-gray-500 mt-1">Manage your email marketing campaigns and design templates.</p>
                </div>
                {activeTab === 'templates' && !isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Template
                    </button>
                )}
            </div>

            {/* Tabs */}
            {!isCreating && (
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={cn(
                                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === 'campaigns'
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            Campaigns
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={cn(
                                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === 'templates'
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            Email Templates
                        </button>
                    </nav>
                </div>
            )}

            {/* Content */}
            <div className="mt-6">
                {isCreating ? (
                    <CreateTemplateForm onClose={() => setIsCreating(false)} />
                ) : activeTab === 'templates' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : error ? (
                            <div className="col-span-full p-4 bg-red-50 text-red-700 rounded-lg">
                                Error loading templates.
                            </div>
                        ) : templates?.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                No templates found. Create your first one!
                            </div>
                        ) : (
                            templates?.map(template => (
                                <div key={template.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.subject}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between text-xs text-gray-400">
                                        <span>Last updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <div className="flex flex-col items-center">
                            <Megaphone className="h-10 w-10 text-gray-400 mb-2" />
                            <p>Campaign management coming soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
