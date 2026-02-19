import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Input,
  Typography,
  Modal,
  Form,
  Checkbox,
  Descriptions,
  Image,
  Carousel,
  Tabs,
  Badge,
  Avatar,
  Divider,
} from "antd";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building,
  MapPin,
  BedDouble,
  Ruler,
  Home,
  FileCheck,
  Calendar,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
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
      const response = await api.get(
        `/properties/fetch-all-property?limit=100&seller_id=${user._id}`,
      );

      if (response.data && response.data.properties) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user, fetchProperties]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/properties/delete-property-by-id/${id}`);
      message.success("Property deleted successfully");
      fetchProperties();
    } catch {
      message.error("Failed to delete property");
    }
  };

  // Filter properties logic
  const filteredProperties = properties.filter((property) => {
    const searchLower = searchText.toLowerCase();
    return (
      property.title?.toLowerCase().includes(searchLower) ||
      property.location?.city?.toLowerCase().includes(searchLower) ||
      property.location?.street?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={2} className="!mb-1 !text-2xl md:!text-3xl">
            My Properties
          </Title>
          <p className="text-gray-500">
            Manage and track your property listings
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            if (properties.length >= 2) {
              navigate("/seller/request-limit");
              return;
            }
            navigate("/seller/add-property");
          }}
          className={`h-10 px-6 rounded-lg flex items-center gap-2 ${
            properties.length >= 2
              ? "bg-orange-500 hover:bg-orange-600 border-orange-500"
              : "bg-blue-600 hover:bg-blue-700 border-blue-600"
          }`}
        >
          {properties.length >= 2 ? "Request Limit" : "Add Property"}
        </Button>
      </div>

      <div className="mb-6">
        <Input
          prefix={<Search size={20} className="text-gray-400" />}
          placeholder="Search by title, city, or street..."
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md h-12 text-base rounded-xl shadow-sm hover:shadow transition-shadow"
          allowClear
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-4 h-80 animate-pulse shadow-sm"
            >
              <div className="w-full h-40 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={getImageUrl(property.images[0].image_url)}
                    alt={property.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Eye size={32} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Tag
                    color={property.status === "available" ? "green" : "red"}
                    className="m-0 backdrop-blur-md bg-white/90 font-medium border-none shadow-sm"
                  >
                    {property.status?.toUpperCase()}
                  </Tag>
                  {property.isSold && (
                    <Tag
                      color="red"
                      className="m-0 backdrop-blur-md bg-red-600/90 text-white font-medium border-none shadow-sm"
                    >
                      SOLD OUT
                    </Tag>
                  )}
                </div>
                {property.is_verified && (
                  <div className="absolute top-3 left-3">
                    <Tag
                      color="blue"
                      className="m-0 backdrop-blur-md bg-white/90 font-medium border-none shadow-sm flex items-center gap-1"
                    >
                      Verified
                    </Tag>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <span className="line-clamp-1">
                      {property.location?.city || "Location N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{property.price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="default"
                      size="small"
                      icon={<Eye size={14} />}
                      onClick={() => handleViewDetail(property)}
                      className="flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600"
                    >
                      View
                    </Button>
                    <Button
                      type="default"
                      size="small"
                      icon={<Edit size={14} />}
                      onClick={() =>
                        navigate(`/seller/add-property?edit=${property._id}`)
                      }
                      className="flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-500"
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete Property"
                      description="Are you sure you want to delete this property?"
                      onConfirm={() => handleDelete(property._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="default"
                        size="small"
                        icon={<Trash2 size={14} />}
                        className="flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-500 hover:bg-red-50"
                      />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4 text-gray-200">
            <Building size={64} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchText
              ? "We couldn't find any properties matching your search. Try different keywords."
              : "You haven't listed any properties yet. Start by adding your first property!"}
          </p>
          {!searchText && (
            <Button
              type="primary"
              icon={<Plus size={18} />}
              onClick={() => navigate("/seller/add-property")}
              className="mt-6 bg-blue-600"
            >
              Add Property
            </Button>
          )}
        </div>
      )}

      {/* Property Detail Modal */}
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
                      Price
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-white shadow-sm">
                      ₹{selectedProperty.price?.toLocaleString()}
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
                  onClick={() => {
                    // Close first to avoid any flicker/state issues? Or just nav.
                    handleCloseModal();
                    // Maybe navigate first
                  }}
                  className="hover:bg-gray-100"
                >
                  Close
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<Edit size={18} />}
                  onClick={() => {
                    navigate(
                      `/seller/add-property?edit=${selectedProperty?._id}`,
                    );
                    handleCloseModal();
                  }}
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

export default MyProperties;
