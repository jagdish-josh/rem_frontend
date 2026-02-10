import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
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

    const form = useForm<EmailTypeForm>({
        resolver: zodResolver(emailTypeSchema),
        defaultValues: {
            key: '',
            description: '',
        }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

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
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create email type';
            form.setError('root', { message });
        }
    });

    const onSubmit = (data: EmailTypeForm) => {
        createMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Email Type</DialogTitle>
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
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Key <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Welcome Email" {...field} />
                                    </FormControl>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Will be converted to CAPITAL_SNAKE_CASE (e.g., WELCOME_EMAIL)
                                    </p>
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
                                            rows={3}
                                            placeholder="Optional description..."
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
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Create Email Type
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
