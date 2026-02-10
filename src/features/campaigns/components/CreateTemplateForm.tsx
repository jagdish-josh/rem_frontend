import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { Loader2, X } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const templateSchema = z.object({
    name: z.string().min(2, "Name is required"),
    subject: z.string().min(2, "Subject is required"),
    preheader: z.string().optional(),
    email_type_id: z.string().min(1, "Email Type is required"),
    from_name: z.string().optional(),
    from_email: z.string().email("Invalid email").min(1, "From Email is required"),
    reply_to: z.string().email("Invalid email").optional().or(z.literal('')),
    html_body: z.string().optional(),
    text_body: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface CreateTemplateFormProps {
    onClose: () => void;
}

export default function CreateTemplateForm({ onClose }: CreateTemplateFormProps) {
    const queryClient = useQueryClient();

    const { data: emailTypes, isLoading: isLoadingTypes } = useQuery({
        queryKey: ['emailTypes'],
        queryFn: campaignsService.getEmailTypes
    });

    const form = useForm<TemplateForm>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            from_email: '',
            name: '',
            subject: '',
            preheader: '',
            email_type_id: '',
            from_name: '',
            reply_to: '',
            html_body: '',
            text_body: '',
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: TemplateForm) => campaignsService.createTemplate({
            ...data,
            email_type_id: parseInt(data.email_type_id)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create template';
            form.setError('root', { message });
        }
    });

    const onSubmit = (data: TemplateForm) => {
        createMutation.mutate(data);
    };

    return (
        <Card className="w-full h-full border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <CardTitle className="text-xl font-bold">Create Email Template</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Monthly Newsletter" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email_type_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTypes}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {emailTypes?.map(type => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.key}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject Line</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Subject of the email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preheader"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preheader Text</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional preview text" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium mb-4 uppercase tracking-wide text-muted-foreground">Sender Info</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="from_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Acme Real Estate" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="from_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="info@acme.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reply_to"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reply-To Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="support@acme.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium mb-4 uppercase tracking-wide text-muted-foreground">Content</h3>
                            <FormField
                                control={form.control}
                                name="html_body"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>HTML Body</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={6}
                                                className="font-mono text-sm"
                                                placeholder="<html>...</html>"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="text_body"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Text Body</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={4}
                                                className="font-mono text-sm"
                                                placeholder="Plain text version..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
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
                                Save Template
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
