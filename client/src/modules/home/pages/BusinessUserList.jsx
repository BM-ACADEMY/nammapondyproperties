import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  User,
  ArrowRight,
  Building2,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getImageUrl } from "@/utils/imageUrl";
import HorizontalPropertyCard from "@/modules/home/components/HorizontalPropertyCard";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import PhoneUpdateModal from "@/components/Common/PhoneUpdateModal";

const BusinessUserList = () => {
  const { businessTypeId } = useParams();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerProperties, setSellerProperties] = useState([]);
  const [businessType, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const { user, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fontLinkId = "google-font-poppins";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      if (!businessTypeId) return;
      setLoading(true);
      try {
        const [typeRes, sellersRes] = await Promise.all([
          axios.get(`${API}/business-types/${businessTypeId}`),
          axios.get(`${API}/users/sellers-by-business-type/${businessTypeId}`),
        ]);
        const bType = typeRes.data;
        setBusinessType(bType);
        setSellers(sellersRes.data);

        // Check if this is a builder/promoter type
        const isBuilder =
          bType?.name?.toLowerCase().includes("builder") ||
          bType?.name?.toLowerCase().includes("promoter");

        // Only auto-select if NOT a builder type
        if (sellersRes.data.length > 0 && !isBuilder) {
          setSelectedSeller(sellersRes.data[0]);
        } else {
          setSelectedSeller(null);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [businessTypeId, API]);

  useEffect(() => {
    const fetchSellerProperties = async () => {
      // For non-builder types, selectedSeller is always set if sellers exist
      // For builder types, it's null until one is clicked
      if (!selectedSeller || !businessTypeId) {
        setSellerProperties([]);
        return;
      }
      setPropertiesLoading(true);
      try {
        const res = await axios.get(
          `${API}/properties/fetch-all-property?seller_id=${selectedSeller._id}&businessType=${businessTypeId}`,
        );
        setSellerProperties(res.data.properties || []);
      } catch (error) {
        console.error("Error fetching seller properties:", error);
      } finally {
        setPropertiesLoading(false);
      }
    };
    fetchSellerProperties();
  }, [selectedSeller, businessTypeId, API]);

  // Close drawer when screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleWhatsAppClick = (e, targetUser, property = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!targetUser) return;

    if (user) {
      if (!user.phone) {
        setSelectedProperty(property);
        // We set selectedSeller to targetUser temporarily if needed,
        // but submitEnquiry handles it
        setShowPhoneModal(true);
      } else {
        submitEnquiry(targetUser, property, user.name, user.email, user.phone);
      }
      setLoginModalOpen(true);
    }
  };

  const submitEnquiry = async (targetUser, property, name, email, phone) => {
    // Normalise phone: strip leading +, 0, or 91 country code then prepend 91
    const rawPhone = (targetUser.phone || "").toString().replace(/\D/g, "");
    const sellerPhone =
      rawPhone.length === 10
        ? `91${rawPhone}`
        : rawPhone.length === 12 && rawPhone.startsWith("91")
          ? rawPhone
          : rawPhone || "919000000000";

    const message = property
      ? `Hi, I am interested in your property: ${property.basicInfo?.title || "Untitled"} located at ${typeof property.location === "string" ? property.location : property.location?.city || "Unknown"}. Please provide more details.`
      : `Hi ${targetUser.name}, I'm interested in your property listings on Namma Pondy.`;

    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

    setEnquiryLoading(true);
    try {
      await api.post("/enquiries/create", {
        property_id: property?._id,
        seller_id: targetUser._id,
        message: message,
        name,
        email,
        phone,
      });
    } catch (error) {
      console.error("Enquiry Error:", error);
    } finally {
      window.open(whatsappUrl, "_blank");
      setEnquiryLoading(false);
    }
  };

  const isBuilderType =
    businessType?.name?.toLowerCase().includes("builder") ||
    businessType?.name?.toLowerCase().includes("promoter");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#174685]"></div>
      </div>
    );
  }

  // Shared sellers list content
  const maskPhoneNumber = (phone) => {
    if (!phone) return "**********";
    const phoneStr = phone.toString();
    if (phoneStr.length < 10) return phoneStr;
    return phoneStr.substring(0, 5) + "*****";
  };

  const SellersList = ({ onSelect, compact = false }) => (
    <div className="overflow-y-auto">
      {sellers.map((user) => {
        const isActive = selectedSeller?._id === user._id;
        return (
          <div
            key={user._id}
            onClick={() => {
              setSelectedSeller(user);
              onSelect?.();
            }}
            className={`group flex items-center cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-0
              ${compact ? "gap-3 px-4 py-3" : "gap-4 px-5 py-4"}
              ${
                isActive
                  ? "bg-[#174685]/8"
                  : "bg-white hover:bg-slate-50 border-l-[3px] border-l-transparent"
              }`}
          >
            {/* Avatar */}
            <div
              className={`relative shrink-0 ${compact ? "w-12 h-12" : "w-16 h-16"}`}
            >
              <div
                className={`overflow-hidden transition-all duration-200 absolute top-1 left-1
                ${compact ? "w-10 h-10 rounded-full" : "w-14 h-14 rounded-xl"}
                `}
              >
                {user.profile_image ? (
                  <img
                    src={getImageUrl(user.profile_image)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center font-bold
                    ${compact ? "text-sm" : "text-xl"}
                    ${isActive ? "bg-[#174685] text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Green online dot */}
              {/* <span className={`absolute border-2 border-white rounded-full bg-green-400 z-10
                ${compact ? "bottom-0.5 right-0.5 w-2.5 h-2.5" : "bottom-1 right-1 w-3 h-3"}`}></span> */}
              {/* Active check badge */}
              {isActive && (
                <div
                  className={`absolute bg-[#174685] rounded-full flex items-center justify-center border-2 border-white z-10
                  ${compact ? "-top-0.5 -left-0.5 w-4 h-4" : "-top-0.5 -left-0.5 w-5 h-5"}`}
                >
                  <svg
                    width={compact ? 8 : 9}
                    height={compact ? 8 : 9}
                    viewBox="0 0 10 8"
                    fill="none"
                  >
                    <path
                      d="M1 4L3.5 7L9 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4
                className={`truncate leading-tight transition-colors
                ${compact ? "text-[13px]" : "text-[14px]"}
                ${isActive ? "text-[#174685] font-bold" : "text-slate-800 font-semibold group-hover:text-[#174685]"}`}
              >
                {user.name}
              </h4>
              {!compact && (
                <p className="text-[11px] text-slate-400 capitalize mt-0.5 truncate">
                  {businessType?.name || "Professional"}
                </p>
              )}
              <div className="text-[11px] text-[#174685] font-bold mt-1">
                {maskPhoneNumber(user.phone)}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight
              className={`shrink-0 transition-all duration-200
              ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}
              ${isActive ? "text-[#174685]" : "text-slate-200 group-hover:text-slate-400"}`}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen pt-30 bg-gray-50 font-['Poppins',_sans-serif] pb-20 pt-8 relative overflow-x-hidden">
      {/* ─── MOBILE: Floating side tab button ─── */}
      {sellers.length > 0 && !isBuilderType && (
        <div className="lg:hidden fixed left-0 top-[120px] z-[400]">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-2 bg-[#174685] text-white py-4 px-2.5 rounded-r-2xl shadow-xl active:scale-95 transition-transform"
          >
            <Users className="w-5 h-5" />
            <span className="w-px h-5 bg-white/30 block" />
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {sellers.length}
            </span>
          </button>
        </div>
      )}

      {/* ─── MOBILE: Slide-in Drawer ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[450] lg:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-[460] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    {businessType?.name || "Professional"}s
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sellers.length} verified professionals
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sellers List */}
              <div className="flex-1 overflow-y-auto">
                <SellersList compact onSelect={() => setIsDrawerOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {sellers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#174685]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No sellers found
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              There are currently no sellers who have posted properties with
              this business type.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* ─── DESKTOP: Left Sidebar ─── */}
            {!isBuilderType && (
              <div className="hidden lg:block lg:w-72 xl:w-80 h-fit sticky top-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                      {businessType?.name || "Professional"}s
                    </h3>
                  </div>
                  <SellersList />
                </div>
              </div>
            )}

            {/* ─── Profile Grid / Properties ─── */}
            <div className="flex-1 min-h-[600px]">
              {isBuilderType && !selectedSeller ? (
                /* ─── Builder Profile Grid ─── */
                <div>
                  <div className="mb-10">
                    <h1 className="text-2xl font-bold text-[#1e293b]">
                      Verified {businessType?.name}s
                    </h1>
                    <p className="text-slate-500 mt-1">
                      Select a professional to view their exclusive property
                      listings.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sellers.map((user) => (
                      <motion.div
                        key={user._id}
                        onClick={() => setSelectedSeller(user)}
                        className="flex flex-col sm:flex-row bg-white rounded-[24px] shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer hover:shadow-lg hover:border-slate-200 transition-all group overflow-hidden h-auto sm:h-[220px] relative"
                      >
                        {/* Company Logo Badge Top Right */}
                        {user.builderProfile?.companyLogo && (
                          <div className="absolute top-0 right-0 w-[90px] h-20 lg:w-[110px] lg:h-24 bg-[#F8FAFC] flex flex-col items-center justify-center z-10 rounded-bl-[20px] border-l border-b border-slate-100 p-2">
                            <img 
                              src={getImageUrl(user.builderProfile.companyLogo)} 
                              className="max-h-full max-w-full object-contain" 
                              alt="company logo" 
                            />
                          </div>
                        )}

                        {/* Left Section: Profile Photo */}
                        <div className="w-full sm:w-[220px] h-64 sm:h-full shrink-0 overflow-hidden relative border-r border-slate-50">
                          {user.profile_image ? (
                            <img
                              src={getImageUrl(user.profile_image)}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-[#174685] text-6xl font-extrabold uppercase">
                              {user.name?.charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent sm:hidden" />
                        </div>

                        {/* Right Section: Info */}
                        <div className="flex-1 p-6 sm:p-7 pr-12 lg:pr-[140px] flex flex-col justify-center min-w-0">
                          {/* Name and Verified */}
                          <div className="flex flex-col gap-2 mb-5">
                            <h3 className="text-[22px] lg:text-2xl font-bold text-slate-800 truncate leading-none">
                              {user.name}
                            </h3>
                            {(user.badgeVerified ||
                              user.role_id?.role_name === "admin") && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-[8px] w-fit">
                                <img
                                  src="/Logo/badge.png"
                                  alt="Verified"
                                  className="w-[15px] h-[15px] object-contain"
                                />
                                <span className="text-[12px] font-black uppercase tracking-widest leading-none text-[#2E7D32] mt-0.5">
                                  Verified
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom: Type and Exp Pill */}
                          <div className="flex flex-wrap gap-2">
                            <div className="inline-block bg-[#F3E8FF] text-[#6B21A8] px-3 py-1.5 rounded-xl text-[13px] font-semibold w-fit truncate">
                              {businessType?.name || "Professional"}
                            </div>
                            {user.builderProfile?.experienceYears && (
                              <div className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-[13px] font-semibold w-fit border border-amber-100">
                                {user.builderProfile.experienceYears} Yrs Experience
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ─── Properties View ─── */
                <>
                  {isBuilderType ? (
                    <div className="space-y-6 mb-10">
                      <div className="mb-6">
                        <button
                          onClick={() => setSelectedSeller(null)}
                          className="inline-flex items-center gap-2.5 text-slate-500 hover:text-[#174685] transition-all group lg:pl-0"
                        >
                          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-[#174685] group-hover:border-[#174685] group-hover:text-white transition-all duration-300">
                            <ChevronRight className="w-5 h-5 rotate-180" />
                          </div>
                          <span className="text-sm font-bold tracking-tight">
                            Back to Professionals List
                          </span>
                        </button>
                      </div>
                      {/* ─── Main Header Card ─── */}
                      <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#174685]/[0.02] rounded-bl-full -mr-32 -mt-32 transition-all duration-700 group-hover:bg-[#174685]/[0.05]" />

                        <div className="relative">
                          {/* Left Section: Professional Bio */}
                          <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-8 lg:gap-10">
                            {/* Profile Image Container */}
                            <div className="relative shrink-0">
                              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-[8px] border-[#174685]/5 p-1.5 bg-white shadow-xl relative z-10 overflow-hidden">
                                {selectedSeller?.profile_image ? (
                                  <img
                                    src={getImageUrl(
                                      selectedSeller.profile_image,
                                    )}
                                    alt={selectedSeller?.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[#174685] text-5xl font-bold rounded-full">
                                    {selectedSeller?.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              {/* Verified Badge Overlay */}
                              {(selectedSeller?.badgeVerified ||
                                selectedSeller?.role_id?.role_name ===
                                  "admin") && (
                                <div className="absolute bottom-2 right-2 bg-green-50 rounded-full p-1 shadow-md border border-green-100 z-20">
                                  <img
                                    src="/Logo/badge.png"
                                    alt="Verified"
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Bio Content */}
                            <div className="flex-1 text-center sm:text-left pt-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 justify-center sm:justify-start">
                                {/* Verified Badge */}
                                {(selectedSeller?.badgeVerified ||
                                  selectedSeller?.role_id?.role_name ===
                                    "admin") && (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 shadow-sm w-fit mx-auto sm:mx-0">
                                    <img
                                      src="/Logo/badge.png"
                                      alt="Verified"
                                      className="w-3.5 h-3.5 object-contain"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                      Verified Professional
                                    </span>
                                  </div>
                                )}
                                <button className="sm:ml-auto text-slate-400 hover:text-[#174685] flex items-center gap-2 text-sm font-bold transition-colors group">
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 fill-none stroke-current stroke-[2.5]"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13 19l6-6-6-6M5 19v-3a5 5 0 015-5h9"
                                    />
                                  </svg>
                                  Share profile
                                </button>
                              </div>

                              <h2 className="text-3xl lg:text-4xl font-bold text-[#174685] mb-3">
                                {selectedSeller?.name}
                              </h2>

                              {/* Professional Meta Info */}
                              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                                  <Building2
                                    size={14}
                                    className="text-[#174685]"
                                  />
                                  <span className="text-sm font-bold text-[#174685]">
                                    {sellerProperties.length}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                                    Properties
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Type:
                                  </span>
                                  <span className="text-sm font-bold text-slate-700">
                                    {businessType?.name || "Professional"}
                                  </span>
                                </div>
                                {selectedSeller?.builderProfile?.experienceYears && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                      Exp:
                                    </span>
                                    <span className="text-sm font-bold text-slate-700">
                                      {selectedSeller.builderProfile.experienceYears} Years
                                    </span>
                                  </div>
                                )}
                              </div>
                              {selectedSeller?.builderProfile?.companyName && (
                                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start text-sm text-slate-600">
                                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                    {selectedSeller.builderProfile.companyLogo && (
                                      <img src={getImageUrl(selectedSeller.builderProfile.companyLogo)} className="w-6 h-6 object-contain rounded-md border border-slate-100" alt="company logo" />
                                    )}
                                    <span className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Company</span>
                                    <span className="font-bold text-slate-800">{selectedSeller.builderProfile.companyName}</span>
                                  </div>
                                  {selectedSeller?.builderProfile?.officeAddress && (
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm max-w-sm shrink-0 truncate">
                                      <span className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Location</span>
                                      <span className="font-bold text-slate-800 truncate" title={selectedSeller.builderProfile.officeAddress}>{selectedSeller.builderProfile.officeAddress}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {selectedSeller?.builderProfile?.aboutCompany && (
                                <p className="mt-4 text-sm text-slate-500 text-center sm:text-left max-w-2xl leading-relaxed">
                                  {selectedSeller.builderProfile.aboutCompany}
                                </p>
                              )}
                              {selectedSeller?.builderProfile?.socialLinks && Object.values(selectedSeller.builderProfile.socialLinks).some(link => link) && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                                  {selectedSeller.builderProfile.socialLinks.website && (
                                    <a href={selectedSeller.builderProfile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#174685]/10 hover:border-[#174685]/20 hover:text-[#174685] transition-colors text-slate-500">
                                      <Globe className="w-5 h-5" />
                                    </a>
                                  )}
                                  {selectedSeller.builderProfile.socialLinks.linkedin && (
                                    <a href={selectedSeller.builderProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20 hover:text-[#0A66C2] transition-colors text-slate-500">
                                      <Linkedin className="w-5 h-5" />
                                    </a>
                                  )}
                                  {selectedSeller.builderProfile.socialLinks.instagram && (
                                    <a href={selectedSeller.builderProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#E1306C]/10 hover:border-[#E1306C]/20 hover:text-[#E1306C] transition-colors text-slate-500">
                                      <Instagram className="w-5 h-5" />
                                    </a>
                                  )}
                                  {selectedSeller.builderProfile.socialLinks.facebook && (
                                    <a href={selectedSeller.builderProfile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-[#1877F2]/10 hover:border-[#1877F2]/20 hover:text-[#1877F2] transition-colors text-slate-500">
                                      <Facebook className="w-5 h-5" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Integrated Status & Action Bar */}
                        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                          {/* Response Status */}
                          <div className="flex items-center gap-3 px-4 py-2 bg-[#22c55e]/5 border border-[#22c55e]/10 rounded-full">
                            <div className="relative">
                              <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-ping absolute inset-0" />
                              <div className="relative w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-white shadow-sm" />
                            </div>
                            <span className="text-xs font-bold text-[#1aa554]">
                              Usually responds within 5 minutes
                            </span>
                          </div>

                          {/* Primary CTA Group */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) =>
                                handleWhatsAppClick(e, selectedSeller)
                              }
                              className="flex items-center gap-2.5 px-6 py-3 bg-[#22c55e] text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-[#22c55e]/20 active:translate-y-0"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 fill-current"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                const element = document.getElementById(
                                  "seller-properties-grid",
                                );
                                if (element)
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                  });
                              }}
                              className="flex items-center gap-2.5 px-6 py-3 bg-[#174685] text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-[#174685]/20 active:translate-y-0"
                            >
                              <div className="p-1 bg-white/20 rounded-md">
                                <Building2 size={14} className="text-white" />
                              </div>
                              View Properties
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                          Properties by {selectedSeller?.name}
                        </h2>
                      </div>
                      {selectedSeller?.phone && (
                        <button
                          onClick={(e) =>
                            handleWhatsAppClick(e, selectedSeller)
                          }
                          className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1aa554] text-white rounded-[10px] text-sm font-bold hover:bg-[#158a45] transition-all shadow-sm"
                        >
                          <Phone className="w-4 h-4 fill-current" /> WhatsApp
                        </button>
                      )}
                    </div>
                  )}

                  {propertiesLoading ? (
                    <div className="py-20 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#174685]" />
                    </div>
                  ) : sellerProperties.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No active listings
                      </h3>
                      <p className="text-slate-500 max-w-xs mx-auto">
                        This {businessType?.name?.toLowerCase()} hasn't posted
                        any properties yet.
                      </p>
                    </div>
                  ) : (
                    <div
                      id="seller-properties-grid"
                      className="flex flex-col gap-4 pb-10"
                    >
                      {sellerProperties.map((property) => (
                        <HorizontalPropertyCard
                          key={property._id}
                          property={{
                            ...property,
                            businessType: property.businessType || businessType,
                          }}
                          linkQuery="?from=builder"
                          onWhatsAppClick={(e, prop) => {
                            handleWhatsAppClick(
                              e,
                              prop.seller || selectedSeller,
                              prop,
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <PhoneUpdateModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={(updatedPhone) => {
          if (user) {
            submitEnquiry(
              selectedSeller,
              selectedProperty,
              user.name,
              user.email,
              updatedPhone,
            );
          }
        }}
      />
    </div>
  );
};

export default BusinessUserList;
