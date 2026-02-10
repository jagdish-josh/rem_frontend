import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import type { CreateContactDTO } from '../types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

const contactSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().length(10, "Phone must be exactly 10 digits").regex(/^\d+$/, "Phone must contain only numbers"),

    // Preferences (optional)
    bhk_type: z.string().optional(),
    furnishing_type: z.string().optional(),
    location: z.string().optional(),
    property_type: z.string().optional(),
    power_backup_type: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateContactModal({ isOpen, onClose }: CreateContactModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<ContactForm>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            bhk_type: '',
            furnishing_type: '',
            location: '',
            property_type: '',
            power_backup_type: '',
        }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset();
        }
    }, [isOpen, form]);

    const createMutation = useMutation({
        mutationFn: (data: CreateContactDTO) => contactService.createContact(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || 'Failed to create contact';
            form.setError('root', { message: errorMessage });
        },
    });

    const onSubmit = (data: ContactForm) => {
        const dto: CreateContactDTO = {
            contact: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
            },
        };

        // Add preferences if any are filled
        const hasPreferences =
            data.bhk_type ||
            data.furnishing_type ||
            data.location ||
            data.property_type ||
            data.power_backup_type;

        if (hasPreferences) {
            dto.preference = {
                bhk_type: data.bhk_type || undefined,
                furnishing_type: data.furnishing_type || undefined,
                location: data.location || undefined,
                property_type: data.property_type || undefined,
                power_backup_type: data.power_backup_type || undefined,
            };
        }

        createMutation.mutate(dto);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {form.formState.errors.root && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
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
                                            <FormLabel>Phone (10 digits) <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={10} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Preferences */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Preferences (Optional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bhk_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BHK Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select BHK Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1BHK">1 BHK</SelectItem>
                                                    <SelectItem value="2BHK">2 BHK</SelectItem>
                                                    <SelectItem value="3BHK">3 BHK</SelectItem>
                                                    <SelectItem value="4BHK">4 BHK</SelectItem>
                                                    <SelectItem value="5BHK+">5 BHK+</SelectItem>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Furnishing" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                                                    <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>
                                                    <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
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
                                            <FormControl>
                                                <Input placeholder="e.g., Mumbai" {...field} />
                                            </FormControl>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Property Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Apartment">Apartment</SelectItem>
                                                    <SelectItem value="Villa">Villa</SelectItem>
                                                    <SelectItem value="Independent House">Independent House</SelectItem>
                                                    <SelectItem value="Plot/Land">Plot/Land</SelectItem>
                                                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                                                    <SelectItem value="Studio Apartment">Studio Apartment</SelectItem>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Power Backup" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="No Backup">No Backup</SelectItem>
                                                        <SelectItem value="Partial Backup">Partial Backup</SelectItem>
                                                        <SelectItem value="Full Backup">Full Backup</SelectItem>
                                                        <SelectItem value="Generator">Generator</SelectItem>
                                                        <SelectItem value="Solar">Solar</SelectItem>
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
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending && (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                )}
                                {createMutation.isPending ? 'Creating...' : 'Create Contact'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
