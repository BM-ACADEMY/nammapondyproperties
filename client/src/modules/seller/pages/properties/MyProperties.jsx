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
  Card,
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

const { Title, Text } = Typography;

import { formatIndianPrice, formatPriceRange } from "@/utils/formatPrice";
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
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            My Properties
          </Title>
          <Text type="secondary">
            Manage and track your property listings
          </Text>
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
          className={`h-10 px-6 rounded-xl flex items-center gap-2 border-none transition-all shadow-sm ${
            properties.length >= 5
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {properties.length >= 5 ? "Request Limit" : "Add Property"}
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
            placeholder="Search properties..."
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border-none h-9 text-sm focus:ring-0"
            size="middle"
            allowClear
          />
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100/50 overflow-hidden group flex flex-col h-full"
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                {property.media?.featuredImage || (property.media?.images && property.media.images.length > 0) ? (
                  <img
                    src={getImageUrl(property.media?.featuredImage || property.media.images[0])}
                    alt={property.basicInfo?.title || "Property"}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                    <Building size={48} strokeWidth={1.5} />
                    <span className="text-xs font-medium mt-2">No Image</span>
                  </div>
                )}
                
                {/* Status Badges Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${
                    property.status === "available" 
                      ? "bg-green-500/80 text-white border-green-400/50" 
                      : "bg-red-500/80 text-white border-red-400/50"
                  }`}>
                    {property.status}
                  </div>
                  {property.isSold && (
                    <div className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-600 text-white border border-red-500/50 shadow-lg animate-pulse">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Verification & Countdown Overlay */}
                <div className="absolute bottom-4 inset-x-4 flex justify-between items-end z-10">
                  <div className="flex flex-col gap-2">
                    {property.isVerified && (
                      <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg border border-blue-500/50">
                        <CheckCircle2 size={12} strokeWidth={3} />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="scale-90 origin-bottom-right">
                    <CountdownTimer
                      createdAt={property.createdAt}
                      isAdmin={
                        user?.role_id?.role_name?.toUpperCase() === "ADMIN" ||
                        user?.role?.name?.toUpperCase() === "ADMIN"
                      }
                    />
                  </div>
                </div>
                
                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                    {property.basicInfo?.title || "Untitled Property"}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm font-medium mb-1">
                    <MapPin size={13} className="mr-1.5 text-blue-500/60" />
                    <span className="truncate">
                      {property.location?.city || "Location N/A"}
                    </span>
                  </div>
                  {property.specifications?.area?.totalArea && (
                    <div className="flex items-center text-gray-400 text-xs font-medium">
                      <Ruler size={12} className="mr-1.5 text-gray-400" />
                      <span>{property.specifications.area.totalArea} sq.ft</span>
                    </div>
                  )}
                </div>

                <div className="mb-6 flex items-center">
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2 flex items-center gap-1">
                    {property.isSold && property.soldPrice ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 line-through leading-none mb-1">
                          {formatPriceRange(
                            property.pricing?.sell?.minPrice || property.pricing?.rent?.minRent,
                            property.pricing?.sell?.maxPrice || property.pricing?.rent?.maxRent,
                            property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0
                          )}
                        </span>
                        <span className="text-xl font-bold text-gray-900 leading-none">
                          {formatIndianPrice(property.soldPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900 leading-none">
                        {formatPriceRange(
                          property.pricing?.sell?.minPrice || property.pricing?.rent?.minRent,
                          property.pricing?.sell?.maxPrice || property.pricing?.rent?.maxRent,
                          property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Management Actions */}
                <div className="mt-auto space-y-3 pt-5 border-t border-gray-50">
                  {/* Primary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      block
                      icon={<Eye size={16} />}
                      onClick={() => handleViewDetail(property)}
                      className="h-10 rounded-xl font-semibold border-gray-100 text-gray-600 hover:text-blue-600 hover:border-blue-600 bg-gray-50/50 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      View
                    </Button>
                    <Button
                      block
                      icon={<Edit size={16} />}
                      onClick={() => navigate(`/seller/add-property?edit=${property._id}`)}
                      className="h-10 rounded-xl font-semibold border-gray-100 text-gray-600 hover:text-orange-600 hover:border-orange-600 bg-gray-50/50 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                    >
                      Edit
                    </Button>
                  </div>

                  {/* Secondary/Promotion Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const request = marketingRequests.find(
                        (r) => r.property_id?._id === property._id,
                      );
                      const hasActiveRequest =
                        request &&
                        ["pending", "contacted"].includes(request.status);

                      return (
                        <Button
                          block
                          disabled={hasActiveRequest}
                          icon={hasActiveRequest ? <CheckCircle size={16} /> : <Sparkles size={16} />}
                          onClick={() => {
                            setSelectedProperty(property);
                            setIsMarketingModalOpen(true);
                          }}
                          className={`h-10 rounded-xl font-semibold border-none shadow-sm transition-all flex items-center justify-center gap-2 ${
                            hasActiveRequest 
                              ? "bg-indigo-50 text-indigo-400" 
                              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                          }`}
                        >
                          {hasActiveRequest ? "Promoted" : "Promote"}
                        </Button>
                      );
                    })()}
                    <Button
                      block
                      onClick={() => handleMarkAsSoldClick(property)}
                      className={`h-10 rounded-xl font-semibold border-none shadow-sm transition-all flex items-center justify-center gap-2 ${
                        property.isSold 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      }`}
                    >
                      {property.isSold ? "Available" : "Mark Sold"}
                    </Button>
                  </div>

                  {/* Delete Action */}
                  <Popconfirm
                    title="Delete Property"
                    description="This action cannot be undone. Delete this listing?"
                    onConfirm={() => handleDelete(property._id)}
                    okText="Delete"
                    cancelText="Keep"
                    okButtonProps={{ danger: true, className: "rounded-lg" }}
                    cancelButtonProps={{ className: "rounded-lg" }}
                  >
                    <Button
                      type="text"
                      block
                      icon={<Trash2 size={16} />}
                      className="h-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      Remove Listing
                    </Button>
                  </Popconfirm>
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
        centered
        style={{
          maxWidth: "1250px",
          padding: 0,
        }}
        closeIcon={null}
        className="property-reference-modal"
        styles={{
          content: {
            padding: 0,
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#fcfdfe",
          },
          body: {
            padding: 0,
            maxHeight: "85vh",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          },
        }}
      >
        {selectedProperty && (
          <div className="flex flex-col font-sans text-slate-900 pb-10">
            {/* 1. Header Navigation Bar */}
            <div className="flex justify-between items-center px-8 bg-white sticky top-0 z-50">
          
              {/* <div className="flex items-center gap-3 pr-12">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 leading-none mb-1">{user?.name || "Member"}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Verified Account</p>
                </div>
                <Avatar size={32} src={user?.avatar} icon={<Building size={16} />} className="bg-blue-50 text-blue-600 border border-blue-100" />
              </div> */}

              {/* Absolute Close Button at Top Right */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-all border border-gray-100 shadow-sm bg-white z-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. Title Section */}
            <div className="px-10 py-8 flex justify-between items-start">
              <div className="pl-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedProperty.basicInfo?.title || "Property"} <span className="text-slate-500 font-normal">in {selectedProperty.location?.locality || selectedProperty.location?.city || "Puducherry"}</span>
                </h1>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={16} />
                  <span className="text-sm">{selectedProperty.location?.city || "Puducherry"}</span>
                </div>
              </div>
            </div>

            {/* 3. Main Content Columns */}
            <div className="px-10 flex flex-col lg:flex-row gap-12">
              
              {/* Left Column: Media & Price */}
              <div className="w-full lg:w-[45%] space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] bg-gray-50">
                  {(() => {
                    const propertyImages = selectedProperty.media?.images || selectedProperty.images;
                    return propertyImages && propertyImages.length > 0 ? (
                      <Carousel autoplay className="h-full w-full">
                        {propertyImages.map((img, index) => (
                          <div key={index} className="h-full w-full aspect-[4/3] overflow-hidden">
                            <img
                              src={getImageUrl(typeof img === 'string' ? img : (img.image_url || img))}
                              alt="Property"
                              className="w-full h-full object-cover block"
                            />
                          </div>
                        ))}
                      </Carousel>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building size={64} className="text-slate-200" />
                      </div>
                    );
                  })()}

                  {/* Badges Overlay */}
                  <div className="absolute top-6 right-6 z-10">
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-xl shadow-lg">Active</span>
                  </div>
                  <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-10">
                    {selectedProperty.is_verified && (
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-lg">
                        <CheckCircle2 size={14} strokeWidth={2.5} /> Verified
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-6 right-6 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 shadow-lg">
                      <Calendar size={14} className="text-orange-500" />
                      <span className="text-[10px] font-bold text-slate-700 leading-none">Expiry: {new Date(selectedProperty.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pl-4">
                  <p className="text-slate-500 text-[10px] font-semibold">Pricing Strategy</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatPriceRange(
                      selectedProperty.pricing?.sell?.minPrice || selectedProperty.pricing?.rent?.minRent,
                      selectedProperty.pricing?.sell?.maxPrice || selectedProperty.pricing?.rent?.maxRent,
                      selectedProperty.pricing?.sell?.price || selectedProperty.pricing?.rent?.monthlyRent || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Tabs & Stats */}
              <div className="w-full lg:w-[55%] flex flex-col">
                <Tabs
                  defaultActiveKey="1"
                  className="reference-tabs flex-1"
                  items={[
                    {
                      key: "1",
                      label: <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold"> Basic Info</span>,
                      children: (
                        <div className="pt-4 space-y-6 animate-fadeIn">
                          {/* Stats Grid - Bordered table style like screenshot */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Row 1 */}
                            <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Property Type</p>
                                <p className="text-sm font-bold text-slate-800">{selectedProperty.basicInfo?.propertyType || "—"}</p>
                              </div>
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Bedrooms</p>
                                <p className="text-sm font-bold text-slate-800">{selectedProperty.specifications?.residential?.bedrooms ?? "—"}</p>
                              </div>
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Bathrooms</p>
                                <p className="text-sm font-bold text-slate-800">{selectedProperty.specifications?.residential?.bathrooms ?? "—"}</p>
                              </div>
                            </div>
                            {/* Row 2 */}
                            <div className="grid grid-cols-3 divide-x divide-gray-200">
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Views</p>
                                <p className="text-sm font-bold text-slate-800">{selectedProperty.view_count ?? "0"}</p>
                              </div>
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Area Size</p>
                                <p className="text-sm font-bold text-slate-800">
                                  {(() => {
                                    const area = selectedProperty.specifications?.area;
                                    if (area?.totalArea) return `${area.totalArea} sq.ft`;
                                    if (area?.minArea && area?.maxArea) return `${area.minArea} – ${area.maxArea} sq.ft`;
                                    if (area?.minArea) return `${area.minArea} sq.ft`;
                                    if (area?.maxArea) return `${area.maxArea} sq.ft`;
                                    return "N/A";
                                  })()}
                                </p>
                              </div>
                              <div className="px-5 py-4">
                                <p className="text-slate-400 text-xs font-medium mb-1">Price</p>
                                <p className="text-sm font-bold text-slate-800">
                                  {formatPriceRange(
                                    selectedProperty.pricing?.sell?.minPrice || selectedProperty.pricing?.rent?.minRent,
                                    selectedProperty.pricing?.sell?.maxPrice || selectedProperty.pricing?.rent?.maxRent,
                                    selectedProperty.pricing?.sell?.price || selectedProperty.pricing?.rent?.monthlyRent || 0
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <p className="text-slate-500 text-xs font-semibold mb-2">Description:</p>
                            <p className="text-slate-600 leading-relaxed text-sm">
                              {selectedProperty.basicInfo?.description || "No description provided."}
                            </p>
                            <div className="mt-4">
                              <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                                {selectedProperty.status || "Available"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      key: "2",
                      label: <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold">Amenities</span>,
                      children: (
                        <div className="pt-8 grid grid-cols-2 gap-4">
                          {selectedProperty.amenities?.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-3 border border-slate-100 p-4 rounded-xl">
                              <Zap size={14} className="text-blue-600" />
                              <span className="text-sm font-bold text-slate-700 uppercase">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      )
                    },
                    {
                      key: "3",
                      label: <span className="flex items-center gap-2 px-4 py-2 text-sm font-bold">Media Coverage</span>,
                      children: (
                        <div className="pt-8 grid grid-cols-3 gap-2">
                          {(selectedProperty.media?.images || []).map((img, i) => (
                             <img key={i} src={getImageUrl(img)} className="w-full aspect-square object-cover rounded-lg border border-gray-100" />
                          ))}
                        </div>
                      )
                    }
                  ]}
                />

                {/* Footer Buttons */}
                <div className="mt-auto pt-10 flex gap-4 justify-end lg:justify-start">
                   <Button 
                    icon={<Sparkles size={16} />} 
                    type="primary"
                    className="h-12 px-10 bg-blue-600 border-none rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200"
                    onClick={() => {
                      setSelectedProperty(selectedProperty);
                      setIsMarketingModalOpen(true);
                    }}
                  >
                    Promote Property
                  </Button>
                  <Button 
                    icon={<Layers size={16} />} 
                    className="h-12 px-10 border-gray-200 text-slate-500 rounded-lg font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all font-sans"
                    onClick={() => handleMarkAsSoldClick(selectedProperty)}
                  >
                    Mark as Sold Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyProperties;
