import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Popconfirm, Input, Typography } from "antd";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

const MyProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchProperties();
        }
    }, [user]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            // Assuming the backend endpoint `/properties/fetch-all-property` can accept a `seller_id` query parameter
            // to filter properties by the seller.
            // If the backend is updated to filter by `req.user._id` automatically for sellers,
            // then `?seller_id=${user._id}` might not be strictly necessary, but it's good practice
            // to explicitly request properties belonging to the current user.
            // If the backend has a dedicated endpoint like `/properties/my-properties`, that would be even better.
            const response = await api.get(`/properties/fetch-all-property?limit=100&seller_id=${user._id}`);

            if (response.data && response.data.properties) {
                setProperties(response.data.properties);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
            message.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/properties/delete-property-by-id/${id}`);
            message.success("Property deleted successfully");
            fetchProperties();
        } catch (error) {
            message.error("Failed to delete property");
        }
    };

    const columns = [
        {
            title: "Image",
            dataIndex: "images",
            key: "images",
            render: (images) =>
                images && images.length > 0 ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${images[0].image_url
                            }`}
                        alt="Property"
                        className="w-16 h-12 object-cover rounded"
                    />
                ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Img
                    </div>
                ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => <span className="font-medium text-gray-800">{text}</span>,
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return (
                    String(record.title).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.location).toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `₹${price.toLocaleString()}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            render: (loc) => loc?.city || "N/A"
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "available" ? "green" : "red"}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Verification",
            dataIndex: "is_verified",
            key: "is_verified",
            render: (verified) => (
                <Tag color={verified ? "green" : "orange"}>
                    {verified ? "Verified" : "Pending"}
                </Tag>
            )
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        size="small"
                        icon={<Edit size={14} />}
                        onClick={() => navigate(`/seller/add-property?edit=${record._id}`)} // Re-using add property for edit
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete the property"
                        description="Are you sure to delete this property?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size="small" danger icon={<Trash2 size={14} />}>
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} className="!mb-0">My Properties</Title>
                    <p className="text-gray-500">Manage your listings</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => navigate("/seller/add-property")}
                    className="bg-blue-600"
                >
                    Add New Property
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    prefix={<Search size={18} className="text-gray-400" />}
                    placeholder="Search properties..."
                    onChange={(e) => setSearchText(e.target.value)}
                    className="max-w-md"
                    size="large"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={properties}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default MyProperties;
