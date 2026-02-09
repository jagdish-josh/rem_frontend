import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { contactService } from '@/features/contacts/api/contactService';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

const campaignSchema = z.object({
    name: z.string().min(2, "Campaign name is required"),
    description: z.string().optional(),
    email_template_id: z.number().min(1, "Email template is required"),
    audience_ids: z.array(z.number()).min(1, "At least one audience is required"),
    scheduled_at: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'sent']).default('draft'),
});

type CampaignForm = z.infer<typeof campaignSchema>;

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset, setError, watch } = useForm<CampaignForm>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            audience_ids: [],
        }
    });

    // Fetch email templates
    const { data: templates, isLoading: loadingTemplates } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: CampaignForm) => {
            // TODO: Uncomment when API is ready
            // return campaignsService.createCampaign(data);

            // For now, just simulate success
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('Campaign would be created with data:', data);
                    resolve({ message: 'Campaign created successfully' });
                }, 1000);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create campaign';
            setError('root', { message });
        }
    });

    const onSubmit = (data: CampaignForm) => {
        createMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Create New Campaign
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {errors.root && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name')}
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900",
                                errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                            )}
                            placeholder="e.g., Spring Promotion 2024"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                            placeholder="Brief description of the campaign..."
                        />
                    </div>

                    {/* Email Template */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Template <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('email_template_id', { valueAsNumber: true })}
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900",
                                errors.email_template_id ? "border-red-500" : "border-gray-200"
                            )}
                            disabled={loadingTemplates}
                        >
                            <option value="">Select a template...</option>
                            {templates?.map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </select>
                        {errors.email_template_id && <p className="text-xs text-red-500 mt-1">{errors.email_template_id.message}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('status')}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900"
                        >
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="sent">Sent</option>
                        </select>
                    </div>

                    {/* Scheduled Date/Time */}
                    {watch('status') === 'scheduled' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scheduled At
                            </label>
                            <input
                                type="datetime-local"
                                {...register('scheduled_at')}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
                            />
                        </div>
                    )}

                    {/* Audience Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Audience selection will be available once the audiences/segments API is implemented.
                            For now, campaigns will target all contacts in your organization.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={createMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {createMutation.isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Create Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
