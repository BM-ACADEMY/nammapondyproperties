import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUrl";
import { slugify } from "@/utils/slugify";

const AdminTeamSection = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/public-admins`);
                setAdmins(res.data);
            } catch (error) {
                console.error("Error fetching admins:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    if (loading || admins.length === 0) return null;

    return (
        <section className="py-12 bg-slate-50 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Direct Support</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                            Properties by <span className="text-blue-600">Namma Pondy Admin</span>
                        </h2>
                        <p className="text-slate-500 mt-3 text-lg">
                            Trusted listings directly managed and verified by our administration team.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {admins.map((admin) => (
                        <div 
                            key={admin._id}
                            onClick={() => navigate(`/business/administration/${admin.slug || admin._id}`)}
                            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
                        >
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative mb-5">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-50 group-hover:scale-105 transition-transform duration-500">
                                    {admin.profile_image ? (
                                        <img 
                                            src={getImageUrl(admin.profile_image)} 
                                            alt={admin.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-3xl font-bold">
                                            {admin.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
                                    <div className="bg-blue-600 p-1 rounded-full">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
                                    {admin.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
                                    Verified Admin
                                </p>
                                
                                <div className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                                    View Properties
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AdminTeamSection;
