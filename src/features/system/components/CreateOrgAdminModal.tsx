import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Loader2 } from 'lucide-react';
import type { Organization } from '../types';
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

const adminSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
});

type AdminForm = z.infer<typeof adminSchema>;

interface CreateOrgAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
}

export default function CreateOrgAdminModal({ isOpen, onClose, organization }: CreateOrgAdminModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<AdminForm>({
        resolver: zodResolver(adminSchema),
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
        }
    });

    const createAdminMutation = useMutation({
        mutationFn: (data: AdminForm) => {
            if (!organization) throw new Error("No organization selected");
            return systemService.createOrgAdmin({
                user: {
                    ...data,
                    organization_id: organization.id
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success(`Admin created for ${organization?.name} successfully!`);
            form.reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create admin';
            form.setError('root', { message });
        }
    });

    const onSubmit = (data: AdminForm) => {
        createAdminMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Admin for {organization?.name}</DialogTitle>
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
                                        <Input placeholder="Admin Name" {...field} />
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
                                        <Input type="email" placeholder="admin@org.com" {...field} />
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
                                disabled={createAdminMutation.isPending}
                            >
                                {createAdminMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Create Admin
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
