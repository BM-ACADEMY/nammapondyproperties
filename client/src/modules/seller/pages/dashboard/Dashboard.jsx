import { useState, useEffect } from "react";
import {
  Building,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";
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
  const [data, setData] = useState({
    summary: {
      totalProperties: 0,
      activeProperties: 0,
      soldProperties: 0,
      pendingProperties: 0,
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
      desc: "All time listings",
    },
    {
      title: "Active Listings",
      value: data.summary.activeProperties,
      icon: <CheckCircle size={24} className="text-green-500" />,
      color: "#f6ffed",
      desc: "Currently visible",
    },
    {
      title: "Total Views",
      value: data.summary.totalViews,
      icon: <Eye size={24} className="text-purple-500" />,
      color: "#f9f0ff",
      desc: "All time views",
    },
    {
      title: "Total Enquiries",
      value: data.summary.totalLeads,
      icon: <MessageSquare size={24} className="text-orange-500" />,
      color: "#fff7e6",
      desc: "All time leads",
    },
  ];

  // --- PIE CHART DATA ---
  const statusData = [
    { name: "Active", value: data.summary.activeProperties, color: "#10b981" },
    { name: "Sold", value: data.summary.soldProperties, color: "#ef4444" },
    {
      name: "Pending",
      value: data.summary.pendingProperties,
      color: "#f59e0b",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard Overview
          </Title>
          <Text type="secondary">
            Track your property performance and leads
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
      <Row gutter={[24, 24]}>
        {statCardsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              bordered={false}
              className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" className="font-medium">
                    {stat.title}
                  </Text>
                  <Title level={3} style={{ margin: "8px 0 0 0" }}>
                    {stat.value}
                  </Title>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {stat.desc}
                  </Text>
                </div>
                <div
                  style={{ background: stat.color }}
                  className="p-3 rounded-xl shadow-inner"
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Main Chart: Views & Enquiries */}
        <Col xs={24} lg={16}>
          <Card
            title="Performance Trends"
            className="shadow-sm rounded-xl h-full"
            bordered={false}
          >
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorEnquiries"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Page Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="enquiries"
                    stroke="#ffc658"
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
            title="Listing Status"
            className="shadow-sm rounded-xl h-full"
            bordered={false}
          >
            <div className="flex flex-col items-center justify-center h-[350px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <AlertCircle size={48} className="mb-2 opacity-20" />
                  <p>No active properties</p>
                </div>
              )}
              {/* Quick Legend/Summary */}
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                  </span>
                  <span className="font-bold">
                    {data.summary.activeProperties}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                    Pending
                  </span>
                  <span className="font-bold">
                    {data.summary.pendingProperties}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Sold
                  </span>
                  <span className="font-bold">
                    {data.summary.soldProperties}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Enquiries */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Enquiries"
            className="shadow-sm rounded-xl"
            bordered={false}
            extra={<Link to="/seller/enquiries">View All</Link>}
          >
            <List
              itemLayout="horizontal"
              dataSource={data.recentEnquiries}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.user_id?.phoneNumber ? (
                      <a
                        key="call"
                        href={`tel:${item.user_id.phoneNumber}`}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"
                      >
                        <Phone size={16} />
                      </a>
                    ) : null,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: "#fde3cf",
                          color: "#f56a00",
                        }}
                      >
                        {item.user_id?.name
                          ? item.user_id.name[0].toUpperCase()
                          : "U"}
                      </Avatar>
                    }
                    title={
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.user_id?.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                          For: {item.property_id?.title || "Unknown Property"}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {item.user_id?.email || "Interested in this property"}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: "No recent enquiries",
              }}
            />
          </Card>
        </Col>

        {/* Top Properties */}
        <Col xs={24} lg={12}>
          <Card
            title="Top Performing Properties"
            className="shadow-sm rounded-xl"
            bordered={false}
            extra={<Link to="/seller/my-properties">View All</Link>}
          >
            <List
              itemLayout="horizontal"
              dataSource={data.topProperties}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {item.images && item.images[0] ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${item.images[0].image_url}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building className="w-6 h-6 m-3 text-gray-400" />
                        )}
                      </div>
                    }
                    title={
                      <Link
                        to={`/property/${item._id}`}
                        className="font-medium hover:text-blue-600 transition"
                      >
                        {item.title}
                      </Link>
                    }
                    description={
                      <div className="flex gap-2 mt-1">
                        <Tag
                          color={
                            item.status === "available"
                              ? "green"
                              : item.status === "sold"
                                ? "red"
                                : "orange"
                          }
                        >
                          {item.status.toUpperCase()}
                        </Tag>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye size={12} /> {item.view_count} Views
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
