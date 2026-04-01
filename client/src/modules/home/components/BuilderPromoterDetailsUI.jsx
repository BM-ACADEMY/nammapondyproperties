import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Layout,
  Layers,
  Square,
  Compass,
  Zap,
  Droplet,
  ChevronRight,
  ChevronLeft,
  Eye,
  Phone,
  Info,
  Gift,
  ShieldCheck,
  BedDouble,
  Bath,
  Wind,
  Download,
  Home,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../../utils/imageUrl";
import {
  formatIndianPrice,
  formatPriceRange,
} from "../../../utils/formatPrice";
import { formatNumber } from "../../../utils/formatNumber";
import WishlistButton from "../../../components/Common/WishlistButton";

const BuilderPromoterDetailsUI = ({
  property,
  mainImage,
  setMainImage,
  enquiryLoading,
  handleWhatsAppClick,
  maskPhoneNumber,
  getVideoEmbedUrl,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const scrollRefs = {
    overview: useRef(null),
    about: useRef(null),
    location: useRef(null),
    plans: useRef(null),
    amenities: useRef(null),
    highlights: useRef(null),
    gallery: useRef(null),
  };

  const hasFloorPlan = property.floorPlan || property.media?.floorPlan;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "about", label: "About Project" },
    { id: "location", label: "Location" },
    ...(hasFloorPlan ? [{ id: "plans", label: "Plans" }] : []),
    { id: "amenities", label: "Amenities" },
    { id: "highlights", label: "Highlights" },
    { id: "gallery", label: "Gallery" },
  ];

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = scrollRefs[id].current;
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-slate-50 pt-20 min-h-screen pb-20 font-sans">
      {/* BREADCRUMBS */}
      <div className="bg-white border-b border-gray-100 pt-6 pb-4">
        <div className="container mx-auto max-w-7xl px-4">
          <nav className="flex text-xs font-medium text-gray-500 items-center gap-2">
            <Link to="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              to={`/properties?category=${property.basicInfo?.category}`}
              className="hover:text-red-600 transition-colors"
            >
              {property.basicInfo?.category === "Rent" ? "Rent" : "Buy"}
            </Link>
            <ChevronRight size={12} />
            <Link
              to={`/properties?type=${property.basicInfo?.propertyType}`}
              className="hover:text-red-600 transition-colors"
            >
              {property.basicInfo?.propertyType}
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-bold truncate max-w-50">
              {property.basicInfo?.title}
            </span>
          </nav>
        </div>
      </div>
      {/* 1. HERO BANNER */}
      <section className="relative h-100 md:h-137.5 w-full overflow-hidden">
        <img
          src={getImageUrl(property.media?.featuredImage || mainImage)}
          alt={property.basicInfo?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 mb-10">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-4 text-white max-w-3xl">
                <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded">
                  {property.basicInfo?.category === "Rent"
                    ? "For Rent"
                    : "For Sale"}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  {property.basicInfo?.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                  <MapPin size={18} className="text-red-500" />
                  {property.location?.locality}, {property.location?.city}{" "}
                  {property.location?.pincode &&
                    `- ${property.location.pincode}`}
                  {property.basicInfo?.approvalType && (
                    <span className="ml-4 px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-xs font-bold text-green-400 capitalize">
                      {property.basicInfo.approvalType} Approved
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right text-white">
                <div className="text-xs text-white/70 font-medium uppercase tracking-widest mb-1">
                  Starting from
                </div>
                <div className="text-2xl md:text-4xl font-bold text-white">
                  {formatIndianPrice(
                    property.pricing?.sell?.price ||
                      property.pricing?.sell?.minPrice ||
                      0,
                  )}
                </div>
                <div className="text-xs text-white/60">Onwards</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-10 flex gap-3">
          <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-full text-white transition-all shadow-lg border border-white/10">
            <WishlistButton propertyId={property._id} showLabel={false} />
          </button>
        </div>
      </section>

      {/* 2. STICKY TABS */}
      <nav className="sticky top-19 z-40 bg-white border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-hide pt-19">
        <div className="container mx-auto max-w-7xl px-4 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`py-5 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-12">
            {/* OVERVIEW SECTION */}
            <div
              ref={scrollRefs.overview}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {property.basicInfo?.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-50">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <MapPin size={16} className="text-red-500" />
                  <span className="font-semibold text-gray-800">
                    {property.location?.city}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="font-semibold text-gray-800">
                    Verified Listing
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-1">
                    Configuration
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {property.basicInfo?.propertyType}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {property.basicInfo?.usageType}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">
                    Total Area
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {property.specifications?.area?.totalArea ||
                      property.specifications?.area?.minArea}{" "}
                    sq.ft
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Ready to Move
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">
                    Price
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatIndianPrice(
                      property.pricing?.sell?.price ||
                        property.pricing?.sell?.minPrice ||
                        0,
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Starting Price
                  </div>
                </div>
              </div>

            </div>

            {/* ABOUT PROJECT */}
            <div ref={scrollRefs.about} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                About Project
              </h3>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
                  {property.basicInfo?.description ||
                    "No project overview provided."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Launch Date
                    </div>
                    <div className="font-bold text-gray-800">
                      {new Date(property.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" },
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Status
                    </div>
                    <div className="font-bold text-gray-800">
                      {property.legal?.propertyStatus || "Active"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Possession
                    </div>
                    <div className="font-bold text-gray-800">
                      {property.legal?.expectedCompletionYear || "Immediate"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Locality
                    </div>
                    <div className="font-bold text-gray-800 truncate">
                      {property.location?.locality}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Total Units
                    </div>
                    <div className="font-bold text-gray-800">25+ Units</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      Project Size
                    </div>
                    <div className="font-bold text-gray-800">5 Acres</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div ref={scrollRefs.location} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Location
                </h3>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-[400px] relative">
                  {property.location?.coordinates?.lat && (
                    <MapContainer
                      center={[
                        property.location.coordinates.lat,
                        property.location.coordinates.lng,
                      ]}
                      zoom={15}
                      className="h-full w-full z-10"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          property.location.coordinates.lat,
                          property.location.coordinates.lng,
                        ]}
                      >
                        <Popup>{property.basicInfo?.title}</Popup>
                      </Marker>
                    </MapContainer>
                  )}

                  {/* <div className="absolute top-4 left-4 z-20 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 max-w-62.5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="text-red-500" size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight mb-1">
                          {property.basicInfo?.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {property.location?.addressLine1},{" "}
                          {property.location?.locality}
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* DETAILED SPECIFICATIONS SECTION */}
            {(property.specifications?.residential ||
              property.specifications?.commercial ||
              property.specifications?.plot ||
              property.specifications?.utilities) && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Project Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Residential Specifics */}
                  {property.specifications?.residential &&
                    (property.specifications.residential.bedrooms > 0 ||
                      property.specifications.residential.bathrooms > 0 ||
                      property.specifications.residential.balconies > 0 ||
                      property.specifications.residential.hall !== undefined ||
                      property.specifications.residential.kitchens !== undefined ||
                      property.specifications.residential.facing) && (
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                          <BedDouble size={18} className="text-red-500" />{" "}
                          Residential Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                          {property.specifications.residential.bedrooms > 0 && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <BedDouble size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Bedrooms
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.residential.bedrooms}
                                </span>
                              </div>
                            </div>
                          )}
                          {property.specifications.residential.bathrooms > 0 && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Bath size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Bathrooms
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.residential.bathrooms}
                                </span>
                              </div>
                            </div>
                          )}
                          {property.specifications.residential.balconies > 0 && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Wind size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Balconies
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.residential.balconies}
                                </span>
                              </div>
                            </div>
                          )}
                          {(property.specifications.residential.hall !== undefined ||
                            property.specifications.residential.kitchens !== undefined) && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Home size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Hall / Kitchen
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.residential.hall ?? 0}H /{" "}
                                  {property.specifications.residential.kitchens ?? 0}K
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Commercial Specifics */}
                  {property.specifications?.commercial &&
                    (property.specifications.commercial.cabins ||
                      property.specifications.commercial.meetingRooms ||
                      property.specifications.commercial.workstations ||
                      property.specifications.commercial.suitableFor) && (
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                          <Layers size={18} className="text-red-500" /> Commercial Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                          {property.specifications.commercial.cabins !== undefined && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Layers size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Cabins
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.commercial.cabins}
                                </span>
                              </div>
                            </div>
                          )}
                          {property.specifications.commercial.suitableFor && (
                            <div className="flex items-center gap-4 sm:col-span-2">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Layout size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Suitable For
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.commercial.suitableFor}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Plot Specifics */}
                  {property.specifications?.plot &&
                    (property.specifications.plot.plotLength ||
                      property.specifications.plot.plotWidth ||
                      property.specifications.plot.roadWidth ||
                      property.specifications.plot.cornerPlot) && (
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                          <Square size={18} className="text-red-500" /> Land Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                          {(property.specifications.plot.plotLength ||
                            property.specifications.plot.plotWidth) && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Square size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Dimensions
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.plot.plotLength || "L"} x{" "}
                                  {property.specifications.plot.plotWidth || "W"} ft
                                </span>
                              </div>
                            </div>
                          )}
                          {property.specifications.plot.roadWidth > 0 && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Layout size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Road Width
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.plot.roadWidth} ft
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Utilities */}
                  {property.specifications?.utilities &&
                    (property.specifications.utilities.waterSupply ||
                      property.specifications.utilities.powerBackup) && (
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                          <Zap size={18} className="text-red-500" /> Essential Utilities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                          {property.specifications.utilities.waterSupply && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Droplet size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Water Supply
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.utilities.waterSupply}
                                </span>
                              </div>
                            </div>
                          )}
                          {property.specifications.utilities.powerBackup && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <Zap size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                  Power Backup
                                </span>
                                <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                  {property.specifications.utilities.powerBackup}
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

            {/* AMENITIES */}
            <div ref={scrollRefs.amenities} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Amenities</h3>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {property.amenities?.length > 0 ? (
                    property.amenities.map((amenity, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2 group hover:bg-red-50 hover:border-red-100 transition-all"
                      >
                        <CheckCircle2 size={14} className="text-green-500 group-hover:text-red-500" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-red-700">
                          {amenity}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Amenities not specified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ESSENTIAL UTILITIES */}
            <div ref={scrollRefs.highlights} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Essential Utilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.specifications?.utilities?.waterSupply && (
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                      <Droplet size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Water Supply
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {property.specifications.utilities.waterSupply}
                      </span>
                    </div>
                  </div>
                )}
                {property.specifications?.utilities?.powerBackup && (
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Power Backup
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {property.specifications.utilities.powerBackup}
                      </span>
                    </div>
                  </div>
                )}
                {/* <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Approval
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {property.basicInfo?.approvalType || "Verified"}
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                    <Home size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {property.legal?.propertyStatus || "Ready to Move"}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* GALLERY */}
            <div ref={scrollRefs.gallery} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Gallery</h3>
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative group/gallery">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation={{
                    nextEl: ".gal-next",
                    prevEl: ".gal-prev",
                  }}
                  pagination={{ clickable: true }}
                  className="rounded-2xl h-[450px]"
                >
                  {property.media?.images?.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={getImageUrl(img)}
                        className="w-full h-full object-cover"
                        alt="Gallery"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button className="gal-prev absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-900 shadow-xl opacity-0 group-hover/gallery:opacity-100 transition-all active:scale-90">
                  <ChevronLeft size={24} />
                </button>
                <button className="gal-next absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-900 shadow-xl opacity-0 group-hover/gallery:opacity-100 transition-all active:scale-90">
                  <ChevronRight size={24} />
                </button>

                <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                  {property.media?.images?.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(img)}
                      className="w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-red-500 transition-all"
                    >
                      <img
                        src={getImageUrl(img)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR: Simplified Seller Info */}
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
                    <div className="text-[10px] text-[#174685] uppercase font-bold tracking-widest mb-1 bg-blue-50 inline-block px-2 py-0.5 rounded-md">
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
                  className={`w-full font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg ${
                    property.isSold
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
      </div>
    </div>
  );
};

export default BuilderPromoterDetailsUI;
