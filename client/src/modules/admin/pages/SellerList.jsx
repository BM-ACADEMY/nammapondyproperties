import { useState, useEffect } from "react";
import { Table, Button, Card, Typography, Tag, Space, message, Modal } from "antd";
import { Plus, Trash2, Edit, AlertCircle } from "lucide-react";
import api from "@/services/api";
import CreateUserModal from "../components/CreateUserModal";

const { Title } = Typography;

const SellerList = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            // Fetch only sellers
            const response = await api.get("/users/get-all-users?role=seller");
            setSellers(response.data);
        } catch (error) {
            console.error("Failed to fetch sellers", error);
            message.error("Failed to load sellers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Are you sure you want to delete this seller?",
            icon: <AlertCircle className="text-red-500" />,
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await api.delete(`/users/delete-user-by-id/${id}`);
                    message.success("Seller deleted successfully");
                    fetchSellers();
                } catch (error) {
                    message.error("Failed to delete seller");
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
            responsive: ["md"], // Hide on small screens, show on tablet and up
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            responsive: ["sm"], // Hide on mobile, show on small screens and up
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
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-6">
                <Title level={3} className="!mb-0 w-full sm:w-auto text-left">Seller Management</Title>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => {
                        setEditingUser(null);
                        setIsModalVisible(true);
                    }}
                    className="w-auto"
                >
                    Add New Seller
                </Button>
            </div>

            <Card className="shadow-sm border-none overflow-hidden">
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={sellers}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            size: "small",
                            responsive: true
                        }}
                        scroll={{ x: "max-content" }}
                    />
                </div>
            </Card>

            <CreateUserModal
                visible={isModalVisible}
                onClose={handleModalClose}
                initialRole="seller"
                refreshData={fetchSellers}
                editingUser={editingUser}
            />
        </div>
    );
};

export default SellerList;
