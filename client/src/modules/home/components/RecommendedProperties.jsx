import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import HorizontalPropertyCard from "./HorizontalPropertyCard";
import PhoneUpdateModal from "../../../components/Common/PhoneUpdateModal";

const RecommendedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetch properties for recommendation (e.g., verified, limited to 4)
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?isVerified=true&limit=4`,
                );
                if (Array.isArray(res.data.properties)) {
                    setProperties(res.data.properties);
                } else if (Array.isArray(res.data)) {
                    setProperties(res.data);
                }
            } catch (error) {
                console.error("Error fetching recommended properties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const handleWhatsAppClick = (e, property) => {
        e.stopPropagation();
        if (!property || !property.seller) {
            toast.error("Seller information missing");
            return;
        }

        if (user) {
            if (!user.phone) {
                setSelectedProperty(property);
                setShowPhoneModal(true);
            } else {
                submitEnquiry(property, user.name, user.email, user.phone);
            }
        } else {
            toast.error("Please login to contact the seller");
            navigate("/login", { state: { from: location.pathname } });
        }
    };

    const submitEnquiry = async (property, name, email, phone) => {
        const sellerPhone = property.seller.phone || "919000000000";
        const locationStr =
            typeof property.location === "string"
                ? property.location
                : `${property.location?.city || ""}, ${property.location?.state || ""}`;
        const message = `Hi, I am interested in your property: ${property.basicInfo?.title || "Untitled"} located at ${locationStr}. Please provide more details.`;
        const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/enquiries/create`, {
                property_id: property._id,
                seller_id: property.seller._id || property.seller,
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
        }
    };

    if (loading) return null;
    if (properties.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
                            Recommended for You
                        </h2>
                        <p className="text-lg text-slate-500 mt-4 leading-relaxed">
                            Handpicked properties based on your interests.
                        </p>
                    </div>
                    <Link
                        to="/properties"
                        className="hidden md:flex items-center text-gray-900 font-semibold hover:text-blue-600 transition group"
                    >
                        Explore More <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                    {properties.map((property) => (
                        <HorizontalPropertyCard
                            key={property._id}
                            property={property}
                            onWhatsAppClick={handleWhatsAppClick}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link
                        to="/properties"
                        className="inline-flex items-center text-gray-900 font-semibold hover:text-blue-600 transition"
                    >
                        Explore More <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </div>

            <PhoneUpdateModal
                isOpen={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
                onSuccess={(updatedPhone) => {
                    if (user && selectedProperty) {
                        submitEnquiry(
                            selectedProperty,
                            user.name,
                            user.email,
                            updatedPhone,
                        );
                    }
                }}
            />
        </section>
    );
};

export default RecommendedProperties;
