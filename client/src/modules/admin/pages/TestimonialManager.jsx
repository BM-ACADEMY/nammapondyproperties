import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Button, message, Popconfirm, Space, Typography } from "antd";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import dayjs from "dayjs";

const { Title } = Typography;

const TestimonialManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/testimonials`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            setTestimonials(res.data);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
            message.error("Failed to fetch testimonials");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/testimonials/${id}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            message.success(`Testimonial ${status} successfully`);
            fetchTestimonials(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            message.error(`Failed to mark as ${status}`);
        }
    };

    const deleteTestimonial = async (id) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/testimonials/${id}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            message.success("Testimonial deleted");
            fetchTestimonials();
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            message.error("Failed to delete testimonial");
        }
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("MMM D, YYYY"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: "descend",
        },
        {
            title: "User",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div>
                    <div className="font-semibold">{text}</div>
                    <div className="text-xs text-gray-500">{record.role || "User"}</div>
                </div>
            )
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            width: 400,
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => (
                <span className="text-yellow-500 font-bold">★ {rating}</span>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue";
                if (status === "approved") color = "green";
                if (status === "rejected") color = "red";
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    {record.status !== "approved" && (
                        <Button
                            type="text"
                            icon={<CheckCircle size={18} className="text-green-600" />}
                            onClick={() => updateStatus(record._id, "approved")}
                            title="Approve"
                        />
                    )}
                    {record.status !== "rejected" && (
                        <Button
                            type="text"
                            icon={<XCircle size={18} className="text-red-600" />}
                            onClick={() => updateStatus(record._id, "rejected")}
                            title="Reject"
                        />
                    )}
                    <Popconfirm
                        title="Delete testimonial?"
                        onConfirm={() => deleteTestimonial(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<Trash2 size={18} />}
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2} className="!mb-0">Testimonials</Title>
                <p className="text-gray-500 mt-1">Manage user reviews appearing on the homepage.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={testimonials}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
            </div>
        </div>
    );
};

export default TestimonialManager;
