import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  ArrowRight,
  Building2,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getImageUrl } from "@/utils/imageUrl";
import PropertyCard from "@/modules/home/components/PropertyCard";
import Loader from "@/components/Common/Loader";

const BusinessUserList = () => {
  const { businessTypeId } = useParams();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerProperties, setSellerProperties] = useState([]);
  const [businessType, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSellers = async () => {
      if (!businessTypeId) return;
      setLoading(true);
      try {
        const [typeRes, sellersRes] = await Promise.all([
          axios.get(`${API}/business-types/${businessTypeId}`),
          axios.get(`${API}/users/sellers-by-business-type/${businessTypeId}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  // CHANGED: Background is now #f9fafb (Tailwind's bg-gray-50)
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- HERO SECTION (Wrapped in a single white card) --- */}
        <div className="bg-white rounded-[24px] shadow-sm p-8 lg:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4 tracking-tight">
              Find Your {businessType?.name || "Agent"}
            </h1>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
              Connect with the most responsive professionals with{" "}
              <span className="font-bold italic text-slate-900">
                up-to-date expertise
              </span>{" "}
              and top accuracy on the properties you are looking for.
            </p>

            <div className="inline-block border border-[#d4af37]/60 text-[#b58900] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-default">
              Showing {sellers.length} Verified Professionals
            </div>
          </div>

          <div className="md:w-1/2 flex justify-end">
            <img
              src="/agent.png"
              alt="Professionals"
              className="w-full max-w-lg object-contain"
            />
          </div>
        </div>

        {/* --- CONTENT SECTION (Two Columns) --- */}
        {sellers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#3b5998]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No sellers found
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              There are currently no sellers who have posted properties with this business type.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Left Sidebar: Sellers List */}
            <div className="lg:w-1/3 xl:w-1/4 h-fit sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    {businessType?.name || "Professional"}s ({sellers.length})
                  </h3>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {sellers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => setSelectedSeller(user)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-gray-50 last:border-0 hover:bg-slate-50 ${selectedSeller?._id === user._id
                        ? "bg-slate-100 border-l-4 border-l-[#174685] pl-3"
                        : "bg-white"
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                        {user.profile_image ? (
                          <img
                            src={getImageUrl(user.profile_image)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${selectedSeller?._id === user._id ? "text-[#174685]" : "text-slate-900"
                          }`}>
                          {user.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current" /> 5.0 Rated
                        </p>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-transform ${selectedSeller?._id === user._id ? "translate-x-1 text-[#174685]" : "text-slate-300"
                        }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Main Column: Property Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Properties by {selectedSeller?.name}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Showing all {businessType?.name.toLowerCase()} properties posted by this verified professional.
                  </p>
                </div>

                {selectedSeller?.phone && (
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedSeller.phone}`, "_blank")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-bold hover:bg-[#128C7E] transition-all shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4 fill-current" /> Chat on WhatsApp
                  </button>
                )}
              </div>

              {propertiesLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#174685]"></div>
                </div>
              ) : sellerProperties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                  <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">No properties found for this category from this seller.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                  {sellerProperties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}</div>
    </div>
  );
};

export default BusinessUserList;
