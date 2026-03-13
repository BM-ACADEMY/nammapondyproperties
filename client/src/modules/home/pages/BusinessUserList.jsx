import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
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

const BusinessUserList = () => {
  const { businessTypeId } = useParams();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerProperties, setSellerProperties] = useState([]);
  const [businessType, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fontLinkId = "google-font-poppins";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
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
        setBusinessType(typeRes.data);
        setSellers(sellersRes.data);
        if (sellersRes.data.length > 0) {
          setSelectedSeller(sellersRes.data[0]);
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
      if (!selectedSeller || !businessTypeId) return;
      setPropertiesLoading(true);
      try {
        const res = await axios.get(
          `${API}/properties/fetch-all-property?seller_id=${selectedSeller._id}&businessType=${businessTypeId}`
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
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

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
              ${isActive
                ? "bg-[#174685]/8"
                : "bg-white hover:bg-slate-50 border-l-[3px] border-l-transparent"
              }`}
          >
            {/* Avatar */}
            <div className={`relative shrink-0 ${compact ? "w-12 h-12" : "w-16 h-16"}`}>
              <div className={`overflow-hidden transition-all duration-200 absolute top-1 left-1
                ${compact ? "w-10 h-10 rounded-full" : "w-14 h-14 rounded-xl"}
                `}>
                {user.profile_image ? (
                  <img src={getImageUrl(user.profile_image)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-bold
                    ${compact ? "text-sm" : "text-xl"}
                    ${isActive ? "bg-[#174685] text-white" : "bg-slate-100 text-slate-500"}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Green online dot */}
              {/* <span className={`absolute border-2 border-white rounded-full bg-green-400 z-10
                ${compact ? "bottom-0.5 right-0.5 w-2.5 h-2.5" : "bottom-1 right-1 w-3 h-3"}`}></span> */}
              {/* Active check badge */}
              {isActive && (
                <div className={`absolute bg-[#174685] rounded-full flex items-center justify-center border-2 border-white z-10
                  ${compact ? "-top-0.5 -left-0.5 w-4 h-4" : "-top-0.5 -left-0.5 w-5 h-5"}`}>
                  <svg width={compact ? 8 : 9} height={compact ? 8 : 9} viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`truncate leading-tight transition-colors
                ${compact ? "text-[13px]" : "text-[14px]"}
                ${isActive ? "text-[#174685] font-bold" : "text-slate-800 font-semibold group-hover:text-[#174685]"}`}>
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
            <ArrowRight className={`shrink-0 transition-all duration-200
              ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}
              ${isActive ? "text-[#174685]" : "text-slate-200 group-hover:text-slate-400"}`} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins',_sans-serif] pb-20 pt-10 relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none" />

      {/* ─── MOBILE: Floating side tab button ─── */}
      {sellers.length > 0 && (
        <div className="lg:hidden fixed left-0 top-24 z-[400]">
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
                  <p className="text-[11px] text-slate-500 mt-0.5">{sellers.length} verified professionals</p>
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
      <div className="mt-20 max-w-[1400px] mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 relative z-10">
        {sellers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#174685]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No sellers found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              There are currently no sellers who have posted properties with this business type.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* ─── DESKTOP: Left Sidebar ─── */}
            <div className="hidden lg:block lg:w-72 xl:w-80 h-fit sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SellersList />
              </div>
            </div>

            {/* ─── Properties ─── */}
            <div className="flex-1 min-h-[600px]">

              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Properties by {selectedSeller?.name}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Showing all {businessType?.name?.toLowerCase()} properties posted by this verified professional.
                  </p>
                </div>

                {selectedSeller?.phone && (
                  <button
                    onClick={() =>
                      window.open(`https://wa.me/${selectedSeller.phone}`, "_blank")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-[#1aa554] text-white rounded-full text-sm font-bold hover:bg-[#158a45] transition-all shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4 fill-current" /> Chat on WhatsApp
                  </button>
                )}
              </div>

              {propertiesLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#174685]" />
                </div>
              ) : sellerProperties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                  <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">
                    No properties found for this category from this seller.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0 pb-10">
                  {sellerProperties.map((property) => (
                    <HorizontalPropertyCard
                      key={property._id}
                      property={{ ...property, businessType: property.businessType || businessType }}
                      onWhatsAppClick={(e, prop) => {
                        const phone = prop.seller?.phone || selectedSeller?.phone;
                        if (phone) window.open(`https://wa.me/${phone}`, "_blank");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessUserList;
