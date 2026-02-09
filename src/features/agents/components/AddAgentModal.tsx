import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { cn } from '@/lib/utils'; // Assumed from context
import { X, Loader2 } from 'lucide-react';

const agentSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
});

type AgentForm = z.infer<typeof agentSchema>;

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<AgentForm>({
        resolver: zodResolver(agentSchema),
    });

    const createAgentMutation = useMutation({
        mutationFn: agentsService.createAgent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.response?.data?.errors?.join(', ') || error.message || 'Failed to create agent';
            setError('root', { message });
        }
    });

    const onSubmit = (data: AgentForm) => {
        createAgentMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
                                errors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                            )}
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            {...register('phone')}
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                        />
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
                            disabled={createAgentMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {createAgentMutation.isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Create Agent
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
