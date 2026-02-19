import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { User, ArrowRight, Building2, Phone, ShieldCheck, Star } from "lucide-react";
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

    // CHANGED: Background is now #f9fafb (Tailwind's bg-gray-50)
    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 relative overflow-hidden">
            
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* --- HERO SECTION (Wrapped in a single white card) --- */}
                <div className="bg-white rounded-[24px] shadow-sm p-8 lg:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
                    <div className="md:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4 tracking-tight">
                            Find Your {businessType?.name || "Agent"}
                        </h1>
                        
                        <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-xl">
                            Connect with the most responsive professionals with <span className="font-bold italic text-slate-900">up-to-date expertise</span> and top accuracy on the properties you are looking for.
                        </p>
                        
                        <div className="inline-block border border-[#d4af37]/60 text-[#b58900] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-default">
                            Showing {users.length} Verified Professionals
                        </div>
                    </div>
                    
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
                    <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
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
                            >
                                {/* --- ENTIRE CARD IS NOW CLICKABLE --- */}
                                <Link 
                                    to={`/properties/user/${user._id}`}
                                    className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 flex h-[180px] sm:h-[200px] overflow-hidden border border-gray-100 cursor-pointer block group"
                                >
                                    
                                    {/* Left Panel: Deep Blue Background + Image */}
                                    <div className="w-[120px] sm:w-[150px] shrink-0 relative bg-[#0a2342] flex justify-center items-end overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-bl-[100px] pointer-events-none"></div>
                                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#d4af37] rounded-full blur-2xl opacity-30 pointer-events-none"></div>

                                        {user.profile_image ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`}
                                                alt={user.name}
                                                className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="relative z-10 h-full w-full flex items-center justify-center bg-gradient-to-t from-[#0a2342] to-[#174685] text-white/40 font-light text-5xl">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Panel: Agent Details */}
                                    <div className="flex-1 p-4 sm:p-5 flex flex-col bg-white relative">
                                        
                                        {/* Top Right Verified Shield */}
                                        <div className="absolute top-4 right-4 text-[#d4af37] bg-yellow-50/50 p-1.5 rounded-lg border border-yellow-100/50 hidden sm:block">
                                            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                                        </div>

                                        {/* Name & Role */}
                                        <div className="mb-3">
                                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 truncate pr-8 group-hover:text-[black] transition-colors">
                                                {user.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-500 underline decoration-slate-200 underline-offset-4 font-medium truncate">
                                                {user.businessType?.name || businessType?.name || "Professional"}
                                            </p>
                                        </div>

                                        {/* "VERIFIED" & Rating Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <div className="bg-[#174685] text-white text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wide">
                                                <Star className="w-3 h-3 text-[#d4af37] fill-current" /> VERIFIED
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                                                <Star className="w-3 h-3 text-[#d4af37] fill-current" /> 5.0
                                            </div>
                                        </div>

                                        {/* Actions Row (Pills) */}
                                        <div className="mt-auto flex flex-wrap gap-2">
                                            {user.phone ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation(); // Prevents clicking the card link
                                                        window.open(`https://wa.me/${user.phone}`, '_blank');
                                                    }}
                                                    className="bg-[#f0f5ff] text-[#174685] text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-[#e5efff] transition-colors border border-blue-100/50 relative z-20"
                                                >
                                                    <Phone className="w-3 h-3" /> WhatsApp
                                                </button>
                                            ) : (
                                                <button disabled className="bg-slate-50 text-slate-400 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 border border-slate-100 cursor-not-allowed relative z-20">
                                                    <Phone className="w-3 h-3" /> No Phone
                                                </button>
                                            )}

                                            <div className="bg-[#f0f5ff] text-[#174685] text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 border border-blue-100/50 group-hover:bg-[#174685] group-hover:text-white transition-colors">
                                                Profile <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessUserList;