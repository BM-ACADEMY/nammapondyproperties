import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Popconfirm, Input } from "antd";
import { Search } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminProperties = ({ mode }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchProperties();
    }, [mode]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            let url = "/properties/fetch-all-property?limit=100";
            if (mode === 'admin') {
                // Fetch Admin's own properties
                if (user && user._id) {
                    url += `&seller_id=${user._id}`;
                }
            } else if (mode === 'seller') {
                // Fetch ALL Sellers' properties
                url += "&role=seller";
            }

            const response = await api.get(url);
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
            fetchProperties(); // Refresh list
        } catch (error) {
            message.error("Failed to delete property");
        }
    };

    const handleVerify = async (id, currentStatus) => {
        try {
            await api.put(`/properties/verify-property/${id}`);
            message.success(`Property ${currentStatus ? "unverified" : "verified"} successfully`);
            fetchProperties();
        } catch (error) {
            console.error("Verification error:", error);
            message.error("Failed to update verification status");
        }
    };

    const columns = [
        {
            title: "Image",
            dataIndex: "images",
            key: "images",
            render: (images) => (
                images && images.length > 0 ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${images[0].image_url}`}
                        alt="Property"
                        className="w-16 h-12 object-cover rounded"
                    />
                ) : <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => <span className="font-medium text-gray-800">{text}</span>,
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return String(record.title).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.location).toLowerCase().includes(value.toLowerCase());
            },
        },
        {
            title: "Type",
            dataIndex: "property_type",
            key: "property_type",
            render: (type) => (
                <Tag color={type === 'realestate_with_kamar' ? 'gold' : 'blue'}>
                    {type === 'realestate_with_kamar' ? 'Premium (Kamar)' : type}
                </Tag>
            ),
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
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 'available' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Views",
            dataIndex: "view_count",
            key: "view_count",
            sorter: (a, b) => a.view_count - b.view_count,
        },
        {
            title: "Verified",
            dataIndex: "is_verified",
            key: "is_verified",
            render: (is_verified, record) => (
                <Tag
                    color={is_verified ? "green" : "orange"}
                    className="cursor-pointer"
                    onClick={() => handleVerify(record._id, is_verified)}
                >
                    {is_verified ? "Verified" : "Pending"}
                </Tag>
            ),
            filters: [
                { text: 'Verified', value: true },
                { text: 'Pending', value: false },
            ],
            onFilter: (value, record) => record.is_verified === value,
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        size="small"
                        onClick={() => navigate(`/admin/properties/add?edit=${record._id}`)}
                        disabled={mode === 'seller'} // Disable editing for seller properties
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
                        <Button size="small" danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {mode === 'seller' ? 'Seller Listings' : 'Our Properties'}
                </h1>
                <Button
                    type="primary"
                    onClick={() => navigate("/admin/properties/add")}
                    className="bg-blue-600"
                >
                    + Add New Property
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    prefix={<Search size={18} className="text-gray-400" />}
                    placeholder="Search properties by title or location..."
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

export default AdminProperties;
