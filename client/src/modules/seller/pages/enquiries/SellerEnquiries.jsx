import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Input, message } from "antd";
import { Search } from "lucide-react";
import dayjs from "dayjs";

const SellerEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/enquiries/fetch-all`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setEnquiries(res.data);
        } catch (error) {
            console.error("Error fetching enquiries:", error);
            message.error("Failed to fetch enquiries");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD MMM YYYY, hh:mm A"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: "descend",
        },
        {
            title: "Property",
            dataIndex: "property_id",
            key: "property",
            render: (property) =>
                property ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images?.[0]?.image_url
                                }`}
                            alt="prop"
                            className="w-8 h-8 rounded object-cover"
                        />
                        <span className="font-medium">{property.title}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Deleted Property</span>
                ),
        },
        {
            title: "Enquirer",
            key: "enquirer",
            render: (record) => (
                <div className="flex flex-col text-sm">
                    <span className="font-semibold">
                        {record.enquirer_name || "Guest"}
                    </span>
                    <span className="text-gray-500">{record.enquirer_phone}</span>
                    <span className="text-xs text-gray-400">
                        {record.enquirer_email}
                    </span>
                </div>
            ),
        },
        {
            title: "Message",
            dataIndex: "message",
            key: "message",
            ellipsis: true,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "new" ? "blue" : "green"}>
                    {status ? status.toUpperCase() : "NEW"}
                </Tag>
            ),
        },
    ];

    // Filter data based on search
    const filteredEnquiries = enquiries.filter(
        (item) =>
            item.property_id?.title
                ?.toLowerCase()
                .includes(searchText.toLowerCase()) ||
            item.enquirer_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Property Enquiries
            </h1>

            <div className="mb-4">
                <Input
                    prefix={<Search size={18} className="text-gray-400" />}
                    placeholder="Search by property or enquirer..."
                    onChange={(e) => setSearchText(e.target.value)}
                    className="max-w-md"
                    size="large"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredEnquiries}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "No enquiries found" }}
                />
            </div>
        </div>
    );
};

export default SellerEnquiries;
