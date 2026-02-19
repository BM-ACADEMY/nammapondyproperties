import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { User, ArrowRight, Building2, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const BusinessUserList = () => {
    const { businessTypeId } = useParams();
    const [users, setUsers] = useState([]);
    const [businessType, setBusinessType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Business Type Details
                const typeRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/business-types/${businessTypeId}`
                );
                setBusinessType(typeRes.data);

                // Fetch Users with this Business Type
                const usersRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/public-users?businessType=${businessTypeId}`
                );
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (businessTypeId) {
            fetchData();
        }
    }, [businessTypeId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5ff] via-[#e5efff] to-[#f0f5ff] font-sans pb-20 pt-10 relative overflow-hidden">
            
            {/* Optional subtle background glow for that "sparkle" effect */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* --- HERO SECTION (Wrapped in a single white card) --- */}
                <div className="bg-white rounded-[24px] shadow-sm p-8 lg:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="md:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                            Find Your {businessType?.name || "Agent"}
                        </h1>
                        <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
                            Connect with the most responsive professionals with <strong>up-to-date expertise</strong> and top accuracy on the properties you are looking for.
                        </p>
                        <div className="inline-block bg-[#3b5998] text-white px-6 py-3 rounded-lg font-semibold shadow-sm cursor-default text-sm">
                            Showing {users.length} Verified Professionals
                        </div>
                    </div>
                    
                    {/* Hero Illustration - Attached seamlessly without card effects */}
                    <div className="md:w-1/2 flex justify-end">
                        <img 
                            src="/agent.png" 
                            alt="Professionals" 
                            className="w-full max-w-lg object-contain"
                        />
                    </div>
                </div>

                {/* --- CONTENT SECTION --- */}
                {users.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-white/50 backdrop-blur-sm">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-[#3b5998]" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No professionals found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            There are currently no {businessType?.name?.toLowerCase() || 'professional'}s registered.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {users.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                {/* Horizontal Card Layout */}
                                <div className="bg-white rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-8 flex flex-col sm:flex-row gap-8 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300 relative h-full">
                                    
                                    {/* Left: Profile Image */}
                                    <div className="shrink-0 flex justify-center sm:justify-start">
                                        <div className="h-[120px] w-[120px] rounded-full overflow-hidden bg-gray-50 border-4 border-white shadow-md relative">
                                            {user.profile_image ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-[#3b5998] font-bold text-4xl">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: User Details & Actions */}
                                    <div className="flex-1 flex flex-col text-center sm:text-left h-full">
                                        
                                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-1">
                                            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                                {user.name}
                                                <ShieldCheck className="w-6 h-6 text-[#3b5998]" fill="currentColor" />
                                            </h3>
                                        </div>
                                        
                                        <p className="text-slate-500 mb-6 flex items-center justify-center sm:justify-start gap-1">
                                            <Building2 className="w-4 h-4" />
                                            {user.businessType?.name || businessType?.name || "Professional"}
                                        </p>

                                        {/* Actions */}
                                        <div className="mt-auto flex flex-wrap justify-center sm:justify-start gap-3">
                                            {user.phone ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(`https://wa.me/${user.phone}`, '_blank');
                                                    }}
                                                    className="flex items-center gap-2 py-2 px-4 bg-[#3b5998] text-white rounded-lg hover:bg-[#2d4373] transition-colors text-sm font-bold shadow-sm"
                                                >
                                                    <Phone className="w-4 h-4" /> WhatsApp
                                                </button>
                                            ) : (
                                                <button disabled className="flex items-center gap-2 py-2 px-4 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-bold">
                                                    <Phone className="w-4 h-4" /> No Phone
                                                </button>
                                            )}

                                            <Link
                                                to={`/properties/user/${user._id}`}
                                                className="flex items-center gap-2 py-2 px-4 bg-[#f0f2f5] text-slate-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
                                            >
                                                View Profile <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessUserList;