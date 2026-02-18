import { useState, useEffect } from 'react';
import { Building, Eye, MessageSquare, TrendingUp, AlertCircle, Edit, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Spin, message, Alert, Card, Row, Col, Statistic, Typography } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalLeads: 0,
    topProperties: [],
    enquiries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsResponse = await api.get('/properties/seller-stats');

        // Try to fetch enquiries, but don't fail if endpoint doesn't exist
        let enquiriesData = [];
        try {
          const enquiriesResponse = await api.get('/enquiries/seller-enquiries');
          enquiriesData = enquiriesResponse.data || [];
        } catch (enquiryError) {
          console.log("Enquiries endpoint not available yet");
        }

        setStats({
          ...statsResponse.data,
          enquiries: enquiriesData
        });
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
          title="Error"
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

  const statCardsData = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: <Building size={24} className="text-blue-500" />,
      trend: 12,
      color: '#e6f7ff'
    },
    {
      title: 'Active Properties',
      value: stats.activeProperties,
      icon: <AlertCircle size={24} className="text-green-500" />,
      trend: 5,
      color: '#f6ffed'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: <Eye size={24} className="text-purple-500" />,
      trend: 18,
      color: '#f9f0ff'
    },
    {
      title: 'Total Enquiries',
      value: stats.enquiries.length || 0,
      icon: <MessageSquare size={24} className="text-orange-500" />,
      trend: 8,
      color: '#fff7e6'
    },
  ];

  // Prepare chart data
  const propertyStatusData = [
    { name: 'Available', value: stats.activeProperties, color: '#10b981' },
    { name: 'Sold/Rented', value: stats.totalProperties - stats.activeProperties, color: '#ef4444' },
  ];

  const viewsData = stats.topProperties.slice(0, 5).map(prop => ({
    name: prop.title.substring(0, 20) + '...',
    views: prop.view_count
  }));

  const enquiriesOverTime = stats.enquiries
    .reduce((acc, curr) => {
      const date = new Date(curr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [])
    .slice(-7);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Seller Dashboard
          </Title>
          <div className="text-gray-500 mt-1">Welcome back! Here's your property overview</div>
        </div>
        {/* <Link
          to="/seller/add-property"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transition font-semibold"
        >
          + Add New Property
        </Link> */}
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        {statCardsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              bordered={false}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <Statistic
                  title={
                    <span className="text-gray-500 font-medium">
                      {stat.title}
                    </span>
                  }
                  value={stat.value}
                  valueStyle={{ fontWeight: "bold" }}
                />
                <div
                  style={{ background: stat.color }}
                  className="p-3 rounded-full"
                >
                  {stat.icon}
                </div>
              </div>
              <div
                className={`mt-4 flex items-center text-sm ${stat.trend > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {stat.trend > 0 ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                <span className="font-medium">{Math.abs(stat.trend)}%</span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Comprehensive Statistics Chart */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24}>
          <Card className="shadow-md rounded-xl" title={<span className="text-lg font-semibold">Dashboard Statistics Overview</span>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[
                  { name: 'Total Properties', value: stats.totalProperties, fill: '#3b82f6' },
                  { name: 'Active Properties', value: stats.activeProperties, fill: '#10b981' },
                  { name: 'Total Views', value: stats.totalViews, fill: '#8b5cf6' },
                  { name: 'Total Enquiries', value: stats.enquiries.length || 0, fill: '#f97316' },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {[
                    { fill: '#3b82f6' },
                    { fill: '#10b981' },
                    { fill: '#8b5cf6' },
                    { fill: '#f97316' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
