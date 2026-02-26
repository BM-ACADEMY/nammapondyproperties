import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNav } from "@/context/NavContext";
import { getImageUrl } from "@/utils/imageUrl";

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PropertyTypeList = () => {
  const navigate = useNavigate();
  const { propertyTypes, isLoading: loading } = useNav();

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
      details.description =
        "Curated landscapes to build your bespoke dream home.";
      details.ctaText = "Explore Plots";
    } else if (lowerType.includes("villa") || lowerType.includes("house")) {
      details.image = "/properties/villa.png";
      details.description =
        "Experience unparalleled elegance and premium living.";
      details.ctaText = "Explore Villas";
    } else if (lowerType.includes("apartment") || lowerType.includes("flat")) {
      details.image = "/properties/apartment.png";
      details.description =
        "Elevated urban living spaces tailored for your lifestyle.";
      details.ctaText = "Explore Apartments";
    } else if (
      lowerType.includes("commercial") ||
      lowerType.includes("shop") ||
      lowerType.includes("office")
    ) {
      details.image = "/properties/commercial.png";
      details.description =
        "Distinguished locations to establish and grow your business.";
      details.ctaText = "Explore Commercial";
    }

    // If dynamic image exists in the object, use it
    if (typeof type === "object" && type.image_url) {
      details.image = getImageUrl(type.image_url);
    }

    return details;
  };

  // Map property types from NavContext
  const types = (propertyTypes || []).map((type) => {
    const name = typeof type === "string" ? type : type.name || "";
    return {
      originalType: name,
      title: name,
      ...getCardDetails(type),
    };
  });

  return (
    <section className="pt-18 pb-10 bg-[#FAFAFA] font-sans overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Premium Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-light font-serif text-gray-900">
            Explore Properties
          </h2>
          <div className="w-16 h-[3px] bg-amber-700 mt-6 opacity-60"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-xl flex h-[320px] animate-pulse overflow-hidden"
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
          <div className="relative group/slider">
            {/* Custom Navigation */}
            <button className="swiper-prev-btn absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl border border-gray-100 transition-all hover:scale-110 active:scale-95 group focus:outline-none hidden md:flex items-center justify-center cursor-pointer disabled:opacity-0 disabled:pointer-events-none">
              <ArrowLeft className="w-5 h-5 group-hover:text-amber-700 transition-colors" />
            </button>
            <button className="swiper-next-btn absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xl border border-gray-100 transition-all hover:scale-110 active:scale-95 group focus:outline-none hidden md:flex items-center justify-center cursor-pointer disabled:opacity-0 disabled:pointer-events-none">
              <ArrowRight className="w-5 h-5 group-hover:text-amber-700 transition-colors" />
            </button>

            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
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
              loop={types.length > 1}
              breakpoints={{
                540: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
                1440: {
                  slidesPerView: 4,
                  spaceBetween: 40,
                },
              }}
              className="py-6"
            >
              {types.map((item, index) => (
                <SwiperSlide key={index}>
                  <div
                    onClick={() =>
                      navigate(
                        `/properties?type=${encodeURIComponent(
                          item.originalType,
                        )}`,
                      )
                    }
                    className="group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content Box */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="font-serif text-2xl text-white mb-2 font-medium tracking-wide">
                          {item.title}
                        </h3>

                        <p className="text-gray-300 text-sm leading-relaxed mb-5 transition-opacity duration-500 delay-100 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center text-amber-400 font-medium text-xs tracking-wider uppercase mt-auto w-max group-hover:text-amber-300 transition-colors">
                          <span className="relative overflow-hidden pb-1">
                            {item.ctaText}
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                          </span>
                          <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1.5 transition-all duration-500 ease-out" />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyTypeList;
