import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';

const templateSchema = z.object({
    name: z.string().min(2, "Name is required"),
    subject: z.string().min(2, "Subject is required"),
    preheader: z.string().optional(),
    email_type_id: z.string().min(1, "Email Type is required"),
    from_name: z.string().optional(),
    from_email: z.string().email("Invalid email").min(1, "From Email is required"),
    reply_to: z.string().email("Invalid email").optional().or(z.literal('')),
    html_body: z.string().optional(),
    text_body: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface CreateTemplateFormProps {
    onClose: () => void;
}

export default function CreateTemplateForm({ onClose }: CreateTemplateFormProps) {
    const queryClient = useQueryClient();

    const { data: emailTypes, isLoading: isLoadingTypes } = useQuery({
        queryKey: ['emailTypes'],
        queryFn: campaignsService.getEmailTypes
    });

    const { register, handleSubmit, formState: { errors }, setError } = useForm<TemplateForm>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            from_email: '',
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: TemplateForm) => campaignsService.createTemplate({
            ...data,
            email_type_id: parseInt(data.email_type_id)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create template';
            setError('root', { message });
        }
    });

    const onSubmit = (data: TemplateForm) => {
        createMutation.mutate(data);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Create Email Template</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {errors.root && (
                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                        {errors.root.message}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <input
                                {...register('name')}
                                className={cn("w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none", errors.name ? "border-red-500" : "border-gray-200")}
                                placeholder="e.g. Monthly Newsletter"
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Type</label>
                            <select
                                {...register('email_type_id')}
                                className={cn("w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white", errors.email_type_id ? "border-red-500" : "border-gray-200")}
                                disabled={isLoadingTypes}
                            >
                                <option value="">Select a type...</option>
                                {emailTypes?.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            {errors.email_type_id && <p className="text-xs text-red-500 mt-1">{errors.email_type_id.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                            <input
                                {...register('subject')}
                                className={cn("w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none", errors.subject ? "border-red-500" : "border-gray-200")}
                                placeholder="Subject of the email"
                            />
                            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preheader Text</label>
                            <input
                                {...register('preheader')}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Optional preview text"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">Sender Info</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                            <input
                                {...register('from_name')}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Acme Real Estate"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                            <input
                                {...register('from_email')}
                                type="email"
                                className={cn("w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none", errors.from_email ? "border-red-500" : "border-gray-200")}
                                placeholder="info@acme.com"
                            />
                            {errors.from_email && <p className="text-xs text-red-500 mt-1">{errors.from_email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                            <input
                                {...register('reply_to')}
                                type="email"
                                className={cn("w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none", errors.reply_to ? "border-red-500" : "border-gray-200")}
                                placeholder="support@acme.com"
                            />
                            {errors.reply_to && <p className="text-xs text-red-500 mt-1">{errors.reply_to.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">Content</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
                        <textarea
                            {...register('html_body')}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            placeholder="<html>...</html>"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Body</label>
                        <textarea
                            {...register('text_body')}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            placeholder="Plain text version..."
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {createMutation.isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                        Save Template
                    </button>
                </div>
            </form>
        </div>
    );
}
