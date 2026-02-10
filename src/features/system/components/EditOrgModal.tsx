import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../api/systemService';
import { Loader2 } from 'lucide-react';
import type { Organization } from '../types';
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

    const form = useForm<EditOrgForm>({
        resolver: zodResolver(editOrgSchema),
        defaultValues: {
            name: '',
            description: '',
        }
    });

    useEffect(() => {
        if (isOpen && organization) {
            form.setValue('name', organization.name);
            form.setValue('description', organization.description || '');
        }
    }, [isOpen, organization, form]);

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
            form.reset();
        },
        onError: (error: any) => {
            const errors = error.response?.data?.errors;
            if (errors && typeof errors === 'object') {
                const messages: string[] = [];
                if (errors.organization && Array.isArray(errors.organization)) {
                    messages.push(...errors.organization);
                }
                const message = messages.length > 0 ? messages.join('; ') : error.message || 'Failed to update organization';
                form.setError('root', { message });
            } else if (Array.isArray(errors)) {
                form.setError('root', { message: errors.join('; ') });
            } else {
                form.setError('root', { message: error.message || 'Failed to update organization' });
            }
        }
    });

    const onSubmit = (data: EditOrgForm) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Organization</DialogTitle>
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corporation" {...field} />
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
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the organization..."
                                            rows={3}
                                            className="resize-none"
                                            {...field}
                                        />
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
