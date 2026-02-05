import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/" element={
          <div className="p-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Real Estate Marketing</h1>
            <p className="text-lg text-gray-700">Detailed setup complete. Tailwind v4 + React Router + TanStack Query ready.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Click Me
            </button>
          </div>
        } />
        {/* Placeholder for future routes */}
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/organization" element={<div>Organization Page</div>} />
      </Routes>
    </div>
  )
}

export default App
