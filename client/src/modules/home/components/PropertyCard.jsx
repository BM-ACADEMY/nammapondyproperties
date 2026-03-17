import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MapPin, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";
import { formatIndianPrice, formatPriceRange } from "../../../utils/formatPrice";
import { formatNumber } from "../../../utils/formatNumber";
import { getImageUrl } from "../../../utils/imageUrl";

import moment from "moment";

const PropertyCard = ({ property }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const imgUrl = getImageUrl(property.media?.featuredImage || property.media?.images?.[0]);
  const locality = property.location?.locality || property.location?.city || "Pondicherry";
  const city = property.location?.city || "";
  const posterType = property.businessType?.name || (typeof property.businessType === 'string' && property.businessType !== "" ? property.businessType : null) || "Owner";
  const timeAgo = property.createdAt ? moment(property.createdAt).fromNow() : "Recently";

  // Price range display
  const minPrice = property.pricing?.sell?.minPrice || property.pricing?.rent?.minRent;
  const maxPrice = property.pricing?.sell?.maxPrice || property.pricing?.rent?.maxRent;
  const singlePrice = property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0;
  const displayPrice = formatPriceRange(minPrice, maxPrice, singlePrice);

  return (
    <div className="flex flex-col group h-full">
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
        <Link
          to={`/properties/${property.slug || property._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
        />

        <img
          src={imgUrl}
          alt={property.basicInfo?.title || "Property"}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${property.isSold ? "grayscale-[0.8]" : ""}`}
        />

        {/* Wishlist Button - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <WishlistButton propertyId={property._id} />
        </div>

        {/* Verified Badge - Top Left */}
        {(property.seller?.badgeVerified || property.seller?.role_id?.role_name === 'admin') && (
          <div className="absolute top-3 left-3 z-20 bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-green-200">
            <img src="/Logo/badge.png" alt="Verified" className="w-4 h-4 object-contain" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Verified</span>
          </div>
        )}

        {/* Price Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20 bg-white px-3 py-1.5 rounded-lg shadow-md">
          <span className="text-sm font-bold text-gray-900">
            {displayPrice}
          </span>
        </div>

        {property.isSold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider pointer-events-auto">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Bottom Content Section */}
      <div className="flex flex-col flex-1 px-1">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
          {property.basicInfo?.title || "Untitled Property"}
        </h3>

        {/* Location */}
        <p className="text-gray-500 text-sm mb-3 font-medium">
          In <span className="font-bold text-gray-800">{locality}</span>{city ? `, ${city}` : ""}
        </p>

        {/* Footer Meta */}
        <div className="mt-auto flex items-center justify-between text-gray-500 text-sm">
          <span>Posted by {posterType}</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
