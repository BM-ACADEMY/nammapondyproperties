import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  ArrowRight,
  BedDouble,
  Bath,
  Square,
  User,
  Calendar,
  Home,
  X,
  Eye,
  Wind,
  Droplet,
  Zap,
  Layout,
  Layers,
  Compass,
  CheckCircle2,
  Lock,
  Wifi,
  Car,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";
import { recordPropertyView } from "../../../utils/propertyViewTracker";
import { formatIndianPrice, formatPriceRange } from "../../../utils/formatPrice";
import { formatNumber } from "../../../utils/formatNumber";

import Loader from "../../../components/Common/Loader";
import PhoneUpdateModal from "../../../components/Common/PhoneUpdateModal";
import { getImageUrl } from "../../../utils/imageUrl";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PropertyCard from "../components/PropertyCard";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PropertyDetails = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [moreProperties, setMoreProperties] = useState([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedEnquiryProperty, setSelectedEnquiryProperty] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      // Reset states at the start to fix stale image issue
      setLoading(true);
      setProperty(null);
      setMainImage("");
      setMoreProperties([]);

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-property-by-slug/${slug}`,
        );
        const propertyData = res.data;
        setProperty(propertyData);

        // Set dynamic meta title
        const title = propertyData.basicInfo?.title || "Property Details";
        const category = propertyData.basicInfo?.category || "For Sale";
        const locality = propertyData.location?.locality || "";
        const city = propertyData.location?.city || "Pondicherry";
        document.title = `${title} | ${category} in ${locality ? locality + ", " : ""}${city} | Namma Pondy Properties`;

        if (propertyData?.media?.images?.length > 0) {
          setMainImage(propertyData.media.featuredImage || propertyData.media.images[0]);
        }

        const relatedRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-recommended-properties/${propertyData._id}`,
        );
        if (Array.isArray(relatedRes.data)) {
          setMoreProperties(relatedRes.data);
        }

        const viewResult = await recordPropertyView(propertyData._id);
        if (viewResult && viewResult.success && !viewResult.alreadyViewed) {
          setProperty(prev => ({
            ...prev,
            view_count: viewResult.view_count || (prev?.view_count + 50)
          }));
        }
      } catch (error) {
        console.error("Error fetching property details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleWhatsAppClick = (e = null, clickedProp = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const targetProp = clickedProp || property;
    if (!targetProp || !targetProp.seller) {
      toast.error("Seller information missing");
      return;
    }
    if (!user) {
      toast.error("Please login to contact the seller");
      navigate("/login", { state: { from: location.pathname } });
    } else if (!user.phone) {
      setSelectedEnquiryProperty(targetProp);
      setShowPhoneModal(true);
    } else {
      submitEnquiry(user.name, user.email, user.phone, targetProp);
    }
  };

  const submitEnquiry = async (name, email, phone, targetProp = selectedEnquiryProperty || property) => {
    if (!targetProp || !targetProp.seller) return;
    setEnquiryLoading(true);

    const sellerPhone = targetProp.seller.phone || "919000000000";
    const locationStr =
      typeof targetProp.location === "string"
        ? targetProp.location
        : `${targetProp.location?.city || ""}, ${targetProp.location?.state || ""}`;
    const message = `Hi, I am interested in your property: ${targetProp.basicInfo?.title || "Untitled"} located at ${locationStr}. Please provide more details.`;
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/enquiries/create`, {
        property_id: targetProp._id,
        seller_id: targetProp.seller._id || targetProp.seller,
        message: message,
        name,
        email,
        phone,
      });
      toast.success("Enquiry recorded! Redirecting to WhatsApp...");
    } catch (error) {
      console.error("Enquiry Error:", error);
      toast.error("Redirecting to WhatsApp...");
    } finally {
      window.open(whatsappUrl, "_blank");
      setEnquiryLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!property)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        Property Not Found
      </div>
    );

  // Removed local getImageUrl as we use the one from utils

  const maskPhoneNumber = (phone) => {
    if (!phone) return "**********";
    const phoneStr = phone.toString();
    if (phoneStr.length < 10) return phoneStr;
    return phoneStr.substring(0, 5) + "*****";
  };

  return (
    <div className="bg-white min-h-screen py-8 font-sans text-gray-900">
      <div className="container mx-auto px-4 pt-19 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-[11px] md:text-xs text-blue-600 font-medium flex-wrap flex items-center gap-2 mb-4">
          <Link to="/" className="hover:text-blue-800">Home</Link>
          <span className="text-gray-400">›</span>
          <Link to="/properties" className="hover:text-blue-800">Property in {property.location?.city || "City"}</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500 truncate max-w-[200px] md:max-w-md">
            {property.basicInfo?.propertyType || "Property"} in {property.location?.locality || property.location?.city || "Unknown"} {(property.specifications?.plot?.plotLength || property.specifications?.plot?.plotWidth) && `${Number(property.specifications.plot.plotLength || 0) * Number(property.specifications.plot.plotWidth || 0)} Sq.ft.`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT COLUMN: Premium New Look */}
          <div className="lg:col-span-8 space-y-12">
            {/* <div className="space-y-4">

              <h1 className="text-3xl md:text-3xl font-bold capitalize tracking-tight text-gray-900 leading-tight">
                {property.basicInfo?.title || "Untitled Property"}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Eye size={16} className="text-blue-500" />
                  <span className="font-semibold text-gray-700">{formatNumber(property.view_count || 0)}</span>
                  <span className="text-gray-500">Views</span>
                </div>
              </div>

              <div className="flex items-center text-gray-500 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {typeof property.location === "string"
                  ? property.location
                  : `${property.location?.city || ""}, ${property.location?.state || ""}`}
              </div>

              <div className="pt-2">
                {property.isSold && property.soldPrice ? (
                  <>
                    <span className="text-xl text-gray-500 font-medium mr-2">
                      Sold Price
                    </span>
                    <span className="text-3xl font-bold text-red-600">
                      {formatIndianPrice(property.soldPrice)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl text-gray-500 font-medium mr-2">
                      {property.isSold ? "Price" : "Launch Price"}
                    </span>
                    <span className="text-3xl font-bold text-[#3a307f]">
                      {formatIndianPrice(property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0)}
                    </span>
                  </>
                )}
              </div>
            </div> */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              {/* LEFT SECTION */}
              <div className="space-y-4"> {/* Increased space-y to separate price row from views */}
                <div className="flex flex-wrap items-baseline gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    {property.isSold && property.soldPrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg md:text-xl text-gray-500 font-medium">Sold Price:</span>
                        <span className="text-red-600">{formatIndianPrice(property.soldPrice)}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg md:text-xl text-gray-500 font-medium">
                          {property.isSold ? "Price:" : "Price:"}
                        </span>
                        <span className="text-gray-900">
                          {formatPriceRange(
                            property.pricing?.sell?.minPrice || property.pricing?.rent?.minRent,
                            property.pricing?.sell?.maxPrice || property.pricing?.rent?.maxRent,
                            property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0
                          )}
                        </span>
                      </div>
                    )}
                  </h1>

                  <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">
                      {property.basicInfo?.propertyType || "Property"} for {property.basicInfo?.category === "Rent" ? "Rent" : "Sale"} in {property.location?.locality || property.location?.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Posted on {new Date(property.createdAt).toLocaleDateString()} | <span className="text-blue-600">{property.legal?.propertyStatus || "Ready to Move"}</span>
                </div>
                <div className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide border ${property.legal?.propertyStatus === "Ready to Move" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>


                  <div className="flex items-center gap-1.5 rounded-full border border-gray-100 w-fit">
                    <Eye size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{formatNumber(property.view_count || 0)}</span>
                    <span className="text-gray-500">Views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Image Gallery - Clean & Sharp */}
            <div className="space-y-4">
              <div className="relative h-[350px] md:h-[450px] bg-gray-100 rounded-xl overflow-hidden group">
                {property.isSold && (
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-red-600 shadow-lg text-white text-sm font-bold px-4 py-2 rounded-sm uppercase tracking-wider border border-white/20">
                      Sold Out
                    </span>
                  </div>
                )}
                <img
                  src={getImageUrl(mainImage)}
                  alt={property.basicInfo?.title || "Property"}
                  className={`w-full h-full object-cover transition-transform duration-700 ${property.isSold ? "grayscale-[0.8]" : ""}`}
                />
                <div className="absolute top-4 right-4 z-10">
                  <WishlistButton propertyId={property._id} />
                </div>
              </div>

              {/* Thumbnails */}
              {property.media?.images && property.media.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {property.media.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 cursor-pointer border-2 ${mainImage === img
                        ? "border-blue-600 opacity-100 shadow-md scale-[1.02]"
                        : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Key Information - Clean Style Grid */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Key Features:
              </h3>
              <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
                  {/* item */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <Layers size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                        Usage
                      </span>
                      <span className="text-[15px] font-medium text-gray-800 leading-tight">
                        {property.basicInfo?.usageType || "Residential"}
                      </span>
                    </div>
                  </div>
                  {/* item */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                        Locality
                      </span>
                      <span className="text-[15px] font-medium text-gray-800 leading-tight capitalize truncate max-w-[120px]">
                        {property.location?.locality || property.location?.city || "Pondicherry"}
                      </span>
                    </div>
                  </div>
                  {/* item — Area */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <Square size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                        {(property.specifications?.area?.minArea || property.specifications?.area?.maxArea) ? "Area Range" : "Total Area"}
                      </span>
                      <span className="text-[15px] font-medium text-gray-800 leading-tight whitespace-nowrap">
                        {(() => {
                          const minA = property.specifications?.area?.minArea;
                          const maxA = property.specifications?.area?.maxArea;
                          const total = property.specifications?.area?.totalArea;
                          if (minA && maxA) return `${Number(minA).toLocaleString()} - ${Number(maxA).toLocaleString()} sqft`;
                          if (minA) return `${Number(minA).toLocaleString()}+ sqft`;
                          if (total) return `${total} sqft`;
                          return "N/A";
                        })()}
                      </span>
                    </div>
                  </div>
                  {/* item */}
                  {property.specifications?.area?.builtupArea && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Layout size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Built-up
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight whitespace-nowrap">
                          {property.specifications.area.builtupArea} sqft
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.specifications?.area?.carpetArea && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Layers size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Carpet Area
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight whitespace-nowrap">
                          {property.specifications.area.carpetArea} sqft
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.specifications?.floor?.totalFloor && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Layers size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Total Floors
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.specifications.floor.totalFloor}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.specifications?.floor?.propertyOnFloor && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Layers size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          On Floor
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.specifications.floor.propertyOnFloor}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {(property.specifications?.facing || property.specifications?.residential?.facing) && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Compass size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Facing
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight capitalize">
                          {property.specifications.facing || property.specifications.residential.facing}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.specifications?.residential?.furnishing && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Layout size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Furnishing
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.specifications.residential.furnishing}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.legal?.propertyStatus === "Ready to Move" && property.legal?.ageOfProperty && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Age of Property
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.legal.ageOfProperty}
                        </span>
                      </div>
                    </div>
                  )}

                  {property.basicInfo?.category && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Type
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.basicInfo.category}
                        </span>
                      </div>
                    </div>
                  )}
                  {property.basicInfo?.propertyType && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Property Type
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.basicInfo.propertyType}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.legal?.propertyStatus === "Under Construction" && property.legal?.expectedCompletionYear && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                          Possession
                        </span>
                        <span className="text-[15px] font-medium text-gray-800 leading-tight">
                          {property.legal.expectedCompletionYear}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* item */}
                  {property.legal?.propertyStatus && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-500">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5 whitespace-nowrap">
                          Status
                        </span>
                        <span className="text-[15px] font-semibold text-blue-600 leading-tight">
                          {property.legal.propertyStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 4. About the Project */}
            <h3 className="text-xl font-bold text-gray-600 flex items-center gap-2 mb-6">
               Property Overview
            </h3>
            <div className="space-y-6">
              <div className="relative">
                <div
                  className={`prose prose-lg max-w-none text-gray-600 leading-relaxed transition-all duration-500 overflow-hidden ${!isDescriptionExpanded ? 'max-h-[160px]' : 'max-h-[2000px]'}`}
                >
                  <p className="whitespace-pre-line text-slate-700">
                    {property.basicInfo?.description || "No description provided."}
                  </p>
                </div>

                {!isDescriptionExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>

              {!isDescriptionExpanded && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setIsDescriptionExpanded(true)}
                    className="px-10 py-2.5 rounded-full border border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Read More
                  </button>
                </div>
              )}
            </div>

            {/* Detailed Specifications Section */}
            {(property.specifications?.residential || property.specifications?.commercial || property.specifications?.plot) && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-600 flex items-center gap-2">
                  Property Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Residential Specifics */}
                  {property.specifications?.residential && (property.specifications.residential.bedrooms > 0 || property.specifications.residential.bathrooms > 0 || property.specifications.residential.balconies > 0 || property.specifications.residential.hall !== undefined || property.specifications.residential.kitchens !== undefined || property.specifications.residential.facing) && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <BedDouble size={18} className="text-gray-400" /> Residential Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {property.specifications.residential.bedrooms > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <BedDouble size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Bedrooms
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.residential.bedrooms}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.residential.bathrooms > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Bath size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Bathrooms
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.residential.bathrooms}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.residential.balconies > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Wind size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Balconies
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.residential.balconies}
                              </span>
                            </div>
                          </div>
                        )}
                        {(property.specifications.residential.hall !== undefined || property.specifications.residential.kitchens !== undefined) && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Home size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Hall / Kitchen
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {(property.specifications.residential.hall ?? 0)}H / {(property.specifications.residential.kitchens ?? 0)}K
                              </span>
                            </div>
                          </div>
                        )}
                        {(property.specifications.facing || property.specifications.residential.facing) && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Compass size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Facing
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.facing || property.specifications.residential.facing}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Commercial Specifics */}
                  {property.specifications?.commercial && (property.specifications.commercial.cabins || property.specifications.commercial.meetingRooms || property.specifications.commercial.workstations || property.specifications.commercial.pantry || property.specifications.commercial.receptionArea || property.specifications.commercial.suitableFor) && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Layers size={18} className="text-gray-400" /> Commercial Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {property.specifications.commercial.cabins !== undefined && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Layers size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Cabins
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.commercial.cabins}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.commercial.meetingRooms !== undefined && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Layers size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Meeting Rooms
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.commercial.meetingRooms}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.commercial.workstations !== undefined && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Layers size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Workstations
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.commercial.workstations}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.commercial.pantry && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Pantry
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                Available
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.commercial.receptionArea && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Reception
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                Available
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.commercial.suitableFor && (
                          <div className="flex items-center gap-4 sm:col-span-2">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Layout size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Suitable For
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.commercial.suitableFor}
                              </span>
                            </div>
                          </div>
                        )}
                        {(property.specifications.facing || property.specifications.residential?.facing) && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Compass size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Facing
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.facing || property.specifications.residential?.facing}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plot Specifics */}
                  {property.specifications?.plot && (property.specifications.plot.plotLength || property.specifications.plot.plotWidth || property.specifications.plot.roadWidth || property.specifications.plot.cornerPlot || property.specifications.plot.gatedCommunity) && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Square size={18} className="text-gray-400" /> Plot Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {(property.specifications.plot.plotLength || property.specifications.plot.plotWidth) && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Square size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Dimensions
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.plot.plotLength || 'L'} x {property.specifications.plot.plotWidth || 'W'} ft
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.plot.roadWidth > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Layout size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Road Width
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.plot.roadWidth} ft
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.plot.cornerPlot && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Corner Plot
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                Yes
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.plot.gatedCommunity && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Gated Community
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                Yes
                              </span>
                            </div>
                          </div>
                        )}
                        {(property.specifications.facing || property.specifications.residential?.facing) && (
                          <div className="flex items-center gap-4 sm:col-span-2">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Compass size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Facing
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.facing || property.specifications.residential?.facing}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Utilities */}
                  {property.specifications?.utilities && (property.specifications.utilities.waterSupply || property.specifications.utilities.powerBackup) && (
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                      <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Zap size={18} className="text-gray-400" /> Utilities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        {property.specifications.utilities.waterSupply && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Droplet size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Water Supply
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                {property.specifications.utilities.waterSupply}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.specifications.utilities.powerBackup && (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                              <Zap size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                Power Backup
                              </span>
                              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                                Available
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Amenities / Features - Pills Style */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-600 mb-6">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium hover:border-black transition-colors border border-transparent"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Location Map */}
            {property?.location?.coordinates?.lat && property?.location?.coordinates?.lng && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-600">Location</h3>
                <div className="bg-blue-50 rounded-2xl p-2 border border-blue-100">
                  <div className="h-[350px] w-full rounded-xl overflow-hidden relative">
                    <MapContainer
                      center={[
                        property.location.coordinates.lat,
                        property.location.coordinates.lng,
                      ]}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[
                          property.location.coordinates.lat,
                          property.location.coordinates.lng,
                        ]}
                      >
                        <Popup>
                          {property.basicInfo?.title || "Untitled"} <br /> {property.location.city}
                        </Popup>
                      </Marker>
                    </MapContainer>

                    <div className="absolute bottom-4 left-4 z-[999]">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${property.location.coordinates.lat},${property.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-gray-900 flex items-center hover:bg-gray-50 transition"
                      >
                        Open in Google Maps{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Preserved Card Style) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              {/* Contact Card */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {property.seller?.profile_image ? (
                      <img
                        src={getImageUrl(property.seller.profile_image)}
                        alt="Seller"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-[#174685] uppercase font-extrabold tracking-widest mb-1 bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                      {property.businessType?.name || "LISTED BY"}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {property.seller?.name || "Seller"}
                    </h3>
                    <div className="text-sm font-semibold text-gray-500">
                      {maskPhoneNumber(property.seller?.phone)}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="text-sm text-gray-600 text-center px-4">
                    Interested in this property? <br /> Connect directly with
                    the seller.
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppClick}
                  disabled={enquiryLoading || property.isSold}
                  className={`w-full font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg ${property.isSold
                    ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
                    : "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-green-100"
                    }`}
                >
                  {property.isSold ? (
                    "Property Sold Out"
                  ) : enquiryLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Enquiry
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Properties */}
        {moreProperties.length > 0 && (
          <div className="mt-24">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-[28px] font-bold text-[#1E293B]">
                  Recommended in <span className="text-[#166aa8] font-semibold">{property.location?.locality || property.location?.city || "this area"}</span>
                </h2>
              </div>

              {/* Navigation Buttons for Desktop */}
              <div className="hidden md:flex items-center gap-3 mb-8">
                <button className="rec-prev w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all disabled:opacity-30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="rec-next w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all disabled:opacity-30">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: ".rec-prev",
                  nextEl: ".rec-next",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                  el: ".rec-pagination"
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                  1280: { slidesPerView: 4, spaceBetween: 24 },
                }}
                className="recommended-swiper !pb-12"
              >
                {moreProperties.map((prop) => (
                  <SwiperSlide key={prop._id}>
                    <div className="h-full">
                      <PropertyCard
                        property={prop}
                        onWhatsAppClick={handleWhatsAppClick}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Mobile/Tablet Pagination Container */}
              {/* <div className="rec-pagination flex justify-center mt-4"></div> */}
            </div>
          </div>
        )}
      </div>
      <PhoneUpdateModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={(updatedPhone) => {
          if (user) {
            submitEnquiry(user.name, user.email, updatedPhone, selectedEnquiryProperty || property);
          }
        }}
      />
    </div >
  );
};

export default PropertyDetails;
