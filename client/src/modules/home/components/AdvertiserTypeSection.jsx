import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Users } from "lucide-react";
import { useNav } from "../../../context/NavContext";

const AdvertiserTypeSection = () => {
    const navigate = useNavigate();
    const { businessTypes = [] } = useNav();

    // --- NEW: Dynamically load the "Outfit" font ---
    useEffect(() => {
        const fontLinkId = "google-font-outfit";
        if (!document.getElementById(fontLinkId)) {
            const link = document.createElement("link");
            link.id = fontLinkId;
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
            document.head.appendChild(link);
        }
    }, []);

    // Determine the main avatar icon based on name
    const getAvatarIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("dealer") || lowerName.includes("agent")) {
            // CHANGED: Blue icon to Gold
            return <Users className="w-8 h-8 text-[#c19b48] mt-2" />;
        }
        // CHANGED: Blue icon to Gold
        return <User className="w-8 h-8 text-[#c19b48] mt-2" />;
    };

    const displayTypes = businessTypes.slice(0, 4);

    if (displayTypes.length === 0) return null;

    return (
        // CHANGED: Added font-['Outfit',_sans-serif] to the wrapper
        <section className="py-15 px-4 bg-white font-['Outfit',_sans-serif]">
            {/* <div className="w-full max-w-5xl mr-auto lg:ml-62"> */}
            <div className="w-full max-w-5xl mx-auto">
                
                {/* Main Card Container */}
                {/* CHANGED: Background updated from Beige to the theme's soft light gray/cyan (#f6f9fa) */}
                <div className="bg-[#d7f2e3] rounded-[24px] flex flex-col lg:flex-row items-center p-8 lg:p-0 lg:pl-16 relative mb-12 lg:mb-16">
                    
                    {/* Left Side: Branding / Title */}
                    <div className="lg:w-1/2 py-8 lg:py-20 w-full flex flex-col items-start text-left">
                        
                        {/* Graphic: Bars + House */}
                        <div className="flex items-end gap-2 mb-8">
                            {/* CHANGED: Orange Bar to Navy */}
                            <div className="w-5 h-16 bg-[#0e182b] rounded-sm"></div>
                            {/* CHANGED: Yellow Bar to Gold */}
                            <div className="w-5 h-10 bg-[#c19b48] rounded-sm"></div>
                            {/* CHANGED: Blue Solid House to Gold */}
                            <div className="ml-1 text-[#c19b48]">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                </svg>
                            </div>
                        </div>

                        {/* CHANGED: Heading text color to Deep Navy */}
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0e182b] leading-tight mb-2">
                            Properties <br /> posted by
                        </h2>
                        {/* CHANGED: Subtext color to Slate Blue */}
                        <p className="text-[#38526e] text-base font-medium">
                            Choose type of lister
                        </p>
                    </div>

                    {/* Right Side: Information Card */}
                    <div className="lg:w-1/2 w-full flex justify-center lg:justify-end lg:pr-8">
                        
                        {/* Overlapping White Card */}
                        <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgb(14,24,43,0.06)] p-8 lg:p-10 w-full max-w-[480px] border border-gray-100/50 transform lg:translate-y-12 lg:translate-x-4 mt-8 lg:mt-0">
                            
                            <div className="mb-8">
                                {/* CHANGED: Title color to Deep Navy */}
                                <h3 className="text-2xl font-bold text-[#0e182b] mb-1">
                                   Choose type of property lister
                                </h3>
                                {/* CHANGED: Subtitle color to Slate Blue */}
                                <p className="text-[15px] text-[#38526e]">
                                   Browse your listing category
                                </p>
                            </div>

                            <div className="space-y-4">
                                {displayTypes.map((type) => {
                                    const id = type._id?.toString() || type.name;
                                    const name = typeof type.name === "string" ? type.name : type.name?.name || "Unknown";

                                    return (
                                        <div
                                            key={id}
                                            onClick={() => navigate(`/business-user-list/${id}`)}
                                            className="group flex items-center justify-between py-3 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-5">
                                                {/* Avatar with House Badge */}
                                                <div className="relative">
                                                    {/* Person Avatar Background */}
                                                    <div className="w-12 h-12 overflow-hidden flex items-start justify-center bg-[#f6f9fa] rounded-full border border-gray-100">
                                                        {getAvatarIcon(name)}
                                                    </div>
                                                    
                                                    {/* Tiny Badge */}
                                                    {/* CHANGED: Background and Icon colors updated to fit the Navy/Gold theme */}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0e182b] rounded-full flex items-center justify-center border-[1.5px] border-white z-10">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#c19b48" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div>
                                                    {/* CHANGED: Text to Navy, Hover state to Gold */}
                                                    <h4 className="text-[17px] font-bold text-[#0e182b] group-hover:text-[#c19b48] transition-colors capitalize">
                                                        {name}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Arrow Icon */}
                                            {/* CHANGED: Arrow color to Navy, Hover state to Gold */}
                                            <div className="text-[#0e182b] group-hover:text-[#c19b48] transition-transform transform group-hover:translate-x-1">
                                                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdvertiserTypeSection;