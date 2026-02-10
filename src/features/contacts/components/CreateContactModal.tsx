import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../api/contactService';
import type { CreateContactDTO } from '../types';
import { X } from 'lucide-react';

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateContactModal({ isOpen, onClose }: CreateContactModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        // Preferences (optional)
        bhk_type: '',
        furnishing_type: '',
        location: '',
        property_type: '',
        power_backup_type: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useMutation({
        mutationFn: (data: CreateContactDTO) => contactService.createContact(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || 'Failed to create contact';
            setErrors({ submit: errorMessage });
        },
    });

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            bhk_type: '',
            furnishing_type: '',
            location: '',
            property_type: '',
            power_backup_type: '',
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const dto: CreateContactDTO = {
            contact: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
            },
        };

        // Add preferences if any are filled
        const hasPreferences =
            formData.bhk_type ||
            formData.furnishing_type ||
            formData.location ||
            formData.property_type ||
            formData.power_backup_type;

        if (hasPreferences) {
            dto.preference = {
                bhk_type: formData.bhk_type || undefined,
                furnishing_type: formData.furnishing_type || undefined,
                location: formData.location || undefined,
                property_type: formData.property_type || undefined,
                power_backup_type: formData.power_backup_type || undefined,
            };
        }

        createMutation.mutate(dto);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Contact</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {errors.submit && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone (10 digits) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preferences (Optional) */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bhk_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    BHK Type
                                </label>
                                <select
                                    id="bhk_type"
                                    name="bhk_type"
                                    value={formData.bhk_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                >
                                    <option value="">Select BHK Type</option>
                                    <option value="1BHK">1 BHK</option>
                                    <option value="2BHK">2 BHK</option>
                                    <option value="3BHK">3 BHK</option>
                                    <option value="4BHK">4 BHK</option>
                                    <option value="5BHK+">5 BHK+</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="furnishing_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Furnishing Type
                                </label>
                                <select
                                    id="furnishing_type"
                                    name="furnishing_type"
                                    value={formData.furnishing_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                >
                                    <option value="">Select Furnishing</option>
                                    <option value="Unfurnished">Unfurnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="Fully Furnished">Fully Furnished</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Mumbai"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Property Type
                                </label>
                                <select
                                    id="property_type"
                                    name="property_type"
                                    value={formData.property_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                >
                                    <option value="">Select Property Type</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Independent House">Independent House</option>
                                    <option value="Plot/Land">Plot/Land</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Studio Apartment">Studio Apartment</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label htmlFor="power_backup_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Power Backup Type
                                </label>
                                <select
                                    id="power_backup_type"
                                    name="power_backup_type"
                                    value={formData.power_backup_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                >
                                    <option value="">Select Power Backup</option>
                                    <option value="No Backup">No Backup</option>
                                    <option value="Partial Backup">Partial Backup</option>
                                    <option value="Full Backup">Full Backup</option>
                                    <option value="Generator">Generator</option>
                                    <option value="Solar">Solar</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
