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
} from "antd";
import { Plus, Trash2, Edit, AlertCircle, MoreVertical, CheckCircle } from "lucide-react";
import api from "@/services/api";
import CreateUserModal from "../components/CreateUserModal";

const { Title } = Typography;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

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

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
            {text ? text.charAt(0) : "U"}
          </div>
          <span className="font-medium text-gray-900">{text || "Unnamed User"}</span>
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
          {status ? status.toUpperCase() : "ACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      align: "center",
      render: (verified) => (
        <Tag color={verified ? "blue" : "default"} className="rounded-full px-3">
          {verified ? "VERIFIED" : "NOT VERIFIED"}
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
            key: "edit",
            label: (
              <div className="flex items-center gap-2" onClick={() => handleEdit(record)}>
                <Edit size={14} />
                <span>Edit Details</span>
              </div>
            ),
          },
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
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setEditingUser(null);
            setIsModalVisible(true);
          }}
          className="w-full sm:w-auto"
        >
          Add New User
        </Button>
      </div>

      <Card className="shadow-sm border-none">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <CreateUserModal
        visible={isModalVisible}
        onClose={handleModalClose}
        initialRole="user"
        refreshData={fetchUsers}
        editingUser={editingUser}
      />
    </div>
  );
};

export default UserList;
