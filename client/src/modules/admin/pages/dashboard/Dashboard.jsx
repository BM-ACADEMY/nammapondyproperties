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
} from "antd";
import {
  Users,
  Building,
  FileCheck,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Title } = Typography;

const Dashboard = () => {
  // Mock data for statistics
  const stats = [
    {
      title: "Total Users",
      value: 1234,
      icon: <Users size={24} className="text-blue-500" />,
      prefix: "",
      suffix: "",
      trend: 12,
      color: "#e6f7ff",
    },
    {
      title: "Total Properties",
      value: 567,
      icon: <Building size={24} className="text-green-500" />,
      prefix: "",
      suffix: "",
      trend: 5,
      color: "#f6ffed",
    },
    {
      title: "Pending Approvals",
      value: 23,
      icon: <FileCheck size={24} className="text-orange-500" />,
      prefix: "",
      suffix: "",
      trend: -2,
      color: "#fff7e6",
    },
    {
      title: "Site Visits",
      value: 45200,
      icon: <Eye size={24} className="text-purple-500" />,
      prefix: "",
      suffix: "",
      trend: 18,
      color: "#f9f0ff",
    },
  ];

  // Mock data for charts
  const PropertyData = [
    { name: "Residential", value: 400 },
    { name: "Commercial", value: 300 },
    { name: "Land", value: 300 },
    { name: "Industrial", value: 200 },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Mock data for recent activity
  const recentActivity = [
    { title: "John Doe registered as Seller", time: "2 hours ago" },
    { title: 'New Property "Sunset Villa" added', time: "4 hours ago" },
    { title: "Review reported by System", time: "5 hours ago" },
    { title: "Sarah Smith updated profile", time: "1 day ago" },
    { title: "Payment received for #INV-2024", time: "1 day ago" },
  ];

  // Mock data for pending table
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
      render: () => (
        <Button type="link" size="small">
          Review
        </Button>
      ),
    },
  ];

  const pendingData = [
    {
      key: "1",
      property: "Luxury Villa in Auroville",
      seller: "Rajesh Kumar",
      status: "Pending",
    },
    {
      key: "2",
      property: "Beachfront Land",
      seller: "Priya S",
      status: "Pending",
    },
    {
      key: "3",
      property: "City Center Apartment",
      seller: "Amit Klein",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={2} style={{ margin: 0 }}>
          Dashboard Overview
        </Title>
        <div className="text-gray-500">Last updated: Today, 12:00 PM</div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]}>
        {stats.map((stat, index) => (
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
                    data={PropertyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PropertyData.map((entry, index) => (
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
          dataSource={pendingData}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
