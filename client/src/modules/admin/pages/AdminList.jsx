import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  message,
  Modal,
  Dropdown,
  Menu,
  Row,
  Col,
  Statistic,
  Avatar,
  Input,
  Form,
} from "antd";
import { getImageUrl } from "@/utils/imageUrl";
import { 
  Trash2, 
  AlertCircle, 
  MoreVertical, 
  CheckCircle, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck,
  UserPlus,
  ShieldAlert
} from "lucide-react";
import api from "@/services/api";

const { Title } = Typography;

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles/fetch-all-role");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/get-all-users?role=admin");
      setAdmins(response.data);
    } catch (error) {
      console.error("Failed to fetch admins", error);
      message.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const handleRevoke = (id) => {
    const userRole = roles.find(r => r.role_name === "user");
    if (!userRole) return message.error("User role not found");

    Modal.confirm({
      title: "Revoke Admin Privileges?",
      icon: <ShieldAlert className="text-orange-500" />,
      content: "This user will lose all administrative access and become a regular user.",
      okText: "Yes, Revoke",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.put(`/users/update-user-by-id/${id}`, {
            role_id: userRole._id,
          });
          message.success("Admin privileges revoked");
          fetchAdmins();
        } catch (error) {
          message.error("Failed to revoke privileges");
          console.error(error);
        }
      },
    });
  };

  const handleAddAdmin = async (values) => {
    const adminRole = roles.find(r => r.role_name === "admin");
    if (!adminRole) return message.error("Admin role not found");

    try {
      await api.post("/users/create-user-by-admin", {
        ...values,
        role_id: adminRole._id,
      });
      message.success("New admin created successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchAdmins();
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to create admin");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={getImageUrl(record.profile_image)} 
            size={40}
            className="bg-indigo-100 text-indigo-600 border border-indigo-200"
          >
            {text ? text.charAt(0).toUpperCase() : "A"}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text || "Admin User"}</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{record.userId || "NO ID"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.phone || "No Phone"}</span>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (createdBy) => (
        <span className="text-gray-600 font-medium whitespace-nowrap">
          {createdBy?.name || "System"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"} className="rounded-full px-3">
          <span className="inline-flex items-center whitespace-nowrap">
            {status ? status.toUpperCase() : "ACTIVE"}
          </span>
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => {
        const items = [
          {
            key: "revoke",
            danger: true,
            label: (
              <div className="flex items-center gap-2" onClick={() => handleRevoke(record._id)}>
                <ShieldAlert size={14} />
                <span>Revoke Admin</span>
              </div>
            ),
          },
          {
            key: "delete",
            danger: true,
            label: (
              <div className="flex items-center gap-2" onClick={() => {
                 Modal.confirm({
                    title: "Delete Admin Account?",
                    icon: <Trash2 className="text-red-500" />,
                    content: "This will permanently delete the admin account.",
                    okText: "Delete",
                    okType: "danger",
                    onOk: async () => {
                        try {
                            await api.delete(`/users/delete-user-by-id/${record._id}`);
                            message.success("Admin deleted");
                            fetchAdmins();
                        } catch (error) {
                            message.error("Failed to delete admin");
                        }
                    }
                 })
              }}>
                <Trash2 size={14} />
                <span>Delete Account</span>
              </div>
            ),
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<MoreVertical size={20} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Title level={3} className="mb-0!">
            Admin Management
          </Title>
          <p className="text-gray-500 mt-1">Manage staff and administrative privileges</p>
        </div>
        <Button 
          type="primary" 
          icon={<UserPlus size={18} />} 
          size="large"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md h-11"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Admin
        </Button>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-indigo-50/50 hover:bg-indigo-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-indigo-600 font-semibold text-xs uppercase tracking-wider">Total Admins</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : admins.length}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-none overflow-hidden">
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: false,
            className: "px-4"
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Add New Admin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAdmin}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter admin name" }]}
          >
            <Input placeholder="Enter name" prefix={<Users size={16} className="text-gray-400" />} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number" }
            ]}
          >
            <Input placeholder="10-digit phone number" prefix={<span className="text-gray-400">+91</span>} />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-indigo-600">
              Create Admin
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
