import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, ArrowRight, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import LoginModal from "../../../components/Auth/LoginModal";
import WishlistButton from "../../../components/Common/WishlistButton";
import PropertyCard from "./PropertyCard";

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fetch only verified properties, limited to 6
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?is_verified=true&limit=6`,
        );
        if (Array.isArray(res.data.properties)) {
          setProperties(res.data.properties);
        } else if (Array.isArray(res.data)) {
          setProperties(res.data);
        }
      } catch (error) {
        console.error("Error fetching properties", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleWhatsAppClick = (e, property) => {
    e.stopPropagation();
    if (!property || !property.seller_id) {
      toast.error("Seller information missing");
      return;
    }

    if (user) {
      submitEnquiry(property, user.name, user.email, user.phone);
    } else {
      toast.error("Please login to contact the seller");
      navigate("/login", { state: { from: location.pathname } });
    }
  };

  const submitEnquiry = async (property, name, email, phone) => {
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
      toast.success("Enquiry sent! Opening WhatsApp...");
    } catch (error) {
      console.error(error);
      toast.error("Redirecting to WhatsApp...");
    } finally {
      window.open(whatsappUrl, "_blank");
      setEnquiryLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading Properties...
      </div>
    );

  return (
    <section className="py-16 bg-gray-50">
      <div className=" mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            {/* Gold Expertise Badge Style */}
            <div className="inline-block border border-[#d4af37]/60 text-[#b58900] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-white/40 shadow-sm cursor-default">
              Handpicked
            </div>
            
            {/* Elegant Typography Heading */}
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
              Featured Properties
            </h2>

            <p className="text-lg text-slate-500 mt-4 leading-relaxed">
              Check out our latest verified and premium listings.
            </p>
          </div>
          <Link
            to="/properties"
            className="hidden md:flex items-center text-gray-900 font-semibold hover:text-blue-600 transition"
          >
            View All Properties <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onWhatsAppClick={handleWhatsAppClick}
            />
          ))}
        </div>

        <div className="mt-8 text-center font-serif md:hidden">
          <Link
            to="/properties"
            className="inline-flex items-center text-gray-900 font-semibold hover:text-blue-600"
          >
            View All Properties <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
