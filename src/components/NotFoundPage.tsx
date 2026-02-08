import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-9xl font-extrabold text-gray-200">404</h2>
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sorry, we couldn't find the page you're looking for.
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Go back home
                    </button>
                </div>
            </div>
        </div>
    );
}
