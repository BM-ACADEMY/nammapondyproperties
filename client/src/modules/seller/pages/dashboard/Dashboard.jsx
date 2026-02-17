import { useState, useEffect } from 'react';
import { Building, Eye, MessageSquare, TrendingUp, AlertCircle, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Spin, message, Alert } from 'antd';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalLeads: 0,
    topProperties: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/properties/seller-stats');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load dashboard data.");
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Link to="/seller/dashboard" onClick={() => window.location.reload()}>
              Retry
            </Link>
          }
        />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Properties', value: stats.totalProperties, icon: <Building className="w-8 h-8 text-blue-600" /> },
    { title: 'Active Properties', value: stats.activeProperties, icon: <AlertCircle className="w-8 h-8 text-green-600" /> }, // Changed icon/color
    { title: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <Eye className="w-8 h-8 text-purple-600" /> },
    { title: 'Total Leads', value: stats.totalLeads, icon: <MessageSquare className="w-8 h-8 text-orange-600" /> },
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
        {statCards.map((stat, index) => (
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performing Properties</h3>
        {stats.topProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Property Title</th>
                  <th className="p-3 font-semibold text-gray-600">Views</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                  <th className="p-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">
                      {/* Could add image thumbnail here if available in projection */}
                      {property.title}
                    </td>
                    <td className="p-3 text-gray-600">{property.view_count}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${property.status === 'available' ? 'bg-green-100 text-green-700' :
                          property.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link to={`/seller/properties/edit/${property._id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                        <Edit size={16} className="mr-1" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No properties found. Start by adding one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
