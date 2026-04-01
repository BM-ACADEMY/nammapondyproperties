import { useState, useEffect } from "react";
import {
  Building,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import {
  message,
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Select,
  List,
  Avatar,
  Tag,
  Pagination,
} from "antd";
import {
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

import Loader from "../../../../components/Common/Loader";

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d"); // 7d, 30d, 90d, all
  const [enquiryPage, setEnquiryPage] = useState(1);
  const ENQUIRIES_PER_PAGE = 5;
  const [data, setData] = useState({
    summary: {
      totalProperties: 0,
      activeProperties: 0,
      soldProperties: 0,
      pendingProperties: 0,
      totalSoldAmount: 0,
      totalViews: 0,
      totalLeads: 0,
    },
    chartData: [],
    recentEnquiries: [],
    topProperties: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/properties/seller-stats?range=${range}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
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
              to="/seller/dashboard"
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
      title: "Total Properties",
      value: data.summary.totalProperties,
      icon: <Building size={24} className="text-blue-500" />,
      color: "#e6f7ff",
      desc: "Manage your listings",
      path: "/seller/my-properties",
    },
    {
      title: "Total Views",
      value: data.summary.totalViews,
      icon: <Eye size={24} className="text-purple-500" />,
      color: "#f9f0ff",
      desc: "All time analytics",
      path: "/seller/dashboard",
    },
    {
      title: "Total Enquiries",
      value: data.summary.totalLeads,
      icon: <MessageSquare size={24} className="text-orange-500" />,
      color: "#fff7e6",
      desc: "Manage your leads",
      path: "/seller/enquiries",
    },
    {
      title: "Sold Properties",
      value: data.summary.soldProperties,
      icon: <CheckCircle size={24} className="text-emerald-500" />,
      color: "#f6ffed",
      desc: "Closed deals",
    },
    {
      title: "Sold Amount",
      value: `₹${(data.summary.totalSoldAmount || 0).toLocaleString('en-IN')}`,
      icon: <TrendingUp size={24} className="text-amber-500" />,
      color: "#fffbe6",
      desc: "Verified revenue",
    },
  ];

  // --- PIE CHART DATA ---
  const statusData = [
    { name: "Active", value: data.summary.activeProperties, color: "#10b981" },
    { name: "Sold", value: data.summary.soldProperties, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const paginatedEnquiries = data.recentEnquiries.slice(
    (enquiryPage - 1) * ENQUIRIES_PER_PAGE,
    enquiryPage * ENQUIRIES_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <Title
            level={2}
            style={{ margin: 0 }}
            className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600"
          >
            Dashboard Overview
          </Title>
          <Text type="secondary">
            Real-time performance tracking & insights
          </Text>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCardsData.map((stat, index) => (
          <Link
            to={stat.path}
            key={index}
            className="flex flex-col h-full no-underline group focus:outline-none"
          >
            <Card
              variant="borderless"
              className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl group-hover:-translate-y-1 h-full flex flex-col pt-0 border border-gray-300"
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
        {/* Main Chart: Views & Enquiries */}        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex flex-col">
                <span>Performance Trends</span>
                <span className="text-xs font-normal text-gray-400">
                  Daily listing engagement metrics
                </span>
              </div>
            }
            className="shadow-sm border border-gray-300 rounded-2xl h-full"
            variant="borderless"
          >
            <div style={{ width: "100%", height: 350, minHeight: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorEnquiries"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 5" vertical={true} horizontal={true} stroke="#e2e8f0" />
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
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Property Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="enquiries"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEnquiries)"
                    name="Enquiries"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>


        {/* Property Status Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex flex-col">
                <span>Listing Status</span>
                <span className="text-xs font-normal text-gray-400">Inventory Distribution</span>
              </div>
            }
            className="shadow-sm border border-gray-300 rounded-2xl h-full"
            variant="borderless"
          >
            <div className="flex flex-col items-center justify-center min-h-[350px]">
              {statusData.length > 0 ? (
                <>
                  <div style={{ width: "100%", height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="gradSold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          <Cell key="cell-0" fill="url(#gradActive)" stroke="none" />
                          <Cell key="cell-1" fill="url(#gradSold)" stroke="none" />
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Refined Summary Legend */}
                  <div className="w-full mt-6 space-y-3 px-4">
                    <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-300">
                      <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
                        Active
                      </span>
                      <span className="text-lg font-black text-gray-800">
                        {data.summary.activeProperties}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-300">
                      <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-blue-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> 
                        Sold
                      </span>
                      <span className="text-lg font-black text-gray-800">
                        {data.summary.soldProperties}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <AlertCircle size={32} className="text-gray-300" />
                  </div>
                  <Text type="secondary" className="font-medium">No inventory data available</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Enquiries */}
        <Col xs={24} lg={24}>
          <Card
            title="Recent Enquiries"
            className="shadow-sm border border-gray-200 rounded-xl"
            bordered={false}

          >
            <div className="space-y-4">
              {data.recentEnquiries.length > 0 ? (
                <>
                  {paginatedEnquiries.map((item, idx) => (
                  <Link 
                    to="/seller/enquiries" 
                    state={{ targetEnquiry: item._id }} 
                    key={idx} 
                    className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200 block cursor-pointer group"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      <Avatar
                        style={{ backgroundColor: "#fde3cf", color: "#f56a00", flexShrink: 0 }}
                      >
                        {item.user_id?.name
                          ? item.user_id.name[0].toUpperCase()
                          : item.enquirer_name
                            ? item.enquirer_name[0].toUpperCase()
                            : "U"}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                            {item.user_id?.name || item.enquirer_name || "Guest User"}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1 truncate max-w-full">
                          For: {item.property_id?.basicInfo?.title || "Unknown Property"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Phone size={10} className="text-gray-400" />
                          {item.user_id?.phone || item.enquirer_phone || "N/A"}
                        </div>
                      </div>
                    </div>
                    

                  </Link>
                  ))}
                  {data.recentEnquiries.length > ENQUIRIES_PER_PAGE && (
                    <div className="flex justify-end mt-4">
                      <Pagination
                        current={enquiryPage}
                        pageSize={ENQUIRIES_PER_PAGE}
                        total={data.recentEnquiries.length}
                        onChange={setEnquiryPage}
                        size="small"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No recent enquiries</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default Dashboard;
