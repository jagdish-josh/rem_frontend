import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage'
import OrgLayout from './features/organization/components/OrgLayout'
import DashboardPage from './features/organization/pages/DashboardPage'
import OrgProfilePage from './features/organization/pages/OrgProfilePage'
import AgentsPage from './features/agents/pages/AgentsPage'
import CampaignsPage from './features/campaigns/pages/CampaignsPage'
import SystemLayout from './features/system/components/SystemLayout'
import SystemDashboardPage from './features/system/pages/SystemDashboardPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes for Organization Members */}
        <Route path="/app" element={<OrgLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="organization" element={<OrgProfilePage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="contacts" element={<div>Contacts Page</div>} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Protected Routes for System Admins */}
        <Route path="/admin" element={<SystemLayout />}>
          <Route path="organizations" element={<SystemDashboardPage />} />
          <Route path="*" element={<Navigate to="organizations" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
