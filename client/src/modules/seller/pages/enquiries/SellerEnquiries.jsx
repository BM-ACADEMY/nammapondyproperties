import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Input,
  message,
  Button,
  Popconfirm,
  Tooltip,
  Typography,
  Card,
  Modal,
  Carousel,
  Tabs,
  Badge,
  Avatar,
  Divider,
  Row,
  Col,
  Space
} from "antd";
const { Title, Text } = Typography;
import {
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  Inbox,
  User,
  Lock,
  ArrowRight,
} from "lucide-react";
import moment from "moment";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { formatIndianPrice, formatPriceRange } from "@/utils/formatPrice";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CountdownTimer = ({ createdAt, validityDays = 21, isAdmin = false }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const calculateTimeLeft = () => {
      const createdDate = new Date(createdAt);
      const expiryDate = new Date(
        createdDate.getTime() + validityDays * 24 * 60 * 60 * 1000,
      );
      const now = new Date();
      const difference = expiryDate - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [createdAt, validityDays, isAdmin]);

  const displayTime = isAdmin ? "No Expiry" : timeLeft;

  if (!isAdmin && displayTime === "Expired") return null;
  if (!isAdmin && !displayTime) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm ${
        isAdmin
          ? "bg-blue-50 text-blue-600 border-blue-100"
          : "bg-amber-50 text-amber-600 border-amber-100"
      }`}
    >
      <span className="text-[11px] font-bold whitespace-nowrap">
        {isAdmin ? displayTime : `Exp: ${displayTime}`}
      </span>
    </div>
  );
};

const SellerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewDetail = (property) => {
    navigate(`/properties/${property.slug || property._id}`);
  };

  useEffect(() => {
    const init = async () => {
      await checkSubscription();
      await fetchEnquiries();
    };
    init();
  }, []);

  const checkSubscription = async () => {
    try {
      const res = await api.get("/subscriptions/my-subscription");
      setHasActiveSubscription(!!res.data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/enquiries/fetch-all");
      setEnquiries(res.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      message.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };


  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    portal: enquiries.filter((e) => e.type !== "whatsapp_lead").length,
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {moment(date).format("DD MMM YYYY")}
          </span>
          <span className="text-xs text-gray-500">
            {moment(date).format("hh:mm A")}
          </span>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Property",
      dataIndex: "property_id",
      key: "property",
      render: (property) =>
        property ? (
          <div
            className={`flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all duration-300 ${!hasActiveSubscription ? "pointer-events-none" : ""}`}
            onClick={() => hasActiveSubscription && handleViewDetail(property)}
          >
            <div className="relative">
              <img
                src={getImageUrl(
                  property.media?.featuredImage || 
                  property.media?.images?.[0] || 
                  property.images?.[0]?.image_url || 
                  property.images?.[0]
                )}
                alt="prop"
                className={`w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100 group-hover:border-blue-300 group-hover:shadow-md transition-all ${!hasActiveSubscription ? "blur-[2px]" : ""}`}
              />
              {!hasActiveSubscription && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={12} className="text-amber-500 bg-white/30 rounded-full p-0.5" />
                </div>
              )}
            </div>
            <div className={`flex flex-col max-w-50 ${!hasActiveSubscription ? "blur-[3px] select-none" : ""}`}>
              <span className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {property.basicInfo?.title || property.title || "Untitled Property"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {typeof property.location === "string" 
                  ? property.location 
                  : (property.location?.locality || property.location?.city || "Pondicherry")}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic font-medium px-2 py-1 bg-gray-50 rounded-md text-xs">Deleted Property</span>
        ),
    },
    {
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            {(record.enquirer_name || "G").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.enquirer_name || "Guest"}
            </span>
            {record.enquirer_phone?.includes('X') ? (
              <div className="relative w-fit mt-0.5 group/lock">
                <span className="text-[11px] font-medium text-gray-300 blur-[2px] select-none tracking-tighter">
                  +91 9988776655
                </span>
                <div className="absolute inset-0 flex items-center justify-start pl-1">
                  <Tooltip title="Subscribe to view phone number">
                    <Lock size={10} className="text-amber-500 bg-white/50 rounded-full" />
                  </Tooltip>
                </div>
              </div>
            ) : (
              <span className="text-xs text-blue-600 font-medium">
                {record.enquirer_phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      width: 250,
      render: (msg) => (
        msg?.includes("Locked") ? (
          <div className="relative w-full max-w-[200px] group/lock">
             <div className="text-[13px] text-gray-300 blur-[3px] select-none italic line-clamp-1">
               This is a private message from a potential property buyer interested in your listing.
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Tooltip title="Subscribe to view full message">
                  <div className="bg-white/80 backdrop-blur-sm border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm transform transition-transform group-hover/lock:scale-105">
                    <Lock size={10} className="text-amber-600" />
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">Locked</span>
                  </div>
                </Tooltip>
             </div>
          </div>
        ) : (
          <Tooltip title={msg} placement="topLeft" overlayStyle={{ maxWidth: "300px" }}>
            <div className="max-w-60 truncate text-gray-600 text-sm italic">
              "{msg || "No message provided"}"
            </div>
          </Tooltip>
        )
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={type === "whatsapp_lead" ? "green" : "blue"}
          className="rounded-full px-3 border-none flex items-center gap-1 w-fit uppercase text-[10px] font-bold"
        >
          {type === "whatsapp_lead" ? (
            <Phone size={10} />
          ) : (
            <MessageSquare size={10} />
          )}
          {type === "whatsapp_lead" ? "WhatsApp" : "Portal"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "new" ? "cyan" : "success"}
          className="rounded-full px-3 uppercase text-[10px] font-bold"
        >
          {status || "NEW"}
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
      item.enquirer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.enquirer_phone?.includes(searchText),
  );

  const downloadCSV = () => {
    if (!filteredEnquiries.length) {
      message.warning("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Property Title",
      "Enquirer Name",
      "Enquirer Phone",
      "Message",
    ];

    const rows = filteredEnquiries.map((item) => [
      moment(item.createdAt).format("DD/MM/YYYY hh:mm A"),
      item.property_id?.title || "Deleted Property",
      item.enquirer_name || "Guest",
      item.enquirer_phone || "N/A",
      `"${(item.message || "").replace(/"/g, '""')}"`, // Escape quotes
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `my_enquiries_export_${moment().format("YYYYMMDD_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Title level={2} className="mb-0 text-gray-800">Property Enquiries (Leads)</Title>
          <Text type="secondary">Manage and track all incoming enquiries for your properties</Text>
        </div>
        <div className="flex items-center gap-3">
          {!hasActiveSubscription && !loading && (
            <Button
              type="primary"
              ghost
              className="border-amber-400 text-amber-600 hover:text-amber-700 hover:border-amber-500 hover:bg-amber-50 font-bold"
              onClick={() => navigate("/seller/upgrade-plan")}
            >
              Unlock Lead Details
            </Button>
          )}
          <Button
            type="primary"
            icon={<Download size={18} />}
            onClick={downloadCSV}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg flex items-center gap-2 border-none transition-all shadow-sm"
          >
            Export Leads
          </Button>
        </div>
      </div>

      {!hasActiveSubscription && !loading && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Lock size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-900 m-0 leading-tight">Detail Access Restricted</p>
              <p className="text-amber-700/80 text-xs m-0">You need an active subscription to view customer contact details and full messages.</p>
            </div>
          </div>
          <Button 
            type="link" 
            className="text-amber-600 font-bold hover:text-amber-700 p-0"
            onClick={() => navigate("/seller/upgrade-plan")}
          >
            Upgrade Plan <ArrowRight size={14} className="inline ml-1" />
          </Button>
        </div>
      )}

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center">
                <Inbox size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">Total</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.total}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 flex items-center justify-center">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">New</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.new}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow duration-300 border-none shadow-sm bg-white overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider leading-none mb-1.5">Portal</span>
                <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? "..." : stats.portal}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-none overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Title level={4} className="mb-0 text-gray-800! whitespace-nowrap">
              Recent Enquiries
            </Title>
            <Tag color="blue" className="rounded-full border-none px-3 font-semibold whitespace-nowrap">
              {filteredEnquiries.length} results
            </Tag>
          </div>

          <div className="w-full lg:w-auto">
            <Input
              prefix={<Search size={18} className="text-gray-400" />}
              placeholder="Search enquiries..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full lg:w-60 rounded-lg bg-gray-50 border-gray-100 hover:border-blue-300 focus:border-blue-500 transition-all"
              size="large"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredEnquiries}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 8,
              placement: "bottomRight",
              showTotal: (total) => `Total ${total} enquiries`,
              size: "default",
              className: "px-4 py-4 pt-6 border-t border-gray-50",
              responsive: true
            }}
            scroll={{ x: 1000 }}
            className="enquiries-table"
          />
        </div>
      </Card>
    </div>
  );
};

export default SellerEnquiries;
