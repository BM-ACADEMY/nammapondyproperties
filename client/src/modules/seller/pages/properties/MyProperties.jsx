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
  CheckCircle,
  CheckCircle2,
  Sparkles,
  Square,
  Layers,
  Zap,
  Layout,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const { Title } = Typography;

import { formatIndianPrice } from "@/utils/formatPrice";
import { getImageUrl } from "@/utils/imageUrl";

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
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, [createdAt, validityDays, isAdmin]);

  const displayTime = isAdmin ? "No Expiry" : timeLeft;

  if (!isAdmin && displayTime === "Expired") return null;
  if (!isAdmin && !displayTime) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm ${isAdmin ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
    >
      <Calendar size={13} className="shrink-0" />
      <span className="text-[11px] font-bold whitespace-nowrap">
        {isAdmin ? displayTime : `Exp: ${displayTime}`}
      </span>
    </div>
  );
};

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [marketingPlans, setMarketingPlans] = useState([]);
  const [marketingRequests, setMarketingRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const property_id = params.get("property_id");

    if (success && properties.length > 0) {
      message.success({
        content: "Promote your property for 10x faster visibility!",
        duration: 5,
        // Make it appear at the top
        style: { marginTop: "10vh" },
        icon: <Plus className="text-blue-500" />,
      });

      if (property_id) {
        const prop = properties.find((p) => p._id === property_id);
        if (prop) {
          setSelectedProperty(prop);
          setIsMarketingModalOpen(true);
        }
      }

      // Clear the query param without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [properties]);

  const fetchMarketingRequests = async () => {
    try {
      const response = await api.get("/marketing/requests/seller");
      setMarketingRequests(response.data.data);
    } catch (error) {
      console.error("Failed to fetch marketing requests:", error);
    }
  };

  const fetchMarketingPlans = async () => {
    try {
      const response = await api.get("/marketing/plans");
      setMarketingPlans(response.data.data);
    } catch (error) {
      console.error("Failed to fetch marketing plans:", error);
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

  const handleRequestMarketing = async (planId) => {
    setRequestLoading(true);
    try {
      await api.post("/marketing/requests", {
        property_id: selectedProperty._id,
        plan_id: planId,
      });
      message.success("Request sent! Our team will contact you shortly.");
      setIsMarketingModalOpen(false);
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to send request");
    } finally {
      setRequestLoading(false);
      fetchMarketingRequests(); // Refresh requests after submitting
    }
  };

  useEffect(() => {
    fetchMarketingPlans();
    if (user) fetchMarketingRequests();
  }, [user]);

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
      property.basicInfo?.title?.toLowerCase().includes(searchLower) ||
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
            if (properties.length >= 5) {
              navigate("/seller/request-limit");
              return;
            }
            navigate("/seller/add-property");
          }}
          className={`h-10 px-6 rounded-lg flex items-center gap-2 ${properties.length >= 5
            ? "bg-orange-500 hover:bg-orange-600 border-orange-500"
            : "bg-blue-600 hover:bg-blue-700 border-blue-600"
            }`}
        >
          {properties.length >= 5 ? "Request Limit" : "Add Property"}
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
                {property.media?.featuredImage || (property.media?.images && property.media.images.length > 0) ? (
                  <img
                    src={getImageUrl(property.media?.featuredImage || property.media.images[0])}
                    alt={property.basicInfo?.title || "Property"}
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
                {property.isVerified && (
                  <div className="absolute top-3 left-3">
                    <Tag
                      color="blue"
                      className="m-0 backdrop-blur-md bg-white/90 font-medium border-none shadow-sm flex items-center gap-1"
                    >
                      Verified
                    </Tag>
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <CountdownTimer
                    createdAt={property.createdAt}
                    isAdmin={
                      user?.role_id?.role_name?.toUpperCase() === "ADMIN" ||
                      user?.role?.name?.toUpperCase() === "ADMIN"
                    }
                  />
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">
                    {property.basicInfo?.title || "Untitled Property"}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <span className="line-clamp-1">
                      {property.location?.city || "Location N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      {property.isSold && property.soldPrice ? (
                        <>
                          <span className="text-sm text-gray-400 line-through font-normal">
                            {formatIndianPrice(property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0)}
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {formatIndianPrice(property.soldPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          {formatIndianPrice(property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
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
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {(() => {
                      const request = marketingRequests.find(
                        (r) => r.property_id?._id === property._id,
                      );
                      const hasActiveRequest =
                        request &&
                        ["pending", "contacted"].includes(request.status);

                      return (
                        <Button
                          type={hasActiveRequest ? "default" : "primary"}
                          size="small"
                          disabled={hasActiveRequest}
                          icon={
                            hasActiveRequest ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Plus size={14} />
                            )
                          }
                          onClick={() => {
                            setSelectedProperty(property);
                            setIsMarketingModalOpen(true);
                          }}
                          className={`flex items-center justify-center ${hasActiveRequest ? "" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                          {hasActiveRequest ? "Promoted" : "Advertise"}
                        </Button>
                      );
                    })()}
                    <Button
                      size="small"
                      onClick={() => handleMarkAsSoldClick(property)}
                      className={`flex items-center justify-center ${property.isSold ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"}`}
                    >
                      {property.isSold ? "Mark Available" : "Sold Out"}
                    </Button>
                  </div>
                  <div className="w-full">
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
                        className="w-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-500 hover:bg-red-50"
                      >
                        Delete Property
                      </Button>
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

      {/* Marketing Promotion Modal - Compact */}
      <Modal
        title={null}
        open={isMarketingModalOpen}
        onCancel={() => setIsMarketingModalOpen(false)}
        footer={null}
        width={850} // Reduced modal width
        className="marketing-modal pb-0"
        styles={{ body: { padding: 0, borderRadius: "16px", overflow: "hidden" } }}
        closeIcon={
          <div className="bg-slate-200 hover:bg-slate-300 p-1.5 rounded-full transition-colors mt-2 mr-2">
            <X size={16} className="text-slate-700" />
          </div>
        }
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            .poppins-font, .poppins-font * {
                font-family: 'Poppins', sans-serif;
            }
          `}
        </style>

        {/* Reduced vertical padding from py-16 to py-10 */}
        <div className="poppins-font bg-slate-50 py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              {/* Reduced title font size */}
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
                Promote Your Property
              </h1>
              {/* Reduced subtitle font size */}
              <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto">
                Get access to premium features and faster visibility. No hidden
                subscriptions. No surprises.
              </p>
            </div>

            {/* Reduced gap between cards from gap-6 to gap-4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {marketingPlans.map((plan, index) => {
                const isPopular = index === 1;

                return (
                  <div
                    key={plan._id}
                    // Reduced card padding from px-6 py-8 to px-5 py-6
                    className={`rounded-2xl px-5 py-6 ${isPopular
                      ? "bg-slate-900 shadow-xl shadow-black/10"
                      : "bg-white border border-slate-200"
                      }`}
                  >
                    <h3
                      className={`text-xs uppercase tracking-wider font-semibold mb-4 ${isPopular ? "text-white" : "text-slate-900"
                        }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-[13px] leading-snug mb-6 max-w-[200px] ${isPopular ? "text-white/90" : "text-slate-700"
                        }`}
                    >
                      {plan.description ||
                        "Perfect for getting your property noticed by potential buyers fast."}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-start gap-2">
                        <div className="flex items-baseline gap-1">
                          {/* Reduced price font size */}
                          <span
                            className={`text-3xl font-semibold leading-none ${isPopular ? "text-white" : "text-slate-900"
                              }`}
                          >
                            {plan.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestMarketing(plan._id)}
                      disabled={requestLoading}
                      // Reduced button padding and text size
                      className={`w-full py-2.5 rounded-sm text-xs font-medium mb-2.5 transition cursor-pointer flex justify-center items-center ${isPopular
                        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500"
                        : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
                        }`}
                    >
                      {requestLoading ? "Processing..." : "Request Plan"}
                    </button>

                    <p
                      className={`text-[11px] leading-tight max-w-[200px] mb-5 ${isPopular ? "text-white/70" : "text-black/50"
                        }`}
                    >
                      Pay later. Our team will contact you.
                    </p>

                    <div
                      className={`border-t mb-4 ${isPopular ? "border-white/20" : "border-slate-200"
                        }`}
                    ></div>

                    {/* Reduced spacing between features */}
                    <div className="space-y-2">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          {/* Reduced icon size */}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mt-[3px] shrink-0"
                          >
                            <path
                              d="M7.75 14.75a7 7 0 1 0 0-14 7 7 0 0 0 0 14"
                              stroke={isPopular ? "#F8FAFC" : "#62748e"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="m5.65 7.752 1.4 1.4 2.8-2.8"
                              stroke={isPopular ? "#F8FAFC" : "#62748e"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {/* Reduced feature text size */}
                          <span
                            className={`text-[13px] ${isPopular ? "text-slate-100" : "text-slate-600"
                              }`}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

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
          Are you sure you want to mark <b>{propertyToSell?.basicInfo?.title || "this property"}</b> as{" "}
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
                        {selectedProperty.basicInfo?.propertyType || "Unknown"}
                      </Tag>
                      <CountdownTimer
                        createdAt={selectedProperty.createdAt}
                        isAdmin={
                          user?.role_id?.role_name?.toUpperCase() === "ADMIN" ||
                          user?.role?.name?.toUpperCase() === "ADMIN"
                        }
                      />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 shadow-sm">
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
                      {selectedProperty.isSold && selectedProperty.soldPrice ? "Sold Price" : "Price"}
                    </p>
                    <div className="flex flex-col items-start md:items-end">
                      {selectedProperty.isSold && selectedProperty.soldPrice ? (
                        <>
                          <span className="text-sm text-gray-400 line-through font-normal opacity-80">
                            {formatIndianPrice(selectedProperty.pricing?.sell?.price || selectedProperty.pricing?.rent?.monthlyRent || 0)}
                          </span>
                          <span className="text-3xl md:text-4xl font-bold text-green-400 shadow-sm">
                            {formatIndianPrice(selectedProperty.soldPrice)}
                          </span>
                        </>
                      ) : (
                        <p className="text-3xl md:text-4xl font-bold text-white shadow-sm">
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
                            {selectedProperty.basicInfo?.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "2",
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
                    key: "3",
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
                    key: "4",
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
