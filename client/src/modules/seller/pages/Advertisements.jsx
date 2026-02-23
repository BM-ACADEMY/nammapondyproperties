import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Typography,
  Card,
  Badge,
  Space,
} from "antd";
import {
  Plus,
  Megaphone,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

const SellerAdvertisements = () => {
  const [properties, setProperties] = useState([]);
  const [marketingRequests, setMarketingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsRes, reqsRes] = await Promise.all([
        api.get(`/properties/fetch-all-property?seller_id=${user._id}`),
        api.get("/marketing/requests/seller"),
      ]);
      setProperties(propsRes.data.properties || []);
      setMarketingRequests(reqsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch advertisement data:", error);
      message.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const columns = [
    {
      title: "Property",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.images?.[0] && (
            <img
              src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${record.images[0].image_url}`}
              alt={text}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Marketing Status",
      key: "status",
      render: (_, record) => {
        const request = marketingRequests.find(
          (r) => r.property_id._id === record._id,
        );
        if (!request) return <Tag>No Request</Tag>;

        const statusColors = {
          pending: "orange",
          contacted: "blue",
          completed: "green",
          cancelled: "red",
        };

        return (
          <Space direction="vertical" size={0}>
            <Tag color={statusColors[request.status]}>
              {request.status.toUpperCase()}
            </Tag>
            <span className="text-[10px] text-gray-400">
              Plan: {request.plan_id?.name}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const hasActiveRequest = marketingRequests.some(
          (r) =>
            r.property_id._id === record._id &&
            ["pending", "contacted"].includes(r.status),
        );

        return (
          <Button
            disabled={hasActiveRequest}
            type={hasActiveRequest ? "default" : "primary"}
            icon={
              hasActiveRequest ? (
                <CheckCircle size={14} />
              ) : (
                <Megaphone size={14} />
              )
            }
            onClick={() => {
              // We'll use the same modal logic or redirect to MyProperties with a trigger
              // For simplicity, let's keep it here too if needed, or redirect.
              // Redirecting to MyProperties with the modal trigger is cleaner to avoid code duplication.
              window.location.href = `/seller/my-properties?advertise=${record._id}`;
            }}
          >
            {hasActiveRequest ? "Request Sent" : "Promote"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <Title level={2}>Property Promotion</Title>
        <p className="text-gray-500">
          Track and manage marketing requests for your listings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider">
                Pending Requests
              </div>
              <div className="text-4xl font-black mt-2 drop-shadow-md">
                {marketingRequests.filter((r) => r.status === "pending").length}
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <Clock size={28} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider">
                Active Promotions
              </div>
              <div className="text-4xl font-black mt-2 drop-shadow-md">
                {
                  marketingRequests.filter((r) => r.status === "completed")
                    .length
                }
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <CheckCircle size={28} />
            </div>
          </div>
        </Card>
      </div>

      <Table
        columns={columns}
        dataSource={properties}
        loading={loading}
        rowKey="_id"
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      />

      {/* <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-full text-white">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">Need a Custom Marketing Plan?</h4>
                        <p className="text-gray-600">Our experts can create a tailored strategy for your high-value properties.</p>
                    </div>
                </div>
                <Button type="primary" className="bg-blue-600" onClick={() => window.open('https://wa.me/911234567890', '_blank')}>
                    Contact Sales Head
                </Button>
            </div> */}
    </div>
  );
};

export default SellerAdvertisements;
