import { useState, useEffect } from "react";
import {
  Users,
  Building,
  FileCheck,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  UserPlus,
  Home,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import {
  message,
  Alert,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  List,
  Avatar,
  Tag,
  Button,
  Table,
} from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const { Title, Text } = Typography;
const { Option } = Select;

import Loader from "../../../../components/Common/Loader";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d"); // 7d, 30d, 90d, all
  const [data, setData] = useState({
    summary: {
      totalUsers: 0,
      totalSellers: 0,
      totalBuyers: 0,
      totalProperties: 0,
      activeProperties: 0,
      soldProperties: 0,
      pendingApprovals: 0,
      totalSoldAmount: 0,
      totalViews: 0,
      totalEnquiries: 0,
    },
    chartData: [],
    recentUsers: [],
    recentProperties: [],
    recentEnquiries: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/properties/admin-stats?range=${range}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setError("Failed to load dashboard data.");
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  if (loading && !data.summary.totalProperties) {
    return <Loader />;
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
            <Link
              to="/admin/dashboard"
              onClick={() => window.location.reload()}
            >
              Retry
            </Link>
          }
        />
      </div>
    );
  }

  // --- STAT CARDS ---
  const statCardsData = [
    {
      title: "Total Users",
      value: data.summary.totalUsers,
      icon: <Users size={24} className="text-blue-500" />,
      color: "#e6f7ff",
      desc: `${data.summary.totalSellers} Sellers, ${data.summary.totalBuyers} Buyers`,
      path: "/admin/users",
    },
    {
      title: "Admin Properties",
      value: data.summary.adminPropertiesCount,
      icon: <UserPlus size={24} className="text-indigo-500" />,
      color: "#f0f5ff",
      desc: "Properties posted by Admin",
      path: "/admin/properties?seller=me",
    },
    {
      title: "Sold (Admin)",
      value: data.summary.soldAdminPropertiesCount,
      icon: <CheckCircle size={24} className="text-teal-500" />, // Changed from red for a fresher look
      color: "#e6fffb",
      desc: "Admin properties sold",
      path: "/admin/properties?status=sold&seller=me",
    },
    {
      title: "Pending Approvals",
      value: data.summary.pendingApprovals,
      icon: <FileCheck size={24} className="text-orange-500" />,
      color: "#fff7e6",
      desc: "Requires Verification",
      path: "/admin/properties?verified=false",
    },
    {
      title: "Marketing Leads",
      value: data.summary.marketingLeadsCount,
      icon: <TrendingUp size={24} className="text-pink-500" />,
      color: "#fff0f6",
      desc: "Total Marketing Requests",
      path: "/admin/marketing-requests",
    },
    {
      title: "Enquiry Leads",
      value: data.summary.totalEnquiries,
      icon: <MessageSquare size={24} className="text-purple-500" />,
      color: "#f9f0ff",
      desc: "All time leads",
      path: "/admin/enquiries",
    },
    {
      title: "Seller Properties",
      value: data.summary.sellerPropertiesCount,
      icon: <Building size={24} className="text-emerald-500" />,
      color: "#f6ffed",
      desc: "Properties by Sellers",
      path: "/admin/seller/overview",
    },
  ];

  // --- CHARTS DATA ---
  const userDistributionData = [
    { name: "Sellers", count: data.summary.totalSellers },
    { name: "Buyers", count: data.summary.totalBuyers },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title
            level={2}
            style={{ margin: 0 }}
            className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600"
          >
            Admin Insights
          </Title>
          <Text type="secondary">Real-time system performance & activity</Text>
        </div>
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-500" />
          <Select
            defaultValue="30d"
            style={{ width: 140 }}
            onChange={setRange}
            className="shadow-sm rounded-md"
          >
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 3 Months</Option>
            <Option value="all">All Time</Option>
          </Select>
        </div>
      </div>

      {/* Stats Grid - Robust responsiveness using auto-fit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {statCardsData.map((stat, index) => (
          <Link
            to={stat.path}
            key={index}
            className="flex flex-col h-full no-underline group focus:outline-none"
          >
            <Card
              variant="borderless"
              className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl group-hover:-translate-y-1 h-full flex flex-col pt-0"
              styles={{
                body: {
                  padding: "20px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div
                    style={{ background: stat.color }}
                    className="p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                  >
                    {stat.icon}
                  </div>
                  <TrendingUp
                    size={16}
                    className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                <div className="grow">
                  <Text
                    type="secondary"
                    className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400"
                  >
                    {stat.title}
                  </Text>
                  <Title
                    level={2}
                    className="text-2xl! font-black m-0! mt-1 tracking-tight text-gray-800"
                  >
                    {stat.value}
                  </Title>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <Text
                    type="secondary"
                    className="text-[10px] leading-tight text-gray-400 font-medium line-clamp-1"
                  >
                    {stat.desc}
                  </Text>
                  <ArrowRight
                    size={12}
                    className="text-gray-300 group-hover:text-blue-500 transform translate-x-0 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

  

      <Row gutter={[24, 24]}>
        {/* Main Chart: Views & Enquiries */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span>Platform Activity Trends</span>
                  <span className="text-xs font-normal text-gray-400">
                    Cumulative admin property performance
                  </span>
                </div>
              </div>
            }
            className="shadow-sm rounded-2xl h-full"
            variant="borderless"
          >
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  style={{ outline: 'none' }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 5" vertical={true} horizontal={true} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    dy={10}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#06b6d4"
                    strokeWidth={1.6}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Property Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="enquiries"
                    stroke="#10b981"
                    strokeWidth={1.6}
                    fillOpacity={1}
                    fill="url(#colorEnquiries)"
                    name="Enquiries"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* User Distribution Chart */}
        <Col xs={24} lg={8}>
          <Card
            title="User Distribution"
            className="shadow-sm rounded-2xl h-full"
            variant="borderless"
            styles={{ body: { padding: "24px" } }}
          >
            <div className="flex flex-col">
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userDistributionData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="gray"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#c7c7b0", fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                      {userDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#3b82f6" : "#10b981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 py-3 bg-gray-50/80 rounded-xl mt-4">
                {userDistributionData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{
                        backgroundColor: i === 0 ? "#3b82f6" : "#10b981",
                      }}
                    ></div>
                    <span className="text-[11px] sm:text-xs text-gray-700 font-bold uppercase tracking-wide">
                      {d.name}: {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
          {/* Marketing Trends Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex flex-col">
                <span>Marketing Performance Trends</span>
                <span className="text-xs font-normal text-gray-400">Time-series of premium marketing requests</span>
              </div>
            }
            className="shadow-sm rounded-2xl"
            variant="borderless"
            styles={{ body: { padding: '24px' } }}
          >
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.chartData} 
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  style={{ outline: 'none' }}
                >
                  <CartesianGrid strokeDasharray="1 5" vertical={true} horizontal={true} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    dy={10}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="marketingLeads" 
                    name="Leads" 
                    fill="#a78bfa" 
                    radius={[6, 6, 0, 0]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
