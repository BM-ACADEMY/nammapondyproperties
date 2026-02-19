import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Input,
  Tabs,
  Badge,
  Avatar,
  Divider,
  Image,
  Modal,
  Carousel,
} from "antd";
import {
  Search,
  Eye,
  X,
  Home,
  Ruler,
  Building,
  FileCheck,
  Calendar,
  BedDouble,
  MapPin,
  User,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminProperties = ({ mode }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [propertyToSell, setPropertyToSell] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewDetail = (property) => {
    setSelectedProperty(property);
    setViewModalVisible(true);
  };

  const handleCloseModal = () => {
    setViewModalVisible(false);
    setSelectedProperty(null);
  };

  const getImageUrl = (path) => {
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${path}`;
  };

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/properties/fetch-all-property?limit=100";
      if (mode === "admin") {
        // Fetch Admin's own properties
        if (user && user._id) {
          url += `&seller_id=${user._id}`;
        }
      } else if (mode === "seller") {
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
  }, [mode, user]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/properties/delete-property-by-id/${id}`);
      message.success("Property deleted successfully");
      fetchProperties(); // Refresh list
    } catch {
      message.error("Failed to delete property");
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      await api.put(`/properties/verify-property/${id}`);
      message.success(
        `Property ${currentStatus ? "unverified" : "verified"} successfully`,
      );
      fetchProperties();
    } catch (error) {
      console.error("Verification error:", error);
      message.error("Failed to update verification status");
    }
  };

  const handleMarkAsSoldClick = (property) => {
    setPropertyToSell(property);
    setSoldPrice(property.soldPrice || "");
    setSoldModalVisible(true);
  };

  const handleConfirmSold = async () => {
    try {
      const isSold = !propertyToSell.isSold;
      const payload = {
        isSold: isSold,
      };

      if (isSold && soldPrice) {
        payload.soldPrice = soldPrice;
      }

      // Use the generic update endpoint
      await api.put(
        `/properties/update-property-by-id/${propertyToSell._id}`,
        payload,
      );

      message.success(
        `Property marked as ${isSold ? "Sold Out" : "Available"}`,
      );
      setSoldModalVisible(false);
      fetchProperties();
    } catch (error) {
      console.error("Error updating sold status:", error);
      message.error("Failed to update status");
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
            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${images[0].image_url}`}
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
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.title).toLowerCase().includes(value.toLowerCase()) ||
          String(record.location).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Type",
      dataIndex: "property_type",
      key: "property_type",
      render: (type) => (
        <Tag color={type === "realestate_with_kamar" ? "gold" : "blue"}>
          {type === "realestate_with_kamar" ? "Premium (Kamar)" : type}
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
      render: (loc) => loc?.city || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="flex flex-col gap-1">
          <Tag color={status === "available" ? "green" : "red"}>
            {status.toUpperCase()}
          </Tag>
          {record.isSold && <Tag color="red">SOLD</Tag>}
        </div>
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
        { text: "Verified", value: true },
        { text: "Pending", value: false },
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
            onClick={() => handleMarkAsSoldClick(record)}
            className={`${record.isSold ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"}`}
          >
            {record.isSold ? "Mark Available" : "Sold Out"}
          </Button>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetail(record)}
            type="default"
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/admin/properties/add?edit=${record._id}`)}
            disabled={mode === "seller"} // Disable editing for seller properties
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
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {mode === "seller" ? "Seller Listings" : "Our Properties"}
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
          scroll={{ x: true }}
        />
      </div>

      {/* Sold Modal */}
      <Modal
        title={
          propertyToSell?.isSold ? "Mark as Available" : "Mark as Sold Out"
        }
        open={soldModalVisible}
        onOk={handleConfirmSold}
        onCancel={() => setSoldModalVisible(false)}
        okText="Update Status"
        cancelText="Cancel"
      >
        <p className="mb-4">
          Are you sure you want to mark <b>{propertyToSell?.title}</b> as{" "}
          {propertyToSell?.isSold ? "Available" : "Sold Out"}?
        </p>
        {!propertyToSell?.isSold && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sold Price (Optional)
            </label>
            <Input
              prefix="₹"
              placeholder="Enter sold amount"
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value)}
              type="number"
            />
          </div>
        )}
      </Modal>

      {/* Property Detail Modal - Updated Design */}
      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        style={{
          maxWidth: "900px",
          top: 20,
          paddingBottom: 20,
        }}
        closeIcon={
          <div className="bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-600" />
          </div>
        }
        className="property-detail-modal rounded-2xl overflow-hidden p-0"
        bodyStyle={{
          padding: 0,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {selectedProperty && (
          <div className="bg-white">
            {/* Image Header */}
            <div className="relative bg-gray-100">
              {selectedProperty.images && selectedProperty.images.length > 0 ? (
                <Carousel autoplay className="property-carousel">
                  {selectedProperty.images.map((img, index) => (
                    <div key={index} className="h-[300px] md:h-[400px] w-full">
                      <img
                        src={getImageUrl(img.image_url)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="h-[300px] bg-gray-200 flex items-center justify-center flex-col text-gray-400">
                  <Building size={64} className="mb-2 opacity-50" />
                  <span className="font-medium">No Images Available</span>
                </div>
              )}

              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10 pointer-events-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Tag
                        color={
                          selectedProperty.status === "available"
                            ? "success"
                            : "error"
                        }
                        className="border-none px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-md bg-white/20 text-white"
                      >
                        {selectedProperty.status?.toUpperCase()}
                      </Tag>
                      {selectedProperty.is_verified && (
                        <Tag
                          color="blue"
                          className="border-none px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-md bg-blue-500/80 text-white"
                        >
                          Verified
                        </Tag>
                      )}
                      <Tag className="border-none px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-md bg-black/40 text-white">
                        {selectedProperty.property_type}
                      </Tag>
                      {selectedProperty.isSold && (
                        <Tag className="border-none px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-md bg-red-600/80 text-white">
                          SOLD OUT
                        </Tag>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 shadow-sm">
                      {selectedProperty.title}
                    </h1>
                    <p className="flex items-center gap-2 text-gray-200 text-sm md:text-base font-medium">
                      <MapPin size={16} />
                      {selectedProperty.location?.city || "Unknown City"},{" "}
                      {selectedProperty.location?.state || ""} (
                      {selectedProperty.location?.pincode})
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-300 mb-1 font-medium">
                      {selectedProperty.isSold && selectedProperty.soldPrice
                        ? "Sold Price"
                        : "Price"}
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-white shadow-sm">
                      ₹
                      {selectedProperty.isSold && selectedProperty.soldPrice
                        ? selectedProperty.soldPrice.toLocaleString()
                        : selectedProperty.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="p-6 md:p-8">
              <Tabs
                defaultActiveKey="1"
                type="card"
                size="large"
                className="custom-tabs"
                items={[
                  {
                    key: "1",
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <Home size={18} /> Overview
                      </span>
                    ),
                    children: (
                      <div className="pt-4 space-y-8 animate-fadeIn">
                        {/* Key Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                            <span className="text-blue-400 mb-2">
                              <Ruler size={24} />
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              Area Size
                            </span>
                            <span className="text-lg font-bold text-gray-800">
                              {selectedProperty.area_size}
                            </span>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col items-center justify-center text-center">
                            <span className="text-purple-400 mb-2">
                              <Building size={24} />
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              Type
                            </span>
                            <span className="text-lg font-bold text-gray-800">
                              {selectedProperty.property_type}
                            </span>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                            <span className="text-green-400 mb-2">
                              <FileCheck size={24} />
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              Approval
                            </span>
                            <span className="text-lg font-bold text-gray-800">
                              {selectedProperty.approval}
                            </span>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-center justify-center text-center">
                            <span className="text-orange-400 mb-2">
                              <Calendar size={24} />
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              Posted
                            </span>
                            <span className="text-lg font-bold text-gray-800">
                              {new Date(
                                selectedProperty.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-blue-600 pl-3">
                            Description
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line bg-gray-50 p-6 rounded-xl border border-gray-100">
                            {selectedProperty.description}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <BedDouble size={18} /> Features
                      </span>
                    ),
                    children: (
                      <div className="pt-4 space-y-8 animate-fadeIn">
                        {selectedProperty.key_attributes &&
                        selectedProperty.key_attributes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedProperty.key_attributes.map(
                              (attr, index) =>
                                attr.key && attr.value ? (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors"
                                  >
                                    <span className="text-gray-500 font-medium">
                                      {attr.key}
                                    </span>
                                    <span className="text-gray-900 font-bold">
                                      {attr.value}
                                    </span>
                                  </div>
                                ) : null,
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">
                              No key attributes listed.
                            </p>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "3",
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <MapPin size={18} /> Location
                      </span>
                    ),
                    children: (
                      <div className="pt-4 space-y-6 animate-fadeIn">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="text-blue-500" /> Address Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                Street / Building
                              </label>
                              <p className="text-gray-800 font-medium text-lg">
                                {selectedProperty.location?.address_line_1 ||
                                  "N/A"}
                              </p>
                              {selectedProperty.location?.address_line_2 && (
                                <p className="text-gray-600 mt-1">
                                  {selectedProperty.location.address_line_2}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                City & State
                              </label>
                              <p className="text-gray-800 font-medium text-lg">
                                {selectedProperty.location?.city
                                  ? `${selectedProperty.location.city}, `
                                  : ""}
                                {selectedProperty.location?.state || ""}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                Country
                              </label>
                              <p className="text-gray-800 font-medium text-lg">
                                {selectedProperty.location?.country || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                Pincode
                              </label>
                              <Tag className="text-base px-3 py-1 bg-gray-100 text-gray-700 border-gray-200 rounded-md mt-1 font-mono">
                                {selectedProperty.location?.pincode || "N/A"}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button
                  size="large"
                  onClick={handleCloseModal}
                  className="hover:bg-gray-100"
                >
                  Close
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    navigate(
                      `/admin/properties/add?edit=${selectedProperty?._id}`,
                    );
                    handleCloseModal();
                  }}
                  disabled={mode === "seller"} // Respect the mode logic from original
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Edit Property
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminProperties;
