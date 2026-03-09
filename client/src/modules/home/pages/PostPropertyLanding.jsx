import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { PostPropertyRoute } from "../routes/PostPropertyRoute";

const PostPropertyLanding = () => {
    const { isAuthenticated, setLoginModalOpen, user } = useAuth();
    const { propertyCategories = ["Sell", "Rent"], propertyTypes = [], isLoading } = useNav();
    const navigate = useNavigate();
    const nextSectionRef = useRef(null);

    // Derive usageTypes from propertyTypes
    const usageTypes = [...new Set(propertyTypes.map(t => t.usageType))];

    const [selectedCategory, setSelectedCategory] = useState("Rent");
    const [selectedType, setSelectedType] = useState("Residential");
    const [selectedSubtype, setSelectedSubtype] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Effects to sync initial selections when data loads
    React.useEffect(() => {
        if (propertyCategories.length > 0 && !propertyCategories.includes(selectedCategory)) {
            setSelectedCategory(propertyCategories[0]);
        }
    }, [propertyCategories, selectedCategory]);

    React.useEffect(() => {
        if (usageTypes.length > 0 && !usageTypes.includes(selectedType)) {
            setSelectedType(usageTypes[0]);
        }
    }, [usageTypes, selectedType]);

    const filteredSubtypes = propertyTypes.filter(t => t.usageType === selectedType);

    React.useEffect(() => {
        if (filteredSubtypes.length > 0) {
            setSelectedSubtype(filteredSubtypes[0].name);
        }
    }, [selectedType, propertyTypes]);

    // Auto-redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && user) {
            const role =
                user?.role_id?.role_name?.toUpperCase() ||
                user?.role?.name?.toUpperCase();
            if (role === "ADMIN") {
                navigate("/admin/properties/add");
            } else if (role === "SELLER") {
                navigate("/seller/add-property");
            } else {
                navigate("/add-property");
            }
        }
    }, [isAuthenticated, user, navigate]);

    const benefits = [
        "Post your property listing for free",
        "Reach genuine buyers and tenants quickly",
        "Get shortlisted buyers and tenants",
        "Assistance in co-ordinating site visits"
    ];

    const handleStartNow = () => {
        if (!isAuthenticated) {
            setLoginModalOpen(true);
        } else {
            // Redirect based on role
            const role =
                user?.role_id?.role_name?.toUpperCase() ||
                user?.role?.name?.toUpperCase();
            if (role === "ADMIN") {
                navigate("/admin/properties/add");
            } else if (role === "SELLER") {
                navigate("/seller/add-property");
            } else {
                navigate("/add-property");
            }
        }
    };

    const handlePhoneClick = () => {
        if (!isAuthenticated) {
            setLoginModalOpen(true);
        }
    };

    return (
        <div id="post-property-landing" className="mt-12 min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-[#f1f7ff] pt-19 pb-24 px-4 border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Left Side: Content */}
                    <div className="lg:w-1/2 text-left space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl lg:text-4xl font-bold text-[#333333] leading-tight">
                                Sell or Rent Property <br />
                                <span className="text-[#0056b3]">online faster with NammaPondy</span>
                            </h1>

                            <ul className="mt-8 space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center text-lg text-[#555555]">
                                        <div className="bg-[#e6f4ea] p-1 rounded-full mr-3 text-[#1aa554]">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* UPDATED: Illustration Image with Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative hidden lg:block"
                        >
                            <motion.img
                                src="/post/post1.png"
                                alt="Post Property Illustration"
                                className="max-w-lg object-contain mix-blend-multiply"

                            />
                        </motion.div>
                    </div>

                    {/* Right Side: Posting Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="lg:w-[450px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#333333] mb-2">
                            Start posting your property, <span className="text-[#0056b3] text-lg font-medium italic">it's free</span>
                        </h2>
                        <p className="text-sm text-[#777777] mb-8">Add Basic Details</p>

                        <div className="space-y-8">
                            {/* Looking to select */}
                            <div>
                                <p className="text-sm font-semibold text-[#555555] mb-4">You're looking to ...</p>
                                <div className="flex flex-wrap gap-3">
                                    {propertyCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${selectedCategory === cat
                                                ? "bg-[#0056b3] text-white border-[#0056b3] shadow-md"
                                                : "bg-white text-[#555555] border-gray-200 hover:border-[#0056b3]"
                                                }`}
                                        >
                                            <span className="capitalize">{cat}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type selection */}
                            <div>
                                <p className="text-sm font-semibold text-[#555555] mb-4">And it's a ...</p>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {usageTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-6 py-2 rounded-xl border transition-all text-sm font-medium ${selectedType === type
                                                ? "bg-[#0056b3] text-white border-[#0056b3] shadow-md"
                                                : "bg-white text-[#555555] border-gray-200 hover:border-[#0056b3]"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {filteredSubtypes.map((sub) => (
                                        <button
                                            key={sub._id}
                                            onClick={() => setSelectedSubtype(sub.name)}
                                            className={`px-4 py-1.5 rounded-full border transition-all text-[13px] ${selectedSubtype === sub.name
                                                ? "bg-blue-50 text-[#0056b3] border-[#0056b3] font-medium"
                                                : "bg-white text-[#555555] border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                    {filteredSubtypes.length > 5 && (
                                        <button className="px-4 py-1.5 rounded-full border border-gray-200 text-[#0056b3] text-[13px] font-medium hover:bg-blue-50 transition-colors">
                                            + more
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div>
                                <p className="text-sm font-semibold text-[#555555] mb-4">Your contact details for the buyer to reach you</p>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={isAuthenticated ? user?.phone : phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        onClick={handlePhoneClick}
                                        readOnly={isAuthenticated}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0056b3] focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                    />
                                    {!isAuthenticated && (
                                        <div className="absolute inset-0 cursor-pointer" onClick={handlePhoneClick}></div>
                                    )}
                                </div>
                                {!isAuthenticated && (
                                    <p className="mt-3 text-xs text-[#777777]">
                                        Are you a registered user? <button onClick={() => setLoginModalOpen(true)} className="text-[#0056b3] font-bold hover:underline">Login</button>
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            {/* <button
                                onClick={handleStartNow}
                                className="w-full py-4 bg-[#0056b3] hover:bg-[#004494] text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Start now
                            </button> */}
                        </div>
{/* 
                        <p className="mt-6 text-center text-[11px] text-[#999999] px-4">
                            * Available with Owner Assist Plans. By clicking Start now, you agree to our Terms & Conditions.
                        </p> */}
                    </motion.div>
                </div>

                {/* Know More Button */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: 1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-white px-8 py-3 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.1)] border border-gray-100 text-[#333333] text-[15px] font-medium hover:shadow-xl transition-all group"
                        onClick={() => {
                            nextSectionRef.current?.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }}
                    >
                        Know More
                        <ChevronDown className="w-4 h-4 text-[#0056b3] group-hover:translate-y-0.5 transition-transform" />
                    </motion.button>
                </div>
            </div>

            {/* Post Property Sections */}
            <div ref={nextSectionRef} className="relative z-10 w-full">
                <PostPropertyRoute />
            </div>

        </div>
    );
};

export default PostPropertyLanding;