import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const WhyPostProperty = () => {
    const benefits = [
        "Advertise your property for FREE",
        "Get genuine buyer & tenant enquiries",
        "Reach local and NRI property seekers",
        "Easy listing with simple steps",
        "Direct contact with interested buyers"
    ];

    return (
        <section className="min-h-screen bg-[#f1f7ff] pt-12 pb-20 px-4 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                {/* Left Column: Text Content & CTA */}
                <div className="flex-1 w-full">
                    <p className="text-sm font-bold text-[#0078D7] uppercase tracking-wider mb-3">
                        Why Namma Pondy
                    </p>
                    <h2 className="text-3xl md:text-[40px] font-bold text-[#1E293B] leading-tight mb-6">
                        Post Your Property & Connect With Genuine Buyers
                    </h2>
                    <p className="text-[17px] text-[#475569] leading-relaxed mb-6">
                        List your property on Namma Pondy Properties and reach thousands of active buyers and tenants searching for homes, plots, and commercial spaces in Pondicherry.
                    </p>
                    <p className="text-[17px] text-[#475569] leading-relaxed mb-10">
                        Our platform helps property owners, agents, and builders showcase listings with maximum visibility and receive verified enquiries.
                    </p>

                    <button className="bg-[#0078D7] hover:bg-[#0066B8] text-white text-[16px] font-semibold py-4 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg w-full sm:w-auto">
                        Post Your Property Now
                    </button>
                </div>

                {/* Right Column: Key Benefits Card */}
                <div className="w-full lg:w-[500px] flex-shrink-0">
                    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <h3 className="text-xl font-bold text-[#1E293B] mb-6 pb-4 border-b border-slate-100">
                            Key Benefits
                        </h3>

                        <ul className="flex flex-col gap-5">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start group">
                                    <CheckCircle2
                                        className="w-6 h-6 text-[#0078D7] mr-4 flex-shrink-0 mt-0.5 bg-blue-50 rounded-full"
                                        strokeWidth={2.5}
                                    />
                                    <span className="text-[16px] text-[#334155] font-medium group-hover:text-[#1E293B] transition-colors">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default WhyPostProperty;