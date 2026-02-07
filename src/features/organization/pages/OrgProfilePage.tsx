import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

const orgSchema = z.object({
    name: z.string().min(2, "Organization name is required"),
    legalName: z.string().optional(),
    timezone: z.string(),
    phone: z.string().optional(),
});

type OrgForm = z.infer<typeof orgSchema>;

export default function OrgProfilePage() {
    // In a real app, useQuery to fetch initial data
    const { register, handleSubmit, formState: { errors } } = useForm<OrgForm>({
        resolver: zodResolver(orgSchema),
        defaultValues: {
            name: "Acme Real Estate",
            legalName: "Acme Corp Ltd.",
            timezone: "America/New_York",
            phone: "+1 (555) 123-4567"
        }
    });

    const onSubmit = (data: OrgForm) => {
        console.log("Updating Org:", data);
        // TODO: Connect to mutation
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Organization Profile</h1>
            <p className="text-gray-500 mb-8">Manage your organization's public profile and settings.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Organization Name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="name"
                                className={cn(
                                    "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border",
                                    errors.name && "border-red-500"
                                )}
                                {...register("name")}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">
                            Legal Name (Optional)
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="legalName"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                {...register("legalName")}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                            Timezone
                        </label>
                        <div className="mt-1">
                            <select
                                id="timezone"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                {...register("timezone")}
                            >
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                {/* Add more timezones */}
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Contact Phone
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="phone"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                {...register("phone")}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
