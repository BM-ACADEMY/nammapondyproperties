import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useNav } from "@/context/NavContext";

const PropertyTypeList = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const { propertyTypes, isLoading: loading } = useNav();

  // Helper function to get details and images based on type name
  const getCardDetails = (type) => {
    const typeName = typeof type === "string" ? type : type.name || "";
    const lowerType = typeName.toLowerCase();

    const details = {
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
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
      details.image = `${import.meta.env.VITE_API_URL.replace("/api", "")}${type.image_url}`;
    }

    return details;
  };

  // Map property types from NavContext
  useEffect(() => {
    if (propertyTypes && propertyTypes.length > 0) {
      const mappedTypes = propertyTypes.map((type) => {
        const name = typeof type === "string" ? type : type.name || "";
        return {
          originalType: name,
          title: name,
          ...getCardDetails(type),
        };
      });
      setTypes(mappedTypes);
    }
  }, [propertyTypes]);

  return (
    <section className="py-18 bg-[#FAFAFA] font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Premium Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-light font-serif text-gray-900 tracking-tight">
            Explore Properties
          </h2>
          <div className="w-16 h-[3px] bg-amber-700 mt-6 opacity-60"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          // Adjusted to 4 columns on large screens
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                // Reduced skeleton height
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
          /* Property Types Grid - Mobile/Tablet Slider, Desktop Grid */
          <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {types.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  navigate(
                    `/properties?type=${encodeURIComponent(item.originalType)}`,
                  )
                }
                // Mobile: 85% width, Tablet: 45% width, Desktop: auto
                className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
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

                {/* Content Box - Reduced padding (p-6) */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    {/* Slightly smaller title (text-2xl) */}
                    <h3 className="font-serif text-2xl text-white mb-2 font-medium tracking-wide">
                      {item.title}
                    </h3>

                    {/* Adjusted description spacing */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-5 transition-opacity duration-500 delay-100 line-clamp-2 lg:line-clamp-none">
                      {item.description}
                    </p>

                    {/* Premium CTA */}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyTypeList;
