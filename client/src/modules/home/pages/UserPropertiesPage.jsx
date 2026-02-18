import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { User, MapPin, Phone, Mail, CheckCircle, Store, Building2 } from "lucide-react";
import PropertyCard from "@/modules/home/components/PropertyCard";
import { toast } from "react-hot-toast";

const UserPropertiesPage = () => {
    const { userId } = useParams();
    const [properties, setProperties] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User Details
                const userRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/public-user/${userId}`,
                );
                setUser(userRes.data);

                // Fetch Properties by this User
                const propertiesRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?seller_id=${userId}`,
                );
                console.log("Properties response:", propertiesRes.data); // Debugging
                // Handle different response structures gracefully
                if (Array.isArray(propertiesRes.data)) {
                    setProperties(propertiesRes.data);
                } else if (propertiesRes.data.properties && Array.isArray(propertiesRes.data.properties)) {
                    setProperties(propertiesRes.data.properties);
                } else {
                    setProperties([]);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleWhatsAppClick = (e, property) => {
        e.stopPropagation();
        // If user is logged in logic can be added here, but for public profile interactions:
        const sellerPhone = user?.phone || "919000000000";
        const locationStr =
            typeof property.location === "string"
                ? property.location
                : `${property.location?.city || ""}, ${property.location?.state || ""}`;
        const message = `Hi ${user?.name}, I am interested in your property: ${property.title} located at ${locationStr}.`;
        const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleProfileContact = () => {
        const sellerPhone = user?.phone || "";
        if (sellerPhone) {
            const whatsappUrl = `https://wa.me/${sellerPhone}`;
            window.open(whatsappUrl, "_blank");
        } else {
            toast.error("Contact number not available");
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* --- HERO BANNER --- */}
            <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
                {/* Abstract shapes or pattern */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-bottom-left"></div>
                {/* You could add a real background image here if available */}
                {/* <img src="..." className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" /> */}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 z-10">
                {/* --- PROFILE CARD --- */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

                    {/* Left: Image & Quick Actions */}
                    <div className="md:w-1/3 lg:w-1/4 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-gray-100 relative">
                        <div className="relative h-40 w-40 rounded-full p-1 bg-white shadow-lg mb-4">
                            <div className="h-full w-full rounded-full overflow-hidden relative">
                                {user?.profile_image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-5xl">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {user?.isVerified && (
                                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Professional">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        <div className="text-center w-full">
                            <button
                                onClick={handleProfileContact}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Phone className="w-4 h-4" /> Contact
                            </button>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="md:w-2/3 lg:w-3/4 p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif tracking-tight">
                                    {user?.name}
                                </h1>
                                <div className="flex items-center gap-3 text-gray-500 text-sm md:text-base mb-4">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                                        {user?.businessType?.name ? <Store className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                        {user?.businessType?.name || user?.role_id?.name || "Seller"}
                                    </span>
                                    {user?.email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats (Optional placeholder) */}
                            <div className="flex gap-6 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Properties</p>
                                </div>
                                {/* <div>
                          <p className="text-2xl font-bold text-gray-900">4.9</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rating</p>
                      </div> */}
                            </div>
                        </div>

                        <div className="h-px w-full bg-gray-100 mb-6"></div>

                        <div className="prose prose-sm text-gray-600 max-w-none">
                            <p>
                                Welcome to my verified property portfolio. Browse through the exclusive listings below and feel free to contact me directly for any inquiries or to schedule a site visit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- PROPERTIES GRID --- */}
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-slate-400" />
                            Available Listings
                        </h2>
                        <span className="text-gray-500 text-sm font-medium bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                            {properties.length} Properties Found
                        </span>
                    </div>

                    {properties.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No properties listed yet</h3>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                                This verified professional hasn't added any active property listings at the moment. Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    onWhatsAppClick={handleWhatsAppClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPropertiesPage;
