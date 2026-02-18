import { useState, useEffect } from "react";
import { Table, Button, Card, Typography, Tag, Space, message, Modal } from "antd";
import { Plus, Trash2, Edit, AlertCircle } from "lucide-react";
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
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Status",
            dataIndex: "isVerified",
            key: "status",
            render: (verified) => (
                <Tag color={verified ? "green" : "orange"}>
                    {verified ? "Verified" : "Pending"}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<Edit size={16} className="text-blue-500" />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Title level={3}>User Management</Title>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => {
                        setEditingUser(null);
                        setIsModalVisible(true);
                    }}
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
