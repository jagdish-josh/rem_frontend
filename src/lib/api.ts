import axios from 'axios';

const api = axios.create({
    baseURL: '/', // Proxy handles the target
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            // Handle different HTTP error codes with user-friendly messages
            switch (status) {
                case 401:
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                    break;
                case 429:
                    // Rate limit exceeded
                    error.message = 'Too many requests. Please slow down and try again in a moment.';
                    break;
                case 500:
                    error.message = 'Server error. Please try again later.';
                    break;
                case 503:
                    error.message = 'Service temporarily unavailable. Please try again later.';
                    break;
                case 404:
                    // Keep the original 404 error message as it's usually specific
                    if (!error.message || error.message === 'Request failed with status code 404') {
                        error.message = 'The requested resource was not found.';
                    }
                    break;
            }
        } else if (error.request) {
            // Network error
            error.message = 'Network error. Please check your internet connection.';
        }

        return Promise.reject(error);
    }
);

export default api;
