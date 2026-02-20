import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Eye } from "lucide-react";
import axios from "axios";
import WishlistButton from "../../../components/Common/WishlistButton";

const PropertyCard = ({ property, onWhatsAppClick }) => {
  const handleIncrementView = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/properties/increment-view-count/${id}`,
      );
    } catch (error) {
      console.error("Error incrementing view", error);
    }
  };

  return (
    <div
      onClick={() => handleIncrementView(property._id)}
      className="relative h-[550px] rounded-2xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
    >
      <Link
        to={`/properties/${property._id}`}
        className="absolute inset-0 z-20"
        onClick={() => handleIncrementView(property._id)}
      >
        <span className="sr-only">View Details</span>
      </Link>

      {/* Background Image */}
      <img
        src={
          property.images?.[0]?.image_url
            ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
            : "https://placehold.co/600x800?text=No+Image"
        }
        alt={property.title}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${property.isSold ? "grayscale-[0.8]" : ""}`}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-100/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />

      {/* Top Left Badges */}
      <div className="absolute top-5 left-5 flex flex-col gap-2 items-start z-10">
        {property.isSold ? (
          <span className="bg-red-600 shadow-lg text-white text-[11px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider border border-white/20">
            Sold Out
          </span>
        ) : (
          <>
            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center gap-1">
              <Eye className="w-3 h-3" /> {property.view_count || 0}
            </span>
            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
              Negotiable
            </span>
          </>
        )}
      </div>

      {/* Wishlist Button - Top Right */}
      <div className="absolute top-5 right-5 z-30">
        <WishlistButton propertyId={property._id} />
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
        <div className="mt-auto pointer-events-auto">
          {/* Developer Badge */}
          <div className="bg-white text-gray-900 text-[12px] font-bold px-2 py-1 inline-block rounded-sm mb-3 capitalize tracking-widest">
            {property.property_type || "DEVELOPER"}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-medium mb-2 leading-tight text-white drop-shadow-md line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-200 text-xs mb-4 font-medium tracking-wide">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span className="truncate uppercase">
              {typeof property.location === "string"
                ? property.location
                : `${property.location?.city || ""}, ${property.location?.state || ""}`}
            </span>
          </div>

          {/* Attributes */}
          <div className="flex items-center gap-4 text-xs text-gray-300 mb-4 border-t border-white/30 pt-4">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-amber-400"
              >
                <path d="M2 22h20" />
                <path d="M20 22V5l-1.07-1.07A2 2 0 0 0 17.5 3h-11a2 2 0 0 0-1.4.6L4 5v17" />
                <path d="M14 10h-4" />
                <path d="M10 14h4" />
              </svg>
              {property.property_type || "Apartment"}
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-5">
            {property.isSold && property.soldPrice ? (
              <>
                <p className="text-[10px] uppercase tracking-widest text-gray-200 mb-1">
                  Sold Price
                </p>
                <p className="text-2xl font-medium text-white tracking-tight">
                  ₹ {property.soldPrice.toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-widest text-gray-200 mb-1">
                  {property.isSold ? "Price" : "Launch Price"}
                </p>
                <p className="text-2xl font-medium text-white tracking-tight">
                  ₹ {property.price.toLocaleString()}
                </p>
              </>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              if (property.isSold) return;
              e.preventDefault();
              e.stopPropagation();

              if (onWhatsAppClick) {
                onWhatsAppClick(e, property);
              } else {
                // Default handling: Track lead then open WhatsApp
                const phoneNumber =
                  property.mobile ||
                  property.seller_id?.phoneNumber ||
                  property.seller_id?.phone ||
                  "919876543210";

                const message = `Hi, I'm interested in your property: ${property.title}`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                // Fire and forget API call to record the lead
                // We use the Enquiry API now, which supports optional fields
                import("@/services/api").then((module) => {
                  const api = module.default;
                  api
                    .post("/enquiries/create", {
                      property_id: property._id,
                      seller_id: property.seller_id._id || property.seller_id,
                      message: "WhatsApp Click (Quick Lead)",
                      enquirer_name: "Guest User", // Placeholder for click leads
                      enquirer_email: "",
                      enquirer_phone: "",
                      // user_id will be handled by backend if token is present?
                      // actually PropertyCard might not have user context easily access without hook.
                      // If we are deep in component tree, we might not want to couple with AuthContext if not needed.
                      // But for better data, we should.
                      // For now, let's just record the click.
                    })
                    .catch((err) =>
                      console.error("Failed to record lead", err),
                    );
                });

                window.open(whatsappUrl, "_blank");
              }
            }}
            disabled={property.isSold}
            className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.98] duration-300 
                            ${
                              property.isSold
                                ? "bg-gray-500/50 text-white cursor-not-allowed backdrop-blur-sm"
                                : "bg-white hover:bg-[#e7e5f4] text-gray-900 opacity-90 group-hover:opacity-100 cursor-pointer pointer-events-auto"
                            }`}
          >
            {property.isSold ? (
              "Sold Out"
            ) : (
              <>
                {/* WhatsApp SVG Icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[#3a307f]"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
