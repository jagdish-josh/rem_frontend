import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

const loginSchema = z.object({
    email: z.string().email('Invalid email address').max(30, "Email must be less than 100 characters"),
    password: z.string().min(2, 'Password must be at least 2 characters').max(100, "Password must be less than 100 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const loginMutation = useMutation({
        mutationFn: (data: LoginForm) => authService.login(data, false), // Regular user login
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

            // Redirect to organization dashboard
            navigate('/app/dashboard');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.message || 'Login failed';
            form.setError('root', { message });
        },
    });

    const onSubmit = (data: LoginForm) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
                    <CardDescription>
                        Welcome back to RealEstateAd
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {form.formState.errors.root && (
                                <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending && (
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                )}
                                Sign in
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
