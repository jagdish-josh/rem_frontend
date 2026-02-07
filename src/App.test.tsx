import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

// Mock the auth service to avoid async issues in tests or use a wrapper
// For now, testing that Login page appears since we redirect there

test('App renders login page by default', async () => {
    const queryClient = new QueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <App />
            </MemoryRouter>
        </QueryClientProvider>
    );

    // Since we redirect / to /login, we should see "Sign in to your account"

    // Check for Login Page text
    const loginHeading = await screen.findByText(/Sign in to your account/i);
    expect(loginHeading).toBeInTheDocument();
})
