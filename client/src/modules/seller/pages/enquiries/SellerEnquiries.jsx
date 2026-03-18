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
} from "antd";
const { Title, Text } = Typography;
import {
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
  Plus,
  Building,
  BedDouble,
  Ruler,
  Home,
  FileCheck,
  Calendar,
  X,
  MapPin,
  Zap,
  Layout,
  Square,
  Layers,
  Edit,
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
      <Calendar size={13} className="shrink-0" />
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
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewDetail = (property) => {
    setSelectedProperty(property);
    setViewModalVisible(true);
  };

  const handleCloseModal = () => {
    setViewModalVisible(false);
    setSelectedProperty(null);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

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

  const handleDelete = async (id, type) => {
    try {
      const endpoint =
        type === "whatsapp_lead"
          ? `/enquiries/whatsapp/delete/${id}`
          : `/enquiries/delete/${id}`;

      await api.delete(endpoint);
      message.success("Enquiry deleted successfully");
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      message.error(error.response?.data?.error || "Failed to delete enquiry");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
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
            className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
            onClick={() => handleViewDetail(property)}
          >
            <img
              src={getImageUrl(
                property.media?.featuredImage || 
                property.media?.images?.[0] || 
                property.images?.[0]?.image_url || 
                property.images?.[0]
              )}
              alt="prop"
              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                {property.basicInfo?.title || property.title || "Untitled Property"}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {property.location?.locality || property.location?.city || property.location || "Unknown Location"}
              </span>
            </div>
          </div>
        ) : (
          <Tag color="default">Deleted Property</Tag>
        ),
    },
    {
      title: "Enquirer",
      key: "enquirer",
      render: (record) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900">
            {record.enquirer_name || "Guest"}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} className="text-blue-500" />
            <span>{record.enquirer_phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (msg) => (
        <Tooltip title={msg}>
          <span className="text-gray-600 italic">"{msg}"</span>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (record) => (
        <div className="flex items-center gap-2">
          <Popconfirm
            title="Delete Enquiry"
            description="Are you sure you want to delete this enquiry?"
            onConfirm={() => handleDelete(record._id, record.type)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={18} />}
              className="hover:bg-red-50 flex items-center justify-center"
            />
          </Popconfirm>
        </div>
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
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Property Enquiries
          </Title>
          <Text type="secondary">
            Manage and respond to your property leads
          </Text>
        </div>
        <Button
          type="primary"
          icon={<Download size={18} />}
          onClick={downloadCSV}
          className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl flex items-center gap-2 shadow-sm border-none transition-all"
        >
          Export Records
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md w-full">
        <Card
          variant="borderless"
          className="shadow-sm rounded-xl overflow-hidden"
          styles={{ body: { padding: "4px 8px" } }}
        >
          <Input
            prefix={<Search size={18} className="text-gray-400 ml-1" />}
            placeholder="Search enquiries..."
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border-none h-9 text-sm focus:ring-0"
            size="middle"
            allowClear
          />
        </Card>
      </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <Card
            variant="borderless"
            className="shadow-sm rounded-xl overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
          <Table
            columns={columns}
            dataSource={filteredEnquiries}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} enquiries`,
              className: "px-6 py-4",
            }}
            locale={{
              emptyText: (
                <div className="py-20 flex flex-col items-center">
                  <Search size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400">No enquiries found</p>
                </div>
              ),
            }}
          />
          </Card>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : filteredEnquiries.length > 0 ? (
            filteredEnquiries.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                      <div
                        className="flex gap-4 cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => handleViewDetail(item.property_id)}
                      >
                        {item.property_id ? (
                          <img
                            src={getImageUrl(
                              item.property_id.media?.featuredImage || 
                              item.property_id.media?.images?.[0] || 
                              item.property_id.images?.[0]?.image_url || 
                              item.property_id.images?.[0]
                            )}
                            alt="prop"
                            className="w-16 h-16 rounded-xl object-cover border border-gray-50 flex-shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200">
                            DELETED
                          </div>
                        )}
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-gray-900 line-clamp-1 text-base leading-tight">
                            {item.property_id?.basicInfo?.title || item.property_id?.title || "Property Unavailable"}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            {moment(item.createdAt).format(
                              "DD MMM YYYY, hh:mm A",
                            )}
                          </p>
                        </div>
                      </div>
                    <Popconfirm
                      title="Delete Enquiry"
                      onConfirm={() => handleDelete(item._id, item.type)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={20} />}
                        className="bg-red-50 hover:bg-red-100 rounded-xl h-10 w-10 flex items-center justify-center p-0"
                      />
                    </Popconfirm>
                  </div>


                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-50">
                    <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-gray-200/60">
                      <span className="font-bold text-gray-800">
                        {item.enquirer_name || "Guest"}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={14} className="text-indigo-500" />
                          <span>{item.enquirer_phone}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{item.message}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">
                No enquiries matching your criteria
              </p>
            </div>
          )}
        </div>

      {/* Property Detail Modal - Ported from MyProperties */}
      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        centered
        style={{
          maxWidth: "550px",
        }}
        closeIcon={
          <div className="bg-black/40 backdrop-blur-md p-2 rounded-full hover:bg-black/60 transition-all border border-white/10 group">
            <X size={16} className="text-white opacity-80 group-hover:opacity-100" />
          </div>
        }
        className="property-detail-modal"
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.6)'
          },
          content: {
            padding: 0,
            borderRadius: "28px",
            overflow: "hidden",
            backgroundColor: "#000",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          },
          body: {
            padding: 0,
            backgroundColor: "#000",
          },
        }}
      >
        {selectedProperty && (
          <div className="bg-black leading-[0]">
            {/* Image Preview Header */}
            <div className="relative">
              {(() => {
                const propertyImages = 
                  selectedProperty.media?.images || 
                  selectedProperty.images;
                
                return propertyImages && propertyImages.length > 0 ? (
                  <Carousel arrows autoplay={false} className="property-preview-carousel dark-carousel">
                    {propertyImages.map((img, index) => {
                      const imgSource = typeof img === 'string' ? img : (img.image_url || img);
                      return (
                        <div key={index} className="h-[400px] md:h-[500px] w-full flex items-center justify-center bg-black">
                          <img
                            src={getImageUrl(imgSource)}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                ) : (
                  <div className="h-[400px] md:h-[500px] flex flex-col items-center justify-center text-gray-500 bg-black">
                    <Building size={48} className="mb-4 opacity-10" />
                    <p className="text-sm font-medium opacity-50 text-white">No Images Available</p>
                  </div>
                );
              })()}

              {/* Title Overlay */}
              <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10">
                <h2 className="text-white text-xl font-bold drop-shadow-lg tracking-tight">
                  {selectedProperty.basicInfo?.title || selectedProperty.title || "Property Preview"}
                </h2>
                <div className="flex items-center gap-2 text-white/70 text-sm mt-1.5 font-medium">
                  <MapPin size={14} className="text-blue-400" />
                  <span>{selectedProperty.location?.locality || selectedProperty.location?.city || selectedProperty.location || "Puducherry"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerEnquiries;
