import { useForm, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useEffect } from 'react';

const campaignSchema = z.object({
    name: z.string().min(2, "Campaign name is required"),
    description: z.string().optional(),
    email_template_id: z.string().min(1, "Email template is required"),
    audience_ids: z.array(z.number()),
    scheduled_at: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'sent']),
});

type CampaignForm = z.infer<typeof campaignSchema>;

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<CampaignForm>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            name: '',
            description: '',
            email_template_id: '',
            status: 'draft',
            audience_ids: [],
            scheduled_at: '',
        } as DefaultValues<CampaignForm>
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: '',
                description: '',
                email_template_id: '',
                status: 'draft',
                audience_ids: [], // TODO: Set default audience when available
                scheduled_at: '',
            });
        }
    }, [isOpen, form]);


    // Fetch email templates
    const { data: templates, isLoading: loadingTemplates } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: CampaignForm) => {
            // Convert string ID back to number if API requires it
            const apiData = {
                ...data,
                email_template_id: Number(data.email_template_id)
            };

            // TODO: Uncomment when API is ready
            // return campaignsService.createCampaign(apiData);

            // For now, just simulate success
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('Campaign would be created with data:', apiData);
                    resolve({ message: 'Campaign created successfully' });
                }, 1000);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            form.reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create campaign';
            form.setError('root', { message });
        }
    });

    const onSubmit = (data: CampaignForm) => {
        createMutation.mutate(data);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    <FormLabel>Campaign Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Spring Promotion 2024" {...field} />
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
                                            placeholder="Brief description of the campaign..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email_template_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Template <span className="text-destructive">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingTemplates}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a template..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {templates?.map(template => (
                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch('status') === 'scheduled' && (
                            <FormField
                                control={form.control}
                                name="scheduled_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scheduled At</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Audience selection will be available once the audiences/segments API is implemented.
                                For now, campaigns will target all contacts in your organization.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Create Campaign
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
