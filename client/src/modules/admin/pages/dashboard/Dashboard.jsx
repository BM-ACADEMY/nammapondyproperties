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
    },
    {
      title: "Total Properties",
      value: data.summary.totalProperties,
      icon: <Building size={24} className="text-green-500" />,
      color: "#f6ffed",
      desc: `${data.summary.activeProperties} Active, ${data.summary.soldProperties} Sold`,
    },
    {
      title: "Pending Approvals",
      value: data.summary.pendingApprovals,
      icon: <FileCheck size={24} className="text-orange-500" />,
      color: "#fff7e6",
      desc: "Requires Verification",
    },
    {
      title: "Total Enquiries",
      value: data.summary.totalEnquiries,
      icon: <MessageSquare size={24} className="text-purple-500" />,
      color: "#f9f0ff",
      desc: "All time leads",
    },
  ];

  // --- CHARTS DATA ---
  const userDistributionData = [
    { name: "Sellers", value: data.summary.totalSellers, color: "#3b82f6" },
    { name: "Buyers", value: data.summary.totalBuyers, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const propertyStatusData = [
    { name: "Active", value: data.summary.activeProperties, color: "#10b981" },
    { name: "Sold", value: data.summary.soldProperties, color: "#ef4444" },
    { name: "Pending", value: data.summary.pendingApprovals, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Admin Dashboard
          </Title>
          <Text type="secondary">System overview and statistics</Text>
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
            title="Platform Activity Trends"
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
                    name="Property Views"
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

        {/* Distribution Charts */}
        <Col xs={24} lg={8}>
          <div className="space-y-6 h-full flex flex-col">
            <Card
              title="User Distribution"
              className="shadow-sm rounded-xl flex-1"
              bordered={false}
            >
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconSize={10}
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              title="Property Status"
              className="shadow-sm rounded-xl flex-1"
              bordered={false}
            >
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {propertyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconSize={10}
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Activity Section */}
        <Col xs={24}>
          <Title level={4}>Recent Activity</Title>
        </Col>

        {/* Recent Enquiries */}
        <Col xs={24} lg={8}>
          <Card
            title="Latest Enquiries"
            className="shadow-sm rounded-xl"
            bordered={false}
            extra={<Link to="/admin/enquiries">View All</Link>}
          >
            <List
              itemLayout="horizontal"
              dataSource={data.recentEnquiries}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}
                      >
                        <MessageSquare size={16} />
                      </Avatar>
                    }
                    // title={<span className="font-medium">{item.user}</span>}
                    description={
                      <div className="text-xs text-gray-500">
                        <div>On: {item.property}</div>
                        <div>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Properties */}
        <Col xs={24} lg={8}>
          <Card
            title="New Properties"
            className="shadow-sm rounded-xl"
            bordered={false}
            extra={<Link to="/admin/properties">View All</Link>}
          >
            <List
              itemLayout="horizontal"
              dataSource={data.recentProperties}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: "#f6ffed", color: "#52c41a" }}
                      >
                        <Home size={16} />
                      </Avatar>
                    }
                    title={
                      <Link
                        to={`/property/${item._id}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {item.title}
                      </Link>
                    }
                    description={
                      <div className="text-xs text-gray-500">
                        <div>By: {item.seller}</div>
                        <Tag
                          color={
                            item.status === "available"
                              ? "green"
                              : item.status === "sold"
                                ? "red"
                                : "gold"
                          }
                          className="mt-1"
                        >
                          {item.status.toUpperCase()}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Users */}
        <Col xs={24} lg={8}>
          <Card
            title="New Users"
            className="shadow-sm rounded-xl"
            bordered={false}
            extra={<Link to="/admin/users">View All</Link>}
          >
            <List
              itemLayout="horizontal"
              dataSource={data.recentUsers}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: "#f9f0ff", color: "#722ed1" }}
                      >
                        <UserPlus size={16} />
                      </Avatar>
                    }
                    title={<span className="font-medium">{item.name}</span>}
                    description={
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                        <span>{item.email}</span>
                        <Tag>{item.role}</Tag>
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
