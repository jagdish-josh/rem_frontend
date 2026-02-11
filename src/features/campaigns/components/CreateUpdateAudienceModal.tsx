import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '../api/campaignsService';
import { contactService } from '@/features/contacts/api/contactService';
import type { CreateAudienceDTO, Audience } from '../types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

const audienceSchema = z.object({
    name: z.string().min(1, "Audience name is required"),
    bhk_type: z.string().optional(),
    furnishing_type: z.string().optional(),
    location: z.string().optional(),
    property_type: z.string().optional(),
    power_backup_type: z.string().optional(),
});

type AudienceForm = z.infer<typeof audienceSchema>;

interface CreateUpdateAudienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    audience?: Audience | null;
}

export default function CreateUpdateAudienceModal({ isOpen, onClose, audience }: CreateUpdateAudienceModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!audience;

    // Fetch preferences
    const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
        queryKey: ['preferences'],
        queryFn: contactService.getPreferences,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const form = useForm<AudienceForm>({
        resolver: zodResolver(audienceSchema),
        defaultValues: {
            name: '',
            bhk_type: '',
            furnishing_type: '',
            location: '',
            property_type: '',
            power_backup_type: '',
        }
    });

    // Reset form when modal opens or audience changes
    useEffect(() => {
        if (isOpen) {
            if (audience) {
                // Find preference names from IDs for editing
                const bhkType = preferences?.bhk_types?.find(t => t.id === audience.bhk_type_id)?.name || '';
                const furnishingType = preferences?.furnishing_types?.find(t => t.id === audience.furnishing_type_id)?.name || '';
                const location = preferences?.locations?.find(l => l.id === audience.location_id)?.city || '';
                const propertyType = preferences?.property_types?.find(t => t.id === audience.property_type_id)?.name || '';
                const powerBackupType = preferences?.power_backup_types?.find(t => t.id === audience.power_backup_type_id)?.name || '';

                form.reset({
                    name: audience.name,
                    bhk_type: bhkType,
                    furnishing_type: furnishingType,
                    location: location,
                    property_type: propertyType,
                    power_backup_type: powerBackupType,
                });
            } else {
                form.reset({
                    name: '',
                    bhk_type: '',
                    furnishing_type: '',
                    location: '',
                    property_type: '',
                    power_backup_type: '',
                });
            }
        }
    }, [isOpen, audience, preferences, form]);

    const createMutation = useMutation({
        mutationFn: (data: CreateAudienceDTO) => campaignsService.createAudience(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audiences'] });
            toast.success('Audience created successfully');
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.errors?.join(', ') || 'Failed to create audience';
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateAudienceDTO) => campaignsService.updateAudience(audience!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audiences'] });
            toast.success('Audience updated successfully');
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.errors?.join(', ') || 'Failed to update audience';
            toast.error(errorMessage);
            form.setError('root', { message: errorMessage });
        },
    });

    const onSubmit = (data: AudienceForm) => {
        // Convert selected names to IDs
        const bhkTypeId = data.bhk_type ? preferences?.bhk_types?.find(t => t.name === data.bhk_type)?.id : null;
        const furnishingTypeId = data.furnishing_type ? preferences?.furnishing_types?.find(t => t.name === data.furnishing_type)?.id : null;
        const locationId = data.location ? preferences?.locations?.find(l => l.city === data.location)?.id : null;
        const propertyTypeId = data.property_type ? preferences?.property_types?.find(t => t.name === data.property_type)?.id : null;
        const powerBackupTypeId = data.power_backup_type ? preferences?.power_backup_types?.find(t => t.name === data.power_backup_type)?.id : null;

        const dto: CreateAudienceDTO = {
            name: data.name,
            bhk_type_id: bhkTypeId || null,
            furnishing_type_id: furnishingTypeId || null,
            location_id: locationId || null,
            property_type_id: propertyTypeId || null,
            power_backup_type_id: powerBackupTypeId || null,
        };

        if (isEditMode) {
            updateMutation.mutate(dto);
        } else {
            createMutation.mutate(dto);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Audience' : 'Create New Audience'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        {/* Audience Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Audience Name <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., College students" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Preference Filters */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Target Filters (Optional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bhk_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BHK Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingPreferences ? "Loading..." : "Select BHK Type"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {preferences?.bhk_types?.map((type) => (
                                                        <SelectItem key={type.id} value={type.name || ''}>
                                                            {type.name}
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
                                    name="furnishing_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Furnishing Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingPreferences ? "Loading..." : "Select Furnishing"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {preferences?.furnishing_types?.map((type) => (
                                                        <SelectItem key={type.id} value={type.name || ''}>
                                                            {type.name}
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
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingPreferences ? "Loading..." : "Select Location"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {preferences?.locations?.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.city || ''}>
                                                            {loc.city}
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
                                    name="property_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingPreferences ? "Loading..." : "Select Property Type"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {preferences?.property_types?.map((type) => (
                                                        <SelectItem key={type.id} value={type.name || ''}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="power_backup_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Power Backup Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isLoadingPreferences ? "Loading..." : "Select Power Backup"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {preferences?.power_backup_types?.map((type) => (
                                                            <SelectItem key={type.id} value={type.name || ''}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                )}
                                {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Audience' : 'Create Audience')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
