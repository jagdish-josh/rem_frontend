import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
    email_template_id: z.string().min(1, "Email template is required"),
    audience_id: z.string().min(1, "Audience is required"),
    scheduled_at: z.string().min(1, "Scheduled at is required"),
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
            email_template_id: '',
            audience_id: '',
            scheduled_at: '',
        }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: '',
                email_template_id: '',
                audience_id: '',
            });
        }
    }, [isOpen, form]);

    // Fetch email templates
    const { data: templates, isLoading: loadingTemplates } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: campaignsService.getTemplates,
        enabled: isOpen,
    });

    // Fetch audiences
    const { data: audiences, isLoading: loadingAudiences } = useQuery({
        queryKey: ['audiences'],
        queryFn: campaignsService.getAudiences,
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: CampaignForm) => {
            const apiData = {
                name: data.name,
                email_template_id: Number(data.email_template_id),
                audience_id: Number(data.audience_id),
            };

            return campaignsService.createCampaign(apiData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign created successfully and email sent!');
            form.reset();
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.errors?.join(', ') || error.message || 'Failed to create campaign';
            toast.error(message);
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
            <DialogContent className="sm:max-w-[500px]">
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
                                                <SelectValue placeholder={loadingTemplates ? "Loading..." : "Select a template..."} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {templates?.map((template: any) => (
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
                            name="audience_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Audience <span className="text-destructive">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingAudiences}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingAudiences ? "Loading..." : "Select an audience..."} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {audiences?.map((audience: any) => (
                                                <SelectItem key={audience.id} value={audience.id.toString()}>
                                                    {audience.name}
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
                            name="scheduled_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Schedule Time <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Send Email
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
