import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth(); // Current logged in admin

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/get-all-users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.delete(`/users/delete-user-by-id/${userId}`);
          message.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          console.error(error);
          message.error("Failed to delete user");
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-700">{text}</span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.email.toLowerCase().includes(value.toLowerCase()) ||
        (record.phone && record.phone.includes(value)),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col space-y-1 text-sm text-gray-500">
          <div className="flex items-center">
            <Mail size={14} className="mr-2" /> {record.email}
          </div>
          {record.phone && (
            <div className="flex items-center">
              <Phone size={14} className="mr-2" /> {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role",
      render: (role) => {
        const roleName = role?.role_name || "User";
        let color = "blue";
        if (roleName.toLowerCase() === "admin") color = "purple";
        if (roleName.toLowerCase() === "seller") color = "green";
        return (
          <Tag color={color} className="uppercase font-bold text-xs">
            {roleName}
          </Tag>
        );
      },
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Seller", value: "seller" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) =>
        record.role_id?.role_name?.toLowerCase() === value,
    },
    {
      title: "Status",
      dataIndex: "isVerified",
      key: "status",
      render: (isVerified) => (
        <Tag color={isVerified ? "success" : "warning"}>
          {isVerified ? "Verified" : "Unverified"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit User">
            <Button
              icon={<Edit2 size={16} />}
              type="text"
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              icon={<Trash2 size={16} />}
              type="text"
              danger
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 m-0">
          User Management
        </h2>

        <div className="flex gap-4">
          <Input
            prefix={<Search size={18} className="text-gray-400" />}
            placeholder="Search users..."
            className="w-64 max-w-xs"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default Users;
