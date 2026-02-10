import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Loader2 } from 'lucide-react';
import type { OrgAdmin } from '../types';
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

const editAdminSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    phone: z.string().optional(),
});

type EditAdminForm = z.infer<typeof editAdminSchema>;

interface EditOrgAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: OrgAdmin | null;
}

export default function EditOrgAdminModal({ isOpen, onClose, admin }: EditOrgAdminModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<EditAdminForm>({
        resolver: zodResolver(editAdminSchema),
        defaultValues: {
            full_name: admin?.full_name || '',
            phone: admin?.phone || '',
        }
    });

    // Update form when admin changes
    useEffect(() => {
        if (isOpen && admin) {
            form.setValue('full_name', admin.full_name);
            form.setValue('phone', admin.phone || '');
        }
    }, [isOpen, admin, form]);

    const mutation = useMutation({
        mutationFn: (data: EditAdminForm) => {
            if (!admin) throw new Error('Admin data is required');
            return systemService.updateOrgAdmin({
                id: admin.id,
                user: {
                    full_name: data.full_name,
                    phone: data.phone
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success("Admin updated successfully");
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
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to update admin';
                form.setError('root', { message });
            } else if (Array.isArray(errors)) {
                form.setError('root', { message: errors.join('; ') });
            } else {
                form.setError('root', { message: error.message || 'Failed to update admin' });
            }
        }
    });

    const onSubmit = (data: EditAdminForm) => {
        mutation.mutate(data);
    };

    if (!isOpen || !admin) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Organization Admin</DialogTitle>
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
                                    <FormLabel>Admin Name</FormLabel>
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
                                value={admin.email}
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
