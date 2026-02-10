import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../api/agentsService';
import { Loader2 } from 'lucide-react';
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

const agentSchema = z.object({
    full_name: z.string().min(2, "Name is required").max(30, "Name must be less than 100 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z.string().email("Invalid email").max(30, "Email must be less than 100 characters"),
    phone: z.string().optional(),
});

type AgentForm = z.infer<typeof agentSchema>;

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
    const queryClient = useQueryClient();
    const form = useForm<AgentForm>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
        }
    });

    const createAgentMutation = useMutation({
        mutationFn: agentsService.createAgent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            toast.success("Agent created successfully");
            form.reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.response?.data?.errors?.join(', ') || error.message || 'Failed to create agent';
            form.setError('root', { message });
        }
    });

    const onSubmit = (data: AgentForm) => {
        createAgentMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Agent</DialogTitle>
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
                                    <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 (555) 000-0000" type="tel" {...field} />
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
                                disabled={createAgentMutation.isPending}
                            >
                                {createAgentMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Create Agent
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
