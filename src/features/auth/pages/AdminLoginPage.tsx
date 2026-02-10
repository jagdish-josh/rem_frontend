import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { cn } from '@/lib/utils';
import { Loader2, Shield } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address').max(30, "Email must be less than 100 characters"),
    password: z.string().min(2, 'Invalid Credentials').max(100, "Password must be less than 100 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: (data: LoginForm) => authService.login(data, true), // Always use system admin login
        onSuccess: (data) => {
            if (!data.token) {
                console.error('Login successful but no token received', data);
                throw new Error('Login successful but no token received');
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));

            // Clear all cached queries to ensure fresh data is fetched
            queryClient.clear();

            // Set the user data in the auth cache
            queryClient.setQueryData(['auth', 'user'], data.user);

            // Redirect to admin dashboard
            navigate('/admin/organizations');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.message || 'Admin login failed';
            setError('root', { message });
        },
    });

    const onSubmit = (data: LoginForm) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border border-indigo-100">
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <Shield className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        System Admin Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Authorized access only
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                type="email"
                                autoComplete="email"
                                className={cn(
                                    "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                                    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                )}
                                placeholder="admin@example.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className={cn(
                                    "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                )}
                                placeholder="Password"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {errors.root && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {loginMutation.isPending && (
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            )}
                            Sign in as Admin
                        </button>
                    </div>

                    <div className="text-center">
                        <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                            ← Back to regular login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
