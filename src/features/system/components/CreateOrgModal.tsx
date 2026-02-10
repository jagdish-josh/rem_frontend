import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Loader2 } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

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

    const form = useForm<CreateOrgForm>({
        resolver: zodResolver(createOrgSchema),
        defaultValues: {
            name: '',
            description: '',
            adminName: '',
            adminEmail: '',
            adminPhone: '',
        }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

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
            form.reset();
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
                form.setError('root', { message });
            } else if (Array.isArray(errors)) {
                form.setError('root', { message: errors.join('; ') });
            } else {
                form.setError('root', { message: error.message || 'Failed to create organization' });
            }
        }
    });

    const onSubmit = (data: CreateOrgForm) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground border-b pb-2">Organization Details</h3>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organization Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Real Estate" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Optional description..."
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground border-b pb-2">Primary Admin User</h3>

                            <FormField
                                control={form.control}
                                name="adminName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="adminEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@acme.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="adminPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                Create Organization
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
