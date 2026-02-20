import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  ArrowRight,
  BedDouble,
  Bath,
  Square,
  User,
  Calendar,
  Home,
  X,
  Eye,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-hot-toast";
import LoginModal from "../../../components/Auth/LoginModal";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";
import { recordPropertyView } from "../../../utils/propertyViewTracker";
import Loader from "../../../components/Common/Loader";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [moreProperties, setMoreProperties] = useState([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-property-by-id/${id}`,
        );
        setProperty(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setMainImage(res.data.images[0].image_url);
        }

        const relatedRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?limit=3&random=true&isSold=false&excludeId=${id}`,
        );
        if (Array.isArray(relatedRes.data.properties)) {
          setMoreProperties(relatedRes.data.properties);
        }

        recordPropertyView(id);
      } catch (error) {
        console.error("Error fetching property details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWhatsAppClick = () => {
    if (!user) {
      toast.error("Please login to contact the seller");
      navigate("/login", { state: { from: location.pathname } });
    } else {
      submitEnquiry(user.name, user.email, user.phone);
    }
  };

  const submitEnquiry = async (name, email, phone) => {
    if (!property || !property.seller_id) return;
    setEnquiryLoading(true);

    const sellerPhone = property.seller_id.phone || "919000000000";
    const locationStr =
      typeof property.location === "string"
        ? property.location
        : `${property.location?.city || ""}, ${property.location?.state || ""}`;
    const message = `Hi, I am interested in your property: ${property.title} located at ${locationStr}. Please provide more details.`;
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/enquiries/create`, {
        property_id: property._id,
        seller_id: property.seller_id._id,
        message: message,
        name,
        email,
        phone,
      });
      toast.success("Enquiry recorded! Redirecting to WhatsApp...");
    } catch (error) {
      console.error("Enquiry Error:", error);
      toast.error("Redirecting to WhatsApp...");
    } finally {
      window.open(whatsappUrl, "_blank");
      setEnquiryLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!property)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        Property Not Found
      </div>
    );

  const getImageUrl = (path) =>
    path
      ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${path}`
      : "https://placehold.co/800x600";

  return (
    <div className="bg-white min-h-screen py-8 font-sans text-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8 flex items-center">
          <Link to="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <Link to="/properties" className="hover:text-black transition-colors">
            Properties
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">
            {property.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT COLUMN: Premium New Look */}
          <div className="lg:col-span-8 space-y-12">
            {/* 1. Header & Price */}
            <div className="space-y-4">
              {/* Property Badge/Tag */}

              <h1 className="text-3xl md:text-4xl font-bold capitalize tracking-tight text-gray-900 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center text-gray-500 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {typeof property.location === "string"
                  ? property.location
                  : `${property.location?.city || ""}, ${property.location?.state || ""}`}
              </div>

              <div className="pt-2">
                {property.isSold && property.soldPrice ? (
                  <>
                    <span className="text-xl text-gray-500 font-medium mr-2">
                      Sold Price
                    </span>
                    <span className="text-3xl font-bold text-red-600">
                      ₹ {property.soldPrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl text-gray-500 font-medium mr-2">
                      {property.isSold ? "Price" : "Launch Price"}
                    </span>
                    <span className="text-3xl font-bold text-[#3a307f]">
                      ₹ {property.price.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mb-2 pt-5">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  {property.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                  {property.property_type}
                </span>
              </div>
            </div>

            {/* 2. Image Gallery - Clean & Sharp */}
            <div className="space-y-4">
              <div className="relative h-[450px] md:h-[550px] bg-gray-100 rounded-xl overflow-hidden group">
                {property.isSold && (
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-red-600 shadow-lg text-white text-sm font-bold px-4 py-2 rounded-sm uppercase tracking-wider border border-white/20">
                      Sold Out
                    </span>
                  </div>
                )}
                <img
                  src={getImageUrl(mainImage)}
                  alt={property.title}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${property.isSold ? "grayscale-[0.8]" : ""}`}
                />
                <div className="absolute top-4 right-4 z-10">
                  <WishlistButton propertyId={property._id} />
                </div>
              </div>

              {/* Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img.image_url)}
                      className={`relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                        mainImage === img.image_url
                          ? "ring-2 ring-black opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img.image_url)}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Key Information - The "Greencrest" Style Grid */}
            <div>
              <h3 className="text-xl font-bold text-gray-600 mb-6">
                Key Information
              </h3>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                  {/* item */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                      Delivery Date
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {property.status === "Ready to Move"
                        ? "Immediate"
                        : "2025 (Est)"}
                    </span>
                  </div>
                  {/* item */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                      Location
                    </span>
                    <span className="text-lg font-bold text-gray-900 capitalize truncate">
                      {property.location?.city || "Pondicherry"}
                    </span>
                  </div>
                  {/* item */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                      Area
                    </span>
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      {property.area_size || "N/A"}
                      <span className="text-xs text-gray-400 ml-1 font-normal">
                        sq.ft
                      </span>
                    </span>
                  </div>
                  {/* item */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                      Ownership
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      Freehold
                    </span>
                  </div>
                  {/* item */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                      Approval
                    </span>
                    <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                      {property.approval ? (
                        <>✓ {property.approval}</>
                      ) : (
                        "Standard"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 4. About the Project */}
            <div>
              <h3 className="text-xl font-bold text-gray-600 mb-4">
                About the project
              </h3>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <p>{property.description}</p>
              </div>
            </div>

            {/* 5. Amenities / Features - Pills Style */}
            {property.key_attributes && property.key_attributes.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-600 mb-6">
                  Features & Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {property.key_attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:border-black transition-colors bg-white"
                    >
                      <span className="text-xs text-gray-500 uppercase font-bold">
                        {attr.key}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {attr.value}
                      </span>
                    </div>
                  ))}

                  {/* Fallback generic amenities if none (just for design showcase, remove if strict) */}
                  {(!property.key_attributes ||
                    property.key_attributes.length === 0) &&
                    ["Parking", "Security", "Water Supply", "Power Backup"].map(
                      (item, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 font-medium"
                        >
                          {item}
                        </div>
                      ),
                    )}
                </div>
              </div>
            )}

            {/* 6. Location Map */}
            {property?.location?.latitude && property?.location?.longitude && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-600">Location</h3>
                <div className="bg-blue-50 rounded-2xl p-2 border border-blue-100">
                  <div className="h-[350px] w-full rounded-xl overflow-hidden relative">
                    <MapContainer
                      center={[
                        property.location.latitude,
                        property.location.longitude,
                      ]}
                      zoom={14}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[
                          property.location.latitude,
                          property.location.longitude,
                        ]}
                      >
                        <Popup>
                          {property.title} <br /> {property.location.city}
                        </Popup>
                      </Marker>
                    </MapContainer>

                    <div className="absolute bottom-4 left-4 z-[999]">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${property.location.latitude},${property.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-gray-900 flex items-center hover:bg-gray-50 transition"
                      >
                        Open in Google Maps{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Preserved Card Style) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              {/* Contact Card */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {property.seller_id?.profile_image ? (
                      <img
                        src={getImageUrl(property.seller_id.profile_image)}
                        alt="Seller"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-extrabold tracking-widest mb-1">
                      Listed By
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">
                      {property.seller_id?.name || "Verified Seller"}
                    </h3>
                    <div className="flex items-center text-yellow-500 text-xs font-medium">
                      ★★★★★ <span className="text-gray-400 ml-1">(4.9)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm text-gray-600 text-center px-4">
                    Interested in this property? <br /> Connect directly with
                    the seller.
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppClick}
                  disabled={enquiryLoading || property.isSold}
                  className={`w-full font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg ${
                    property.isSold
                      ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none"
                      : "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-green-100"
                  }`}
                >
                  {property.isSold ? (
                    "Property Sold Out"
                  ) : enquiryLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Enquiry
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* More From Developer */}
        {moreProperties.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                More Properties
              </h2>
              <Link
                to="/properties"
                className="text-blue-600 font-bold hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {moreProperties.map((prop) => (
                <div
                  key={prop._id}
                  onClick={() => navigate(`/properties/${prop._id}`)}
                  className="relative h-[500px] rounded-2xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  {/* Background Image */}
                  <img
                    src={getImageUrl(prop.images?.[0]?.image_url)}
                    alt={prop.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

                  {/* Top Left Badges */}
                  <div className="absolute top-5 left-5 flex flex-col gap-2 items-start z-10">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {prop.view_count || 0}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
                      Negotiable
                    </span>
                  </div>

                  {/* Wishlist Button - Top Right */}
                  <div className="absolute top-5 right-5 z-20">
                    <WishlistButton propertyId={prop._id} />
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
                    <div className="mt-auto pointer-events-auto">
                      {/* Developer/Type Badge */}
                      <div className="bg-white text-gray-900 text-[10px] font-bold px-2 py-1 inline-block rounded-sm mb-3 capitalize tracking-widest">
                        {prop.property_type}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 leading-tight text-white drop-shadow-md line-clamp-2">
                        {prop.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-gray-300 text-xs mb-4 font-medium tracking-wide">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        <span className="truncate uppercase">
                          {typeof prop.location === "string"
                            ? prop.location
                            : `${prop.location?.city || ""}, ${prop.location?.state || ""}`}
                        </span>
                      </div>

                      {/* Attributes Divider */}
                      <div className="w-full h-px bg-white/20 mb-4" />

                      {/* Price Section */}
                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                          Launch Price
                        </p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                          ₹ {prop.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppClick(e, prop); // Re-using existing handler if adapted or creating new inline
                        }}
                        className="w-full bg-white hover:bg-[#e7e5f4] text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.98] opacity-90 group-hover:opacity-100 duration-300"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-[#25D366]"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
