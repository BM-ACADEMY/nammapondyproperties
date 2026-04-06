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
} from "antd";
import { getImageUrl } from "@/utils/imageUrl";
import { Hash, UserPlus } from "lucide-react";
import { 
  Trash2, 
  AlertCircle, 
  MoreVertical, 
  CheckCircle, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import api from "@/services/api";

const { Title } = Typography;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles/fetch-all-role");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch only users
      const response = await api.get("/users/get-all-users?role=user");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      icon: <AlertCircle className="text-red-500" />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.delete(`/users/delete-user-by-id/${id}`);
          message.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          message.error("Failed to delete user");
          console.error(error);
        }
      },
    });
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
            className="bg-blue-100 text-blue-600 border border-blue-200"
          >
            {text ? text.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text || "Unnamed User"}</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{record.userId || "NO ID"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Referral ID",
      dataIndex: "referralCode",
      key: "referralCode",
      render: (code) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
          <UserPlus size={12} className="text-gray-400" />
          <span>{code || "---"}</span>
        </div>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.phone || "No Phone"}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
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
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      align: "center",
      render: (verified) => (
        <Tag color={verified ? "blue" : "default"} className="rounded-full px-4">
          <span className="inline-flex items-center whitespace-nowrap font-medium text-[10px]">
             {verified ? "VERIFIED" : "NOT VERIFIED"}
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
            key: "toggleStatus",
            label: (
              <div
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.put(`/users/update-user-by-id/${record._id}`, {
                      status: record.status === "active" ? "inactive" : "active",
                    });
                    message.success(`User ${record.status === "active" ? "deactivated" : "activated"} successfully`);
                    fetchUsers();
                  } catch (error) {
                    message.error("Failed to update status");
                  }
                }}
              >
                <AlertCircle size={14} />
                <span>{record.status === "active" ? "Deactivate" : "Activate"}</span>
              </div>
            ),
          },
          {
            key: "toggleVerify",
            label: (
              <div
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.put(`/users/update-user-by-id/${record._id}`, {
                      isVerified: !record.isVerified,
                    });
                    message.success(`User verification ${record.isVerified ? "removed" : "applied"}`);
                    fetchUsers();
                  } catch (error) {
                    message.error("Failed to update verification");
                  }
                }}
              >
                <CheckCircle size={14} />
                <span>{record.isVerified ? "Unverify User" : "Verify User"}</span>
              </div>
            ),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            danger: true,
            label: (
              <div className="flex items-center gap-2" onClick={() => handleDelete(record._id)}>
                <Trash2 size={14} />
                <span>Delete User</span>
              </div>
            ),
          },
          {
            type: "divider",
          },
          {
            key: "makeAdmin",
            label: (
              <div
                className="flex items-center gap-2 text-indigo-600 font-medium"
                onClick={() => {
                  const adminRole = roles.find(r => r.role_name === "admin");
                  if (!adminRole) return message.error("Admin role not found");

                  Modal.confirm({
                    title: "Promote to Admin?",
                    icon: <ShieldAlert className="text-indigo-500" />,
                    content: `Are you sure you want to give administrative privileges to ${record.name || "this user"}?`,
                    okText: "Yes, Promote",
                    okType: "primary",
                    okButtonProps: { className: "bg-indigo-600" },
                    onOk: async () => {
                      try {
                        await api.put(`/users/update-user-by-id/${record._id}`, {
                          role_id: adminRole._id,
                        });
                        message.success("User promoted to Admin successfully");
                        fetchUsers();
                      } catch (error) {
                        message.error("Failed to promote user");
                      }
                    },
                  });
                }}
              >
                <ShieldAlert size={14} />
                <span>Make Admin</span>
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
        <Title level={3} className="mb-0!">
          User Management
        </Title>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-blue-50/50 hover:bg-blue-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <div className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Total Users</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : users.length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-emerald-50/50 hover:bg-emerald-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <UserCheck size={24} />
              </div>
              <div>
                <div className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Active Users</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : users.filter(u => u.status === 'active').length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-rose-50/50 hover:bg-rose-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <UserX size={24} />
              </div>
              <div>
                <div className="text-rose-600 font-semibold text-xs uppercase tracking-wider">Inactive Users</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : users.filter(u => u.status !== 'active').length}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-none bg-indigo-50/50 hover:bg-indigo-50 transition-colors py-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-indigo-600 font-semibold text-xs uppercase tracking-wider">Verified Users</div>
                <div className="text-2xl font-bold text-gray-800">{loading ? "..." : users.filter(u => u.isVerified).length}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-none overflow-hidden">
        <Table
          columns={columns}
          dataSource={users}
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
    </div>
  );
};

export default UserList;
