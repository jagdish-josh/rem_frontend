export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,240</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Active Campaigns</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Agents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                </div>
            </div>
        </div>
    );
}
