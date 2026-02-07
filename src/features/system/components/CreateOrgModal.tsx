import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

const createOrgSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    adminName: z.string().min(2, "Admin Name is required"),
    adminEmail: z.string().email("Invalid email"),
    adminPhone: z.string().optional(),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

interface CreateOrgModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<CreateOrgForm>({
        resolver: zodResolver(createOrgSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: CreateOrgForm) => {
            return systemService.createOrganization({
                organization: {
                    name: data.name,
                    description: data.description
                },
                user: {
                    full_name: data.adminName,
                    email: data.adminEmail,
                    phone: data.adminPhone
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
                    messages.push(...errors.organization.map((e: string) => `Organization: ${e}`));
                }
                if (errors.user && Array.isArray(errors.user)) {
                    messages.push(...errors.user.map((e: string) => `Admin: ${e}`));
                }
                if (errors.role && Array.isArray(errors.role)) {
                    messages.push(...errors.role);
                }
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to create organization';
                setError('root', { message });
            } else if (Array.isArray(errors)) {
                setError('root', { message: errors.join('; ') });
            } else {
                setError('root', { message: error.message || 'Failed to create organization' });
            }
        }
    });

    const onSubmit = (data: CreateOrgForm) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        Create Organization
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

                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Organization Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                <input
                                    {...register('name')}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                        errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                                    )}
                                    placeholder="Acme Real Estate"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    {...register('description')}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Optional description..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Primary Admin User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                <input
                                    {...register('adminName')}
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                        errors.adminName ? "border-red-500 bg-red-50" : "border-gray-200"
                                    )}
                                    placeholder="John Doe"
                                />
                                {errors.adminName && <p className="text-xs text-red-500 mt-1">{errors.adminName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                <input
                                    {...register('adminEmail')}
                                    type="email"
                                    className={cn(
                                        "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                        errors.adminEmail ? "border-red-500 bg-red-50" : "border-gray-200"
                                    )}
                                    placeholder="john@acme.com"
                                />
                                {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                <input
                                    {...register('adminPhone')}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-100">
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
                            Create Organization
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
