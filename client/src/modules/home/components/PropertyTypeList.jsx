import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUp, Activity } from "lucide-react";
import { useNav } from "@/context/NavContext";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUrl";
import axios from "axios";

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PropertyTypeList = () => {
  const navigate = useNavigate();
  const { propertyTypes, isLoading: loading } = useNav();
  const { isAuthenticated } = useAuth();
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    // 🏠 Visit Count Tracker (Once per session)
    const storedCount = parseInt(localStorage.getItem("site_visits")) || 0;
    const sessionCounted = sessionStorage.getItem("visit_counted");

    if (!sessionCounted) {
      const newCount = storedCount + 1;
      localStorage.setItem("site_visits", newCount);
      sessionStorage.setItem("visit_counted", "true");
      setVisitCount(newCount);
    } else {
      setVisitCount(storedCount);
    }
  }, []);

  // Matched exactly to the subtle pastels in your second reference image
  const bgColors = [
    "bg-[#F0FDF4]", // Subtle Mint (like Builder Floor)
    "bg-[#FFFBEB]", // Subtle Cream (like Commercial Other)
    "bg-[#FAF5FF]", // Subtle Lilac (like Commercial Plot)
    "bg-[#F0F9FF]", // Subtle Sky Blue
  ];

  // Helper function to get details and images based on type name
  const getCardDetails = (type) => {
    const typeName = typeof type === "string" ? type : type.name || "";
    const lowerType = typeName.toLowerCase();

    const details = {
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      description: "Discover exceptional properties that match your vision.",
      ctaText: `Explore ${typeName}`,
    };

    if (lowerType.includes("plot") || lowerType.includes("land")) {
      details.image = "/properties/plot.png";
      details.description = "Curated landscapes to build your bespoke dream home.";
      details.ctaText = "Explore Plots";
    } else if (lowerType.includes("villa") || lowerType.includes("house")) {
      details.image = "/properties/villa.png";
      details.description = "Experience unparalleled elegance and premium living.";
      details.ctaText = "Explore Villas";
    } else if (lowerType.includes("apartment") || lowerType.includes("flat")) {
      details.image = "/properties/apartment.png";
      details.description = "Elevated urban living spaces tailored for your lifestyle.";
      details.ctaText = "Explore Apartments";
    } else if (
      lowerType.includes("commercial") ||
      lowerType.includes("shop") ||
      lowerType.includes("office")
    ) {
      details.image = "/properties/commercial.png";
      details.description = "Distinguished locations to establish and grow your business.";
      details.ctaText = "Explore Commercial";
    }

    // If dynamic image exists in the object, use it
    if (typeof type === "object" && type.image_url) {
      details.image = getImageUrl(type.image_url);
    }

    return details;
  };

  // Map property types from NavContext and assign a background color
  const types = (propertyTypes || []).map((type, index) => {
    const name = typeof type === "string" ? type : type.name || "";
    return {
      originalType: name,
      title: name,
      bgColor: bgColors[index % bgColors.length],
      ...getCardDetails(type),
    };
  });

  return (
    <section className="pt-16 pb-10 bg-white font-sans overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1450px] flex flex-col lg:flex-row gap-10">

        {/* Left Section: Main Content */}
        <div className="flex-1 w-full overflow-visible min-w-0">
          <div className="mb-6">
            <h2 className="text-[28px] font-bold text-[#1E293B]">Explore Properties</h2>
            <p className="text-[15px] text-[#64748B] mt-1">Discover exceptional properties and landscapes</p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-2xl flex h-[300px] animate-pulse overflow-hidden"
                ></div>
              ))}
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg font-light">
                No property types found at this moment.
              </p>
            </div>
          ) : (
            <div className="relative group/slider w-full">

              {/* Custom Navigation */}
              <button className="swiper-prev-btn absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 rounded-full transition hover:scale-105 hover:text-blue-600 disabled:opacity-0 disabled:pointer-events-none hidden md:flex cursor-pointer text-[#475569]">
                <ChevronLeft className="w-6 h-6 ml-[-2px]" />
              </button>
              <button className="swiper-next-btn absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 rounded-full transition hover:scale-105 hover:text-blue-600 disabled:opacity-0 disabled:pointer-events-none hidden md:flex cursor-pointer text-[#475569]">
                <ChevronRight className="w-6 h-6 mr-[-2px]" />
              </button>

              {/* Swiper Implementation */}
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  prevEl: ".swiper-prev-btn",
                  nextEl: ".swiper-next-btn",
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                watchOverflow={true} // Prevents Swiper from breaking if there are too few cards
                breakpoints={{
                  540: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 3, spaceBetween: 24 },
                  1024: { slidesPerView: 2, spaceBetween: 24 }, // Shrinks to 2 to make room for sidebar
                  1280: { slidesPerView: 3, spaceBetween: 24 },
                }}
                className="py-4 px-2"
              >
                {types.map((item, index) => (
                  <SwiperSlide key={index}>
                    {/* NEW CARD LAYOUT: 
                      Using a strict flex-col to stack the text block and the image block. 
                      No more absolute positioning! 
                    */}
                    <div
                      onClick={() =>
                        navigate(
                          `/properties?type=${encodeURIComponent(item.originalType)}`
                        )
                      }
                      className="flex flex-col h-[300px] rounded-[16px] overflow-hidden cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white"
                    >
                      {/* Top Text Block (Fixed Height) */}
                      <div className={`p-5 h-[110px] flex flex-col justify-center ${item.bgColor}`}>
                        <h3 className="text-[20px] font-bold text-[#1E293B] leading-tight mb-1 group-hover:text-[#2563EB] transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-[14px] text-[#64748B] font-medium">
                          {item.ctaText}
                        </p>
                      </div>

                      {/* Bottom Image Block (Takes remaining space) */}
                      <div className="flex-1 w-full overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                          // Fallback to prevent broken image icons if local asset is missing
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Right Section: Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6 lg:mt-[76px]">

          {/* Activity Widget - Only for guests */}
          {!isAuthenticated && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs text-[#64748B] mb-3 font-semibold uppercase tracking-wider">Your Recent Activity</p>

              <div className="bg-orange-50/70 rounded-lg p-4 mb-4 flex justify-between items-start border border-orange-100">
                <div>
                  <span className="text-2xl font-bold block text-slate-800">{visitCount}</span>
                  <span className="text-sm text-slate-600">Viewed</span>
                </div>
                <span className="text-orange-400 text-lg leading-none">
                  <Activity size={18} />
                </span>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#0078d7] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Login/Register to Save Activity
              </button>
              <p className="text-[10px] text-center text-[#64748B] mt-3">
                & see your activities across browsers & devices...
              </p>
            </div>
          )}

          {/* Promo Widget - At Bottom */}
          <div className="mt-auto">
            <div className="bg-[#e6f4ea] rounded-xl p-5 relative overflow-hidden flex flex-col justify-center min-h-[160px]">

              <div className="relative z-10 w-2/3">
                <h3 className="font-bold text-[#1E293B] leading-tight mb-1 text-lg">
                  Find the Best Deal for Your Property!
                </h3>

                <p className="text-sm text-[#475569] mb-4">
                  List your property today
                </p>

                <button
                  onClick={() => navigate("/post-property")}
                  className="bg-[#0078d7] hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Post Property – It's FREE
                </button>
              </div>

              {/* Agent Image */}
              <div
                className="absolute bottom-0 right-0 w-[38%] h-[95%] bg-contain bg-no-repeat bg-bottom"
                style={{ backgroundImage: "url(./properties/adsman.png)" }}
              ></div>

            </div>
          </div>
        </div>

      </div>
         <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-blue-100 hover:bg-blue-200 text-[#0078d7] p-3 rounded-full shadow-md transition z-50 hidden md:flex"
      >
        <ArrowUp size={20} />
      </button>

    </section>
  );
};

export default PropertyTypeList;