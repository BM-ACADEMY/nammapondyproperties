
import { Users, Building, FileCheck, Eye } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: <Users className="w-8 h-8 text-blue-500" />, change: '+12%' },
    { title: 'Total Properties', value: '567', icon: <Building className="w-8 h-8 text-green-500" />, change: '+5%' },
    { title: 'Pending Approvals', value: '23', icon: <FileCheck className="w-8 h-8 text-orange-500" />, change: '-2%' },
    { title: 'Site Visits', value: '45.2k', icon: <Eye className="w-8 h-8 text-purple-500" />, change: '+18%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} vs last month
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-full">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
          <ul className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-center text-sm text-gray-600 border-b border-gray-50 pb-2 last:border-0 hover:bg-gray-50 transition p-2 rounded">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                User John Doe registered as a Seller.
                <span className="ml-auto text-xs text-gray-400">2h ago</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Approvals Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Property Approvals</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="p-2">Property</th>
                  <th className="p-2">Seller</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-2 font-medium">Luxury Villa in Auroville</td>
                    <td className="p-2 text-gray-500">Rajesh Kumar</td>
                    <td className="p-2"><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span></td>
                    <td className="p-2"><button className="text-blue-600 hover:text-blue-800">Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
