import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

const emailTypeSchema = z.object({
    key: z.string().min(2, "Key is required"),
    description: z.string().optional(),
});

type EmailTypeForm = z.infer<typeof emailTypeSchema>;

interface CreateEmailTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateEmailTypeModal({ isOpen, onClose }: CreateEmailTypeModalProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<EmailTypeForm>({
        resolver: zodResolver(emailTypeSchema),
    });

    const createMutation = useMutation({
        mutationFn: (data: EmailTypeForm) => {
            // Convert key to CAPITAL_SNAKE_CASE
            const capitalSnakeKey = data.key
                .trim()
                .toUpperCase()
                .replace(/\s+/g, '_')
                .replace(/[^A-Z0-9_]/g, '');

            return campaignsService.createEmailType({
                key: capitalSnakeKey,
                description: data.description
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTypes'] });
            reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create email type';
            setError('root', { message });
        }
    });

    const onSubmit = (data: EmailTypeForm) => {
        createMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Create Email Type
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('key')}
                            className={cn(
                                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900",
                                errors.key ? "border-red-500 bg-red-50" : "border-gray-200"
                            )}
                            placeholder="e.g., Welcome Email"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Will be converted to CAPITAL_SNAKE_CASE (e.g., WELCOME_EMAIL)
                        </p>
                        {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                            placeholder="Optional description..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
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
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {createMutation.isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Create Email Type
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
