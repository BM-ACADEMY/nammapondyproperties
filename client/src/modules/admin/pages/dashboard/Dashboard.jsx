import {
  Card,
  Col,
  Row,
  Statistic,
  List,
  Table,
  Tag,
  Button,
  Typography,
  Spin,
  message,
} from "antd";
import {
  Users,
  Building,
  FileCheck,
  Eye,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get("/properties/admin-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        message.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={24} className="text-blue-500" />,
      prefix: "",
      suffix: "",
      trend: 12,
      color: "#e6f7ff",
    },
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: <Building size={24} className="text-green-500" />,
      prefix: "",
      suffix: "",
      trend: 5,
      color: "#f6ffed",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: <FileCheck size={24} className="text-orange-500" />,
      prefix: "",
      suffix: "",
      trend: -2,
      color: "#fff7e6",
    },
    {
      title: "Site Visits",
      value: stats.siteVisits,
      icon: <Eye size={24} className="text-purple-500" />,
      prefix: "",
      suffix: "",
      trend: 18,
      color: "#f9f0ff",
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Mock data for recent activity
  const recentActivity = stats.recentActivity.map((activity) => ({
    title: activity.title,
    time: formatDistanceToNow(new Date(activity.time), { addSuffix: true }),
  }));

  // Pending table columns
  const pendingColumns = [
    { title: "Property", dataIndex: "property", key: "property" },
    { title: "Seller", dataIndex: "seller", key: "seller" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="warning">Pending</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/admin/properties`)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={2} style={{ margin: 0 }}>
          Dashboard Overview
        </Title>
        <div className="text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]}>
        {statCards.map((stat, index) => (
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
                  prefix={stat.prefix}
                  suffix={stat.suffix}
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

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            bordered={false}
            className="shadow-sm h-full"
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    }
                    title={
                      <span className="text-sm font-medium">{item.title}</span>
                    }
                    description={
                      <span className="text-xs text-gray-400">{item.time}</span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Property Distribution Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="Property Distribution"
            bordered={false}
            className="shadow-sm h-full"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.propertyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.propertyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals */}
      <Card title="Pending Approvals" bordered={false} className="shadow-sm">
        <Table
          columns={pendingColumns}
          dataSource={stats.pendingProperties}
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
