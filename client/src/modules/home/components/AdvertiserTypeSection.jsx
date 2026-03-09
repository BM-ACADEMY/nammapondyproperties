import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Users } from "lucide-react";
import { useNav } from "../../../context/NavContext";

const AdvertiserTypeSection = () => {
    const navigate = useNavigate();
    const { businessTypes = [] } = useNav();

    // Determine the main avatar icon based on name
    const getAvatarIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("dealer") || lowerName.includes("agent")) {
            return <Users className="w-8 h-8 text-[#166aa8] mt-2" />;
        }
        return <User className="w-8 h-8 text-[#166aa8] mt-2" />;
    };

    const displayTypes = businessTypes.slice(0, 4);

    if (displayTypes.length === 0) return null;

    return (
        <section className="py-15 px-4 bg-white">
            {/* 
              Changed 'container mx-auto' to 'w-full max-w-5xl mr-auto lg:ml-12' 
              This forces the block to align to the left side of the page 
            */}
            <div className="w-full max-w-5xl mr-auto lg:ml-62">
            {/* <div className="w-full max-w-5xl mx-auto"> */}
                
                {/* Main Beige Card Container */}
                <div className="bg-[#FFF8EC] rounded-[24px] flex flex-col lg:flex-row items-center p-8 lg:p-0 lg:pl-16 relative mb-12 lg:mb-16">
                    
                    {/* Left Side: Branding / Title */}
                    <div className="lg:w-1/2 py-8 lg:py-20 w-full flex flex-col items-start text-left">
                        
                        {/* Graphic: Bars + House */}
                        <div className="flex items-end gap-2 mb-8">
                            {/* Orange Bar */}
                            <div className="w-5 h-16 bg-[#FDBA74] rounded-sm"></div>
                            {/* Yellow Bar */}
                            <div className="w-5 h-10 bg-[#FEF08A] rounded-sm"></div>
                            {/* Blue Solid House */}
                            <div className="ml-1 text-[#166aa8]">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0B1727] leading-tight mb-2">
                            Properties <br /> posted by
                        </h2>
                        <p className="text-[#64748B] text-base font-medium">
                            Choose type of lister
                        </p>
                    </div>

                    {/* Right Side: Information Card */}
                    <div className="lg:w-1/2 w-full flex justify-center lg:justify-end lg:pr-8">
                        
                        {/* Overlapping White Card */}
                        <div className="bg-white rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] p-8 lg:p-10 w-full max-w-[480px] border border-gray-50 transform lg:translate-y-12 lg:translate-x-4 mt-8 lg:mt-0">
                            
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-[#0B1727] mb-1">
                                   Choose type of property lister
                                </h3>
                                <p className="text-[15px] text-[#64748B]">
                                   Browse your listing category
                                </p>
                            </div>

                            <div className="space-y-4">
                                {displayTypes.map((type) => {
                                    const id = type._id?.toString() || type.name;
                                    const name = typeof type.name === "string" ? type.name : type.name?.name || "Unknown";
                                    // const mockCount = Math.floor(Math.random() * 20) + 3;

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
                                                    <div className="w-12 h-12 overflow-hidden flex items-start justify-center">
                                                        {getAvatarIcon(name)}
                                                    </div>
                                                    
                                                    {/* Tiny Orange House Badge */}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FFEDD5] rounded-full flex items-center justify-center border-[1.5px] border-white z-10">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#F97316" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-[17px] font-bold text-[#0B1727] group-hover:text-[#166aa8] transition-colors capitalize">
                                                        {name}
                                                    </h4>
                                                    {/* <p className="text-sm text-[#94A3B8] font-medium">
                                                        {mockCount} Properties
                                                    </p> */}
                                                </div>
                                            </div>

                                            {/* Arrow Icon */}
                                            <div className="text-[#0B1727] group-hover:text-[#166aa8] transition-transform transform group-hover:translate-x-1">
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