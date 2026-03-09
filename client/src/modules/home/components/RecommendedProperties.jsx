import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation as useRouteLocation } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useLocation as useAppLocation } from "../../../context/LocationContext";
import PropertyCard from "./PropertyCard";
import PhoneUpdateModal from "../../../components/Common/PhoneUpdateModal";

const RecommendedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { city, loading: locationLoading } = useAppLocation();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const navigate = useNavigate();
    const location = useRouteLocation();

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                // 1. Try with location
                let url = `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?isVerified=true&limit=6`;
                if (city && city !== "Pondicherry") {
                    url += `&location=${encodeURIComponent(city)}`;
                }

                const res = await axios.get(url);
                let fetched = res.data.properties || res.data || [];

                // 2. Fallback: If empty and we used a location, try without location
                if (fetched.length === 0 && city && city !== "Pondicherry") {
                    const fallbackRes = await axios.get(`${import.meta.env.VITE_API_URL}/properties/fetch-all-property?isVerified=true&limit=6`);
                    fetched = fallbackRes.data.properties || fallbackRes.data || [];
                }

                setProperties(fetched);
            } catch (error) {
                console.error("Error fetching recommended properties", error);
            } finally {
                setLoading(false);
            }
        };

        if (!locationLoading) {
            fetchProperties();
        }
    }, [city, locationLoading]);

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
        const sellerPhone = property.seller.phone;
        const locationStr =
            typeof property.location === "string"
                ? property.location
                : `${property.location?.city || ""}, ${property.location?.state || ""}`;
        const message = `Hi, I am interested in your property: ${property.basicInfo?.title || "Untitled"} located at ${locationStr}. Please provide more details.`;
        const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/enquiries/create`, {
                property_id: property._id,
                seller_id: property.seller._id,
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

    if (loading || locationLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[4/3] bg-gray-100 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (properties.length === 0) {
        return null;
    }

    const hasNoLocalMatches = city && !properties.some(p =>
        (p.location?.city?.toLowerCase().includes(city.toLowerCase())) ||
        (p.location?.locality?.toLowerCase().includes(city.toLowerCase()))
    );

    return (
        <section className="py-16">
            <div className="mx-auto max-w-[1400px] px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="mb-6">
                            <h2 className="text-[28px] font-bold text-[#1E293B]">
                                {hasNoLocalMatches ? "Recommended for You" : (
                                <>Recommended In <span className="text-[#166aa8] font-semibold">{city}</span></>
                            )}
                            </h2>
                            <p className="text-[15px] text-[#64748B] mt-1">
                                {hasNoLocalMatches
                                ? "Handpicked properties for you since we couldn't find matches in your exact area."
                                : `Explore the best deals currently available in ${city}.`
                            }
                            </p>
                        </div>
                    </div>
                    <Link
                        to={`/properties?location=${encodeURIComponent(city)}`}
                        className="hidden md:flex items-center text-gray-900 font-semibold hover:text-blue-600 transition"
                    >
                        View All in {city} <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property._id}
                            property={property}
                            onWhatsAppClick={handleWhatsAppClick}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to={`/properties?location=${encodeURIComponent(city)}`}
                        className="inline-flex items-center text-gray-900 font-semibold hover:text-blue-600"
                    >
                        View All in {city} <ArrowRight className="w-5 h-5 ml-1" />
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
