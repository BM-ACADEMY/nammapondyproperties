import React from 'react';
import { ShieldCheck, Eye, Users, Zap } from 'lucide-react';

const AdditionalBenefitsInfo = () => {
    const benefits = [
        {
            id: 1,
            title: "Verified Property Listings",
            description: "Your property appears on a trusted platform that buyers rely on for authentic real estate opportunities.",
            icon: <ShieldCheck className="w-6 h-6 text-[#0078D7]" strokeWidth={2.5} />
        },
        {
            id: 2,
            title: "Maximum Visibility",
            description: "Your listing is systematically shown to thousands of individuals actively searching for properties daily.",
            icon: <Eye className="w-6 h-6 text-[#0078D7]" strokeWidth={2.5} />
        },
        {
            id: 3,
            title: "Direct Buyer Contact",
            description: "Facilitates transparent communication by allowing buyers to contact you directly without intermediaries.",
            icon: <Users className="w-6 h-6 text-[#0078D7]" strokeWidth={2.5} />
        },
        {
            id: 4,
            title: "Fast Property Exposure",
            description: "Your property goes live instantly upon submission, immediately opening the channel for incoming enquiries.",
            icon: <Zap className="w-6 h-6 text-[#0078D7]" strokeWidth={2.5} />
        }
    ];

    return (
        <section className="bg-white py-20 px-4 font-sans border-t border-slate-50">
            <div className="max-w-7xl mx-auto">

                {/* Informative Header with Restored Brand Colors */}
                <div className="mb-12 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-sm font-bold text-[#0078D7] uppercase tracking-widest mb-2">
                            Platform Features
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] leading-tight">
                            Listing Advantages
                        </h2>
                    </div>

                    {/* Restored Blue CTA Button */}
                    <button
                        onClick={() => document.getElementById('post-property-landing')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-[#0078D7] hover:bg-[#0066B8] text-white text-[15px] font-semibold py-3.5 px-8 rounded-lg transition-colors duration-200 w-fit shadow-sm"
                    >
                        List My Property
                    </button>
                </div>

                {/* Structured Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {benefits.map((benefit) => (
                        <div
                            key={benefit.id}
                            className="flex items-start gap-5"
                        >
                            {/* Restored Blue Icon Container */}
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
                                {benefit.icon}
                            </div>

                            {/* Clear, objective text content with original slate colors */}
                            <div>
                                <h3 className="text-[17px] font-bold text-[#1E293B] mb-2 leading-snug">
                                    {benefit.title}
                                </h3>
                                <p className="text-[15px] text-[#475569] leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AdditionalBenefitsInfo;