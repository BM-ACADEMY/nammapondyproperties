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
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
import { toast } from "react-hot-toast";
import LoginModal from "../../../components/Auth/LoginModal";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";
import { recordPropertyView } from "../../../utils/propertyViewTracker";
// Ensure AntD is installed, or use custom modal. The user has AntD.

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [moreProperties, setMoreProperties] = useState([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  // Helper to get user from local storage or context (quick fix without importing context everywhere if complex)
  // Ideally use useAuth()
  // Ideally use useAuth()
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

        // Fetch seller stats/more properties (placeholder logic for now, or new endpoint)
        // We'll fetch all and filter by seller on client for now or add endpoint later
        // Just fetching featured for "More from Developer" placeholder
        const relatedRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?limit=4`,
        );
        if (Array.isArray(relatedRes.data.properties)) {
          setMoreProperties(
            relatedRes.data.properties.filter((p) => p._id !== id),
          );
        }

        // Record property view (with daily uniqueness check)
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
      // Logged in user, proceed directly
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!property)
    return (
      <div className="flex justify-center items-center h-screen">
        Property Not Found
      </div>
    );

  const getImageUrl = (path) =>
    path
      ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${path}`
      : "https://placehold.co/800x600";

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/properties" className="hover:text-blue-600">
            Properties
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium truncate">
            {property.title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Images & Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-[400px] md:h-[500px] relative bg-gray-200">
                <img
                  src={getImageUrl(mainImage)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  {property.status.toUpperCase()}
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <WishlistButton propertyId={property._id} />
                </div>
              </div>
              {/* Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img.image_url)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${mainImage === img.image_url ? "border-blue-600" : "border-transparent"}`}
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

            {/* Title & Price (Mobile/Main view) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    {typeof property.location === "string"
                      ? property.location
                      : `${property.location?.city || ""}, ${property.location?.state || ""}`}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ₹ {property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Launch Price</div>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    Property Type
                  </div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <Home className="w-4 h-4 mr-2 text-blue-500" />
                    {property.property_type}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Area Size</div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <Square className="w-4 h-4 mr-2 text-blue-500" />
                    {property.area_size || "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {property.status}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Approval</div>
                  <div className="font-semibold text-gray-800 flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full border border-blue-500 flex items-center justify-center text-[10px] text-blue-500 font-bold">
                      ✓
                    </div>
                    {property.approval || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Key Attributes */}
            {property.key_attributes && property.key_attributes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                  {property.key_attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-gray-100 pb-2 last:border-0"
                    >
                      <span className="text-gray-600">{attr.key}</span>
                      <span className="font-medium text-gray-900">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Map Section */}
            {property?.location?.latitude && property?.location?.longitude && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  Location
                </h3>
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-100 mb-2">
                  <MapContainer
                    center={[property.location.latitude, property.location.longitude]}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[property.location.latitude, property.location.longitude]}
                    >
                      <Popup>
                        {property.title} <br /> {property.location.city}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.location.latitude},${property.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-blue-600 font-medium text-sm hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                  {property.seller_id?.profile_image ? (
                    <img
                      src={getImageUrl(property.seller_id.profile_image)}
                      alt="Seller"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    Developer / Seller
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {property.seller_id?.name || "Verified Seller"}
                  </h3>
                  <div className="flex items-center text-yellow-500 text-xs">
                    ★★★★★ <span className="text-gray-400 ml-1">(Verified)</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6 text-center">
                Contact us to get more details, brochure, or schedule a site
                visit.
              </p>

              <button
                onClick={handleWhatsAppClick}
                disabled={enquiryLoading}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-green-100"
              >
                {enquiryLoading ? (
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
              <div className="text-center mt-3 text-xs text-gray-400">
                Response time: Usually within 1 hour
              </div>
            </div>



          </div>
        </div>

        {/* More From Developer */}
        {moreProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {moreProperties.map((prop) => (
                <Link
                  to={`/properties/${prop._id}`}
                  key={prop._id}
                  className="block group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                    <div className="h-48 relative">
                      <img
                        src={getImageUrl(prop.images?.[0]?.image_url)}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-blue-900">
                        {prop.property_type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">
                        {prop.title}
                      </h3>
                      <p className="text-blue-600 font-bold mt-1">
                        ₹ {prop.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
