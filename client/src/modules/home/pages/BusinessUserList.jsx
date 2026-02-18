import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { User, ArrowRight, Building2, Phone } from "lucide-react";
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10">
            {/* --- CONTENT SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {businessType?.name || "Professionals"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Showing {users.length} verified professionals
                    </p>
                </div>

                {users.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No professionals found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            There are currently no {businessType?.name?.toLowerCase()}s registered.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {users.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 h-full relative group">
                                    <div className="relative mb-4">
                                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 group-hover:ring-indigo-500 transition-all duration-300">
                                            {user.profile_image ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-2xl">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 border-2 border-white rounded-full" title="Available"></div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {user.businessType?.name || businessType?.name || "Professional"}
                                    </p>

                                    {/* Actions */}
                                    <div className="w-full mt-auto grid grid-cols-2 gap-3">
                                        {user.phone ? (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open(`https://wa.me/${user.phone}`, '_blank');
                                                }}
                                                className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-green-600 hover:border-green-500 transition-all text-sm font-medium"
                                            >
                                                <Phone className="w-4 h-4" /> Chat
                                            </button>
                                        ) : (
                                            <button disabled className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 text-gray-300 rounded-lg cursor-not-allowed text-sm font-medium">
                                                <Phone className="w-4 h-4" /> Chat
                                            </button>
                                        )}

                                        <Link
                                            to={`/properties/user/${user._id}`}
                                            className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-sm"
                                        >
                                            Profile <ArrowRight className="w-4 h-4" />
                                        </Link>
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
