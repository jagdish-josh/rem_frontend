import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import type { Organization } from '../types';

const editOrgSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
});

type EditOrgForm = z.infer<typeof editOrgSchema>;

interface EditOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
}

export default function EditOrgModal({ isOpen, onClose, organization }: EditOrgModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm<EditOrgForm>({
        resolver: zodResolver(editOrgSchema),
        defaultValues: {
            name: organization?.name || '',
            description: organization?.description || '',
        }
    });

    useEffect(() => {
        if (isOpen && organization) {
            setValue('name', organization.name);
            setValue('description', organization.description || '');
        }
    }, [isOpen, organization, setValue]);

    const mutation = useMutation({
        mutationFn: (data: EditOrgForm) => {
            if (!organization) throw new Error('Organization data is required');
            return systemService.updateOrganization({
                id: organization.id,
                organization: {
                    name: data.name,
                    description: data.description
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            onClose();
            reset();
        },
        onError: (error: any) => {
            const errors = error.response?.data?.errors;
            if (errors && typeof errors === 'object') {
                const messages: string[] = [];
                if (errors.organization && Array.isArray(errors.organization)) {
                    messages.push(...errors.organization);
                }
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to update organization';
                setError('root', { message });
            } else if (Array.isArray(errors)) {
                setError('root', { message: errors.join('; ') });
            } else {
                setError('root', { message: error.message || 'Failed to update organization' });
            }
        }
    });

    const onSubmit = (data: EditOrgForm) => {
        mutation.mutate(data);
    };

    if (!isOpen || !organization) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Edit Organization
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {errors.root && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                        <input
                            {...register('name')}
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                            )}
                            placeholder="Acme Corporation"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Brief description of the organization..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {mutation.isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
