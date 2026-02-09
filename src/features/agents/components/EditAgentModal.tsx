import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import type { Agent } from '../types';

const editAgentSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    phone: z.string().optional(),
});

type EditAgentForm = z.infer<typeof editAgentSchema>;

interface EditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
}

export default function EditAgentModal({ isOpen, onClose, agent }: EditAgentModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm<EditAgentForm>({
        resolver: zodResolver(editAgentSchema),
        defaultValues: {
            full_name: agent?.full_name || '',
            phone: agent?.phone || '',
        }
    });

    useEffect(() => {
        if (isOpen && agent) {
            setValue('full_name', agent.full_name);
            setValue('phone', agent.phone || '');
        }
    }, [isOpen, agent, setValue]);

    const mutation = useMutation({
        mutationFn: (data: EditAgentForm) => {
            if (!agent) throw new Error('Agent data is required');
            return agentsService.updateAgent({
                id: agent.id,
                user: {
                    full_name: data.full_name,
                    phone: data.phone
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            onClose();
            reset();
        },
        onError: (error: any) => {
            const errors = error.response?.data?.errors;
            if (errors && typeof errors === 'object') {
                const messages: string[] = [];
                if (errors.user && Array.isArray(errors.user)) {
                    messages.push(...errors.user);
                }
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to update agent';
                setError('root', { message });
            } else if (Array.isArray(errors)) {
                setError('root', { message: errors.join('; ') });
            } else {
                setError('root', { message: error.message || 'Failed to update agent' });
            }
        }
    });

    const onSubmit = (data: EditAgentForm) => {
        mutation.mutate(data);
    };

    if (!isOpen || !agent) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Edit Agent
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                        <input
                            {...register('full_name')}
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                errors.full_name ? "border-red-500 bg-red-50" : "border-gray-200"
                            )}
                            placeholder="John Doe"
                        />
                        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Immutable)</label>
                        <input
                            value={agent.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <input
                            {...register('phone')}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
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
            </div >
        </div >
    );
}
