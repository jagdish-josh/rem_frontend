import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

test('App renders headline', () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    )
    const headline = screen.getByText(/Real Estate Marketing/i)
    expect(headline).toBeInTheDocument()
})
