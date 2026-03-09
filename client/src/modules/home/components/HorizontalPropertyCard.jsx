import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Eye, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { formatIndianPrice } from "@/utils/formatPrice";
import { getImageUrl } from "@/utils/imageUrl";
import moment from "moment";
import WishlistButton from "../../../components/Common/WishlistButton";

const HorizontalPropertyCard = ({ property, onWhatsAppClick }) => {
    const imgUrl = getImageUrl(property.media?.featuredImage || property.media?.images?.[0]);
    const locality = property.location?.locality || property.location?.city || "Pondicherry";
    const city = property.location?.city || "";
    const role = property.seller?.role_id?.role_name || property.seller?.role?.name || "Owner";
    const timeAgo = property.createdAt ? moment(property.createdAt).fromNow() : "Recently";

    const bedrooms = property.specifications?.residential?.bedrooms || 0;
    const bathrooms = property.specifications?.residential?.bathrooms || 0;
    const area = property.specifications?.area?.totalArea || property.specifications?.area?.builtupArea || 0;
    const areaUnit = property.specifications?.area?.unit || "sqft";

    const floorInfo = property.specifications?.floor?.propertyOnFloor
        ? `${property.specifications.floor.propertyOnFloor} out of ${property.specifications.floor.totalFloor || 1} Floors`
        : "";

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row group relative">
            {/* Left: Image Section */}
            <div className="md:w-72 lg:w-80 h-64 md:h-auto relative shrink-0 overflow-hidden">
                <Link
                    to={`/properties/${property.slug || property._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                />
                <img
                    src={imgUrl}
                    alt={property.basicInfo?.title || "Property"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 z-20">
                    <WishlistButton propertyId={property._id} />
                </div>
                <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1">
                    1/{property.media?.images?.length || 1}
                </div>
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 p-5 md:p-6 flex flex-col">
                {/* Header: Title & Tag */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {locality}{city ? `, ${city}` : ""}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {bedrooms} BHK {property.basicInfo?.propertyType || "Property"} in {locality}
                        </p>
                    </div>
                    <span className="bg-gray-100 text-[10px] font-bold px-2 py-1 rounded text-gray-600 uppercase tracking-widest">
                        {property.basicInfo?.category === "Rent" ? "FOR RENT" : "RESALE"}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 py-4 border-y border-gray-50 my-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            {formatIndianPrice(property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                            {property.pricing?.sell?.pricePerSqft ? `₹${property.pricing.sell.pricePerSqft.toLocaleString()}/sqft` : "Price"}
                        </span>
                    </div>
                    <div className="flex flex-col sm:border-x border-gray-100 sm:px-4">
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                            {area.toLocaleString()} {areaUnit}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                            {property.specifications?.area?.totalArea ? "Total Area" : "Built Area"}
                        </span>
                    </div>
                    <div className="flex flex-col sm:pl-4 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                            {bedrooms} BHK <span className="text-sm font-medium text-gray-500">({bathrooms} Bath)</span>
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                            {property.legal?.propertyStatus || "Ready To Move"}
                        </span>
                    </div>
                </div>

                {/* Floor Info Tag */}
                {floorInfo && (
                    <div className="mb-4">
                        <span className="bg-blue-50 text-blue-600 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-100/50 uppercase tracking-wide">
                            {floorInfo}
                        </span>
                    </div>
                )}

                {/* Excerpt */}
                <div className="mb-6 relative group/excerpt hidden sm:block">
                    <p className="text-sm text-gray-500 line-clamp-1 pr-6 leading-relaxed">
                        Located in {locality}, {city}, this {bedrooms} BHK {property.basicInfo?.propertyType?.toLowerCase()}...
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300 absolute right-0 top-1/2 -translate-y-1/2" />
                </div>

                {/* Footer Bar */}
                <div className="mt-auto flex flex-wrap items-center justify-between pt-4 border-t border-gray-50 gap-4">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium">{timeAgo}</span>
                        <span className="text-sm font-bold text-gray-700">{role}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-xs sm:text-sm tracking-wide hover:bg-blue-50 transition-colors whitespace-nowrap">
                            View Number
                        </button>
                        <button
                            onClick={(e) => onWhatsAppClick && onWhatsAppClick(e, property)}
                            className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap"
                        >
                            <Phone className="w-4 h-4 fill-white" /> Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChevronRight = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default HorizontalPropertyCard;
