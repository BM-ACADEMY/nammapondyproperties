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
  Square,
  Layers,
  Zap,
  Layout,
  Compass,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { formatIndianPrice } from "@/utils/formatPrice";
import { formatNumber } from "@/utils/formatNumber";

import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUrl";

const AdminProperties = ({ mode }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [propertyToSell, setPropertyToSell] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" or "my"
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

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/properties/fetch-all-property?limit=100";
      if (mode === "admin") {
        // Fetch ALL Admin properties
        url += "&role=admin";
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
      dataIndex: ["media", "images"],
      key: "images",
      render: (images) =>
        images && images.length > 0 ? (
          <img
            src={getImageUrl(images[0])}
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
      key: "title",
      render: (_, record) => (
        <span className="font-medium text-gray-800">{record.basicInfo?.title || "Untitled"}</span>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.basicInfo?.title || "").toLowerCase().includes(value.toLowerCase()) ||
          String(record.location?.city || "").toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Type",
      key: "property_type",
      render: (_, record) => {
        const type = record.basicInfo?.propertyType || "Unknown";
        return (
          <Tag color={type === "realestate_with_kamar" ? "gold" : "blue"}>
            {type === "realestate_with_kamar" ? "Premium (Kamar)" : type}
          </Tag>
        );
      },
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => {
        const originalPrice = record.pricing?.sell?.price || record.pricing?.rent?.monthlyRent || 0;
        if (record.isSold && record.soldPrice) {
          return (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-xs font-normal">
                {formatIndianPrice(originalPrice)}
              </span>
              <span className="text-green-600 font-bold">
                {formatIndianPrice(record.soldPrice)}
              </span>
            </div>
          );
        }
        return <span className="font-semibold text-blue-600">{formatIndianPrice(originalPrice)}</span>;
      },
      sorter: (a, b) => {
        const pa = a.pricing?.sell?.price || a.pricing?.rent?.monthlyRent || 0;
        const pb = b.pricing?.sell?.price || b.pricing?.rent?.monthlyRent || 0;
        return pa - pb;
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (loc) => loc?.city || "N/A",
    },
    {
      title: "Added By",
      key: "addedBy",
      render: (_, record) => {
        const isMe = user && record.seller?._id === user._id;
        return (
          <Space>
            <Avatar size="small" icon={<User size={12} />} src={getImageUrl(record.seller?.profile_image)} />
            <span className={isMe ? "font-bold text-blue-600" : "text-gray-600"}>
              {isMe ? "Me" : (record.seller?.name || "Admin")}
            </span>
          </Space>
        );
      },
      hidden: mode === "seller", // Only show on admin properties page
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
      render: (count) => formatNumber(count || 0),
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified, record) => (
        <Tag
          color={isVerified ? "green" : "orange"}
          className="cursor-pointer"
          onClick={() => handleVerify(record._id, isVerified)}
        >
          {isVerified ? "Verified" : "Pending"}
        </Tag>
      ),
      filters: [
        { text: "Verified", value: true },
        { text: "Pending", value: false },
      ],
      onFilter: (value, record) => record.isVerified === value,
    },
    {
      title: "Expires In",
      key: "expiry",
      render: (_, record) => {
        const sellerRole =
          record.seller_id?.role_id?.role_name?.toUpperCase() ||
          record.seller_id?.role?.name?.toUpperCase();

        if (sellerRole === "ADMIN") {
          return <Tag color="blue">No Expiry</Tag>;
        }

        const createdAt = new Date(record.createdAt);
        const expiryDate = new Date(
          createdAt.getTime() + 21 * 24 * 60 * 60 * 1000,
        );
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return <Tag color="red">Expired</Tag>;
        return (
          <Tag color={diffDays < 5 ? "orange" : "green"}>
            {diffDays} days left
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small" wrap>
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {mode === "seller" ? "Seller Listings" : "Our Properties"}
        </h1>
        {mode === "admin" && (
          <Tabs
            activeKey={filterType}
            onChange={setFilterType}
            className="admin-property-filter-tabs"
            items={[
              { key: "all", label: "All Admin Properties" },
              { key: "my", label: "My Additions" },
            ]}
          />
        )}
        <div className="w-full sm:w-auto flex justify-start">
          <Button
            type="primary"
            onClick={() => navigate("/admin/properties/add")}
            className="bg-blue-600 w-auto"
          >
            + Add New Property
          </Button>
        </div>
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
          columns={columns.filter(col => !col.hidden)}
          dataSource={filterType === "my" ? properties.filter(p => p.seller?._id === user?._id) : properties}
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
        styles={{
          body: {
            padding: 0,
            maxHeight: "85vh",
            overflowY: "auto",
          }
        }}
      >
        {selectedProperty && (
          <div className="bg-white">
            {/* Image Header */}
            <div className="relative bg-gray-100">
              {selectedProperty.media?.images && selectedProperty.media.images.length > 0 ? (
                <Carousel autoplay className="property-carousel">
                  {selectedProperty.media.images.map((img, index) => (
                    <div key={index} className="h-[300px] md:h-[400px] w-full">
                      <img
                        src={getImageUrl(img)}
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
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
                        {selectedProperty.basicInfo?.propertyType || "Unknown"}
                      </Tag>
                      {selectedProperty.isSold && (
                        <Tag className="border-none px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-md bg-red-600/80 text-white">
                          SOLD OUT
                        </Tag>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 shadow-sm break-words">
                      {selectedProperty.basicInfo?.title || "Untitled Property"}
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
                    <div className="flex flex-col items-start md:items-end">
                      {selectedProperty.isSold && selectedProperty.soldPrice ? (
                        <>
                          <span className="text-sm text-gray-400 line-through font-normal opacity-80">
                            {formatIndianPrice(selectedProperty.pricing?.sell?.price || selectedProperty.pricing?.rent?.monthlyRent || 0)}
                          </span>
                          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 shadow-sm">
                            {formatIndianPrice(selectedProperty.soldPrice)}
                          </span>
                        </>
                      ) : (
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white shadow-sm">
                          {formatIndianPrice(selectedProperty.pricing?.sell?.price || selectedProperty.pricing?.rent?.monthlyRent || 0)}
                        </p>
                      )}
                    </div>
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
                              {selectedProperty.specifications?.area?.totalArea || "N/A"}
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
                              {selectedProperty.basicInfo?.propertyType || "N/A"}
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
                              {selectedProperty.basicInfo?.approvalType || "N/A"}
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
                            {selectedProperty.basicInfo?.description || "No Description"}
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
                        {selectedProperty.amenities &&
                          selectedProperty.amenities.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedProperty.amenities.map(
                              (amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                                >
                                  <span className="text-gray-700 font-medium text-center">
                                    {amenity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">
                              No amenities listed.
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
                        <Layout size={18} /> Specifications
                      </span>
                    ),
                    children: (
                      <div className="pt-4 space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Area Specs */}
                          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Square className="text-orange-500" /> Area Info
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Total Area</span>
                                <span className="font-bold text-gray-800">{selectedProperty.specifications?.area?.totalArea || "N/A"} sqft</span>
                              </div>
                              {selectedProperty.specifications?.area?.builtupArea && (
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-gray-500">Built-up Area</span>
                                  <span className="font-bold text-gray-800">{selectedProperty.specifications.area.builtupArea} sqft</span>
                                </div>
                              )}
                              {selectedProperty.specifications?.area?.carpetArea && (
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-gray-500">Carpet Area</span>
                                  <span className="font-bold text-gray-800">{selectedProperty.specifications.area.carpetArea} sqft</span>
                                </div>
                              )}
                              {(selectedProperty.specifications?.facing || selectedProperty.specifications?.residential?.facing) && (
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-gray-500">Facing</span>
                                  <span className="font-bold text-blue-600">{selectedProperty.specifications.facing || selectedProperty.specifications.residential.facing}</span>
                                </div>
                              )}
                              {selectedProperty.legal?.propertyStatus && (
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-gray-500">Property Status</span>
                                  <span className="font-bold text-blue-600">{selectedProperty.legal.propertyStatus}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedProperty.specifications?.floor && (selectedProperty.specifications.floor.totalFloor || selectedProperty.specifications.floor.propertyOnFloor) && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Layers className="text-purple-500" /> Floor Info
                              </h3>
                              <div className="space-y-3">
                                {selectedProperty.specifications.floor.totalFloor && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Total Floors</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.specifications.floor.totalFloor}</span>
                                  </div>
                                )}
                                {selectedProperty.specifications.floor.propertyOnFloor && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Property on Floor</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.specifications.floor.propertyOnFloor}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProperty.specifications?.residential && (selectedProperty.specifications.residential.bedrooms > 0 || selectedProperty.specifications.residential.bathrooms > 0 || selectedProperty.specifications.residential.balconies > 0 || selectedProperty.specifications.residential.facing || selectedProperty.specifications.residential.furnishing) && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Home className="text-blue-500" /> Residential details
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                {selectedProperty.specifications.residential.bedrooms > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">BHK</p>
                                    <p className="font-bold">{selectedProperty.specifications.residential.bedrooms} BHK</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.residential.bathrooms > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Bathrooms</p>
                                    <p className="font-bold">{selectedProperty.specifications.residential.bathrooms}</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.residential.balconies > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Balconies</p>
                                    <p className="font-bold">{selectedProperty.specifications.residential.balconies || 0}</p>
                                  </div>
                                )}
                                {(selectedProperty.specifications.residential.hall !== undefined || selectedProperty.specifications.residential.kitchens !== undefined) && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Hall/Kitchen</p>
                                    <p className="font-bold">{(selectedProperty.specifications.residential.hall ?? 0)}H / {(selectedProperty.specifications.residential.kitchens ?? 0)}K</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.residential.furnishing && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Furnishing</p>
                                    <p className="font-bold">{selectedProperty.specifications.residential.furnishing}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProperty.specifications?.utilities && (selectedProperty.specifications.utilities.waterSupply || selectedProperty.specifications.utilities.powerBackup) && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Zap className="text-yellow-500" /> Utilities
                              </h3>
                              <div className="space-y-3">
                                {selectedProperty.specifications.utilities.waterSupply && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Water Supply</span>
                                    <span className="font-bold text-gray-800">{selectedProperty.specifications.utilities.waterSupply}</span>
                                  </div>
                                )}
                                {selectedProperty.specifications.utilities.powerBackup && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Power Backup</span>
                                    <span className="font-bold text-gray-800">Yes</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Plot Specs */}
                          {selectedProperty.specifications?.plot && (selectedProperty.specifications.plot.plotLength || selectedProperty.specifications.plot.plotWidth || selectedProperty.specifications.plot.roadWidth || selectedProperty.specifications.plot.cornerPlot || selectedProperty.specifications.plot.gatedCommunity) && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Compass className="text-green-500" /> Plot details
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                {selectedProperty.specifications.plot.plotLength && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Length</p>
                                    <p className="font-bold">{selectedProperty.specifications.plot.plotLength} ft</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.plot.plotWidth && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Width</p>
                                    <p className="font-bold">{selectedProperty.specifications.plot.plotWidth} ft</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.plot.roadWidth && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Road Width</p>
                                    <p className="font-bold">{selectedProperty.specifications.plot.roadWidth} ft</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.plot.cornerPlot && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Corner Plot</p>
                                    <p className="font-bold">Yes</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.plot.gatedCommunity && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Gated Community</p>
                                    <p className="font-bold">Yes</p>
                                  </div>
                                )}
                                {(selectedProperty.specifications?.facing || selectedProperty.specifications?.residential?.facing) && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Facing</p>
                                    <p className="font-bold">{selectedProperty.specifications.facing || selectedProperty.specifications.residential.facing}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProperty.specifications?.commercial && (selectedProperty.specifications.commercial.cabins || selectedProperty.specifications.commercial.meetingRooms || selectedProperty.specifications.commercial.workstations || selectedProperty.specifications.commercial.washrooms || selectedProperty.specifications.commercial.pantry || selectedProperty.specifications.commercial.receptionArea || selectedProperty.specifications.commercial.suitableFor) && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building className="text-orange-500" /> Commercial details
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                {selectedProperty.specifications.commercial.cabins && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Cabins</p>
                                    <p className="font-bold">{selectedProperty.specifications.commercial.cabins}</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.meetingRooms && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Meeting Rooms</p>
                                    <p className="font-bold">{selectedProperty.specifications.commercial.meetingRooms}</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.workstations && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Workstations</p>
                                    <p className="font-bold">{selectedProperty.specifications.commercial.workstations}</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.washrooms && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Washrooms</p>
                                    <p className="font-bold">{selectedProperty.specifications.commercial.washrooms}</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.pantry && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Pantry</p>
                                    <p className="font-bold">Yes</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.receptionArea && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Reception</p>
                                    <p className="font-bold">Yes</p>
                                  </div>
                                )}
                                {selectedProperty.specifications.commercial.suitableFor && (
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-400 uppercase">Suitable For</p>
                                    <p className="font-bold">{selectedProperty.specifications.commercial.suitableFor}</p>
                                  </div>
                                )}
                                {(selectedProperty.specifications?.facing || selectedProperty.specifications?.residential?.facing) && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">Facing</p>
                                    <p className="font-bold">{selectedProperty.specifications.facing || selectedProperty.specifications.residential.facing}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "4",
                    label: (
                      <span className="flex items-center gap-2 px-2">
                        <MapPin size={18} /> Location
                      </span>
                    ),
                    children: (
                      <div className="pt-4 space-y-6 animate-fadeIn">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-1">
                            <MapPin className="text-blue-500" /> Address Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                Street / Building
                              </label>
                              <p className="text-gray-800 font-medium text-lg">
                                {selectedProperty.location?.addressLine1 ||
                                  "N/A"}
                              </p>
                              {selectedProperty.location?.addressLine2 && (
                                <p className="text-gray-600 mt-1">
                                  {selectedProperty.location.addressLine2}
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

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
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
                  className="bg-blue-600 hover:bg-blue-700 px-8 w-full sm:w-auto"
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
