
import { Building, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { title: 'My Properties', value: '12', icon: <Building className="w-8 h-8 text-blue-600" /> },
    { title: 'Total Views', value: '1,543', icon: <Eye className="w-8 h-8 text-purple-600" /> },
    { title: 'Leads Received', value: '45', icon: <MessageSquare className="w-8 h-8 text-green-600" /> },
    { title: 'Completion Rate', value: '85%', icon: <TrendingUp className="w-8 h-8 text-orange-600" /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
        <Link to="/seller/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md transition">
          + Add New Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">My Top Performing Properties</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Property Title</th>
                <th className="p-3 font-semibold text-gray-600">Views</th>
                <th className="p-3 font-semibold text-gray-600">Leads</th>
                <th className="p-3 font-semibold text-gray-600">Status</th>
                <th className="p-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">2 BHK Apartment in White Town</td>
                  <td className="p-3 text-gray-600">342</td>
                  <td className="p-3 text-gray-600">12</td>
                  <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td>
                  <td className="p-3"><button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
