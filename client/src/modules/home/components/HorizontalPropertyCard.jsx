import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Eye, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { formatIndianPrice, formatPriceRange } from "@/utils/formatPrice";
import { getImageUrl } from "@/utils/imageUrl";
import moment from "moment";
import WishlistButton from "../../../components/Common/WishlistButton";

const HorizontalPropertyCard = ({ property, onWhatsAppClick }) => {
    const imgUrl = getImageUrl(property.media?.featuredImage || property.media?.images?.[0]);
    const locality = property.location?.locality || property.location?.city || "Pondicherry";
    const city = property.location?.city || "";
    const posterType = property.businessType?.name || (typeof property.businessType === 'string' ? property.businessType : null) || property.seller?.role_id?.role_name || property.seller?.role?.name || "Owner";
    const timeAgo = property.createdAt ? moment(property.createdAt).fromNow() : "Recently";

    const bedrooms = property.specifications?.residential?.bedrooms || 0;
    const minArea = property.specifications?.area?.minArea;
    const maxArea = property.specifications?.area?.maxArea;
    const totalArea = property.specifications?.area?.totalArea || property.specifications?.area?.builtupArea || 0;
    const areaUnit = property.specifications?.area?.unit || "sqft";

    // Build area display string
    const areaDisplay = (minArea && maxArea)
        ? `${Number(minArea).toLocaleString()} - ${Number(maxArea).toLocaleString()} ${areaUnit}`
        : minArea
        ? `${Number(minArea).toLocaleString()}+ ${areaUnit}`
        : `${Number(totalArea).toLocaleString()} ${areaUnit}`;

    const areaLabel = (minArea || maxArea) ? "Area Range" : (property.specifications?.area?.totalArea ? "Total Area" : "Built Area");

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col xl:flex-row group relative h-full">
            {/* Left: Image Section */}
            <div className="w-full xl:w-2/5 h-48 xl:h-auto min-h-[192px] relative shrink-0 overflow-hidden">
                <Link
                    to={`/properties/${property.slug || property._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                />
                <img
                    src={imgUrl}
                    alt={property.basicInfo?.title || "Property"}
                    className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 z-20">
                    <WishlistButton propertyId={property._id} />
                </div>
                <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[9px] font-medium flex items-center gap-1">
                    1/{property.media?.images?.length || 1}
                </div>
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 p-4 md:p-6 flex flex-col">
                {/* Header: Title & Tag */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-1">
                            {locality}{city ? `, ${city}` : ""}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                            {bedrooms > 0 ? `${bedrooms} BHK ` : ""}{property.basicInfo?.propertyType || "Property"} in {locality}
                        </p>
                    </div>
                    <span className="bg-gray-100 text-[9px] font-bold px-2 py-0.5 rounded text-gray-500 uppercase tracking-widest shrink-0 ml-2">
                        {property.basicInfo?.category === "Rent" ? "FOR RENT" : "RESALE"}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 py-4 my-2">
                    <div className="flex-1 min-w-[30%] flex flex-col">
                        <span className="text-base font-bold text-slate-800 break-words">
                            {formatPriceRange(
                                property.pricing?.sell?.minPrice || property.pricing?.rent?.minRent,
                                property.pricing?.sell?.maxPrice || property.pricing?.rent?.maxRent,
                                property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0
                            )}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                            {property.pricing?.sell?.pricePerSqft ? `₹${property.pricing.sell.pricePerSqft.toLocaleString()}/sqft` : "Price"}
                        </span>
                    </div>

                    <div className="hidden sm:block h-10 w-px bg-gray-100 shrink-0" />

                    <div className="flex-1 min-w-[30%] flex flex-col">
                        <span className="text-base font-bold text-slate-800 break-words">
                            {areaDisplay}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                            {areaLabel}
                        </span>
                    </div>

                    <div className="hidden sm:block h-10 w-px bg-gray-100 shrink-0" />

                    <div className="flex-1 min-w-[20%] flex flex-col">
                        <span className="text-lg font-bold text-slate-800">
                            Status
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            {property.legal?.propertyStatus || "Ready to Move"}
                        </span>
                    </div>
                </div>

                <div className="h-px w-full bg-slate-50 mb-4" />

                {/* Excerpt */}
                <div className="mb-4 relative group/excerpt">
                    <p className="text-sm text-slate-500 line-clamp-1 pr-6 leading-relaxed italic">
                        Located in {locality}, {city}, this {bedrooms > 0 ? `${bedrooms} BHK ` : ""}{property.basicInfo?.propertyType?.toLowerCase()}...
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-300 absolute right-0 top-1/2 -translate-y-1/2" />
                </div>

                {/* Footer Bar */}
                <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-slate-400 font-medium">{timeAgo}</span>
                        <span className="text-[13px] font-bold text-slate-700 capitalize">{posterType}</span>
                    </div>

                    <button
                        onClick={(e) => onWhatsAppClick && onWhatsAppClick(e, property)}
                        className="px-6 py-2 rounded-xl bg-[#166aa8] text-white font-bold text-[13px] tracking-wide flex items-center gap-2 hover:bg-[#125a8e] transition-all shadow-md active:scale-95"
                    >
                        <Phone className="w-4 h-4" />
                        <span>Contact</span>
                    </button>
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
