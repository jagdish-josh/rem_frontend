import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { Loader2 } from 'lucide-react';
import type { Agent } from '../types';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const editAgentSchema = z.object({
    full_name: z.string().min(2, "Name is required").max(30, "Name must be less than 100 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
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

    const form = useForm<EditAgentForm>({
        resolver: zodResolver(editAgentSchema),
        defaultValues: {
            full_name: agent?.full_name || agent?.name || '',
            phone: agent?.phone || '',
        }
    });

    useEffect(() => {
        if (isOpen && agent) {
            form.setValue('full_name', agent.full_name || agent.name || '');
            form.setValue('phone', agent.phone || '');
        }
    }, [isOpen, agent, form]);

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
            toast.success("Agent updated successfully");
            onClose();
            form.reset();
        },
        onError: (error: any) => {
            const errors = error.response?.data?.errors;
            if (errors && typeof errors === 'object') {
                const messages: string[] = [];
                if (errors.user && Array.isArray(errors.user)) {
                    messages.push(...errors.user);
                }
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to update agent';
                form.setError('root', { message });
            } else if (Array.isArray(errors)) {
                form.setError('root', { message: errors.join('; ') });
            } else {
                form.setError('root', { message: error.message || 'Failed to update agent' });
            }
        }
    });

    const onSubmit = (data: EditAgentForm) => {
        mutation.mutate(data);
    };

    if (!isOpen || !agent) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Agent</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel className="mb-2 block">Email (Immutable)</FormLabel>
                            <Input
                                value={agent.email}
                                disabled
                                className="bg-muted text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-[0.8rem] text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 (555) 000-0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
