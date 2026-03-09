import React from 'react';

const PostPropertySteps = () => {
    const steps = [
        {
            id: "01",
            title: "Add details of your property",
            description: "Begin by telling us the few basic details about your property like your property type, location, No. of rooms etc",
            // Custom SVG matching the document + home icon
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="10" width="24" height="28" rx="2" fill="#FFE4B5" />
                    <line x1="14" y1="18" x2="26" y2="18" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
                    <line x1="14" y1="24" x2="26" y2="24" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
                    <line x1="14" y1="30" x2="20" y2="30" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="28" r="10" fill="white" />
                    <circle cx="32" cy="28" r="8" fill="#0078D7" />
                    <path d="M28 29L32 25L36 29V32H28V29Z" fill="white" />
                </svg>
            )
        },
        {
            id: "02",
            title: "Upload Photos & Videos",
            description: "Upload photos and videos of your property either via your desktop device or from your mobile phone",
            // Custom SVG matching the overlapping photos icon
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="16" width="22" height="18" rx="2" transform="rotate(-10 10 16)" fill="#FFE4B5" />
                    <rect x="16" y="14" width="24" height="20" rx="2" fill="#0078D7" />
                    <circle cx="23" cy="20" r="3" fill="white" />
                    <path d="M16 28L22 22L28 28H16Z" fill="white" fillOpacity="0.8" />
                    <path d="M25 34L33 26L40 34H25Z" fill="white" fillOpacity="0.8" />
                </svg>
            )
        },
        {
            id: "03",
            title: "Add Pricing & Ownership",
            description: "Just update your property's ownership details and your expected price and your property is ready for posting",
            // Custom SVG matching the house + rupee icon
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 24L24 12L38 24V36H10V24Z" fill="#E2E8F0" />
                    <path d="M8 24L24 10L40 24" stroke="#0078D7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="20" y="24" width="8" height="12" fill="#0078D7" fillOpacity="0.2" />
                    <text x="24" y="32" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#0078D7" textAnchor="middle">₹</text>
                </svg>
            )
        }
    ];

    return (
        <section className="bg-white py-20 px-4 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-[#64748B] uppercase tracking-wider mb-3">
                        How to Post
                    </p>
                    <h2 className="text-3xl md:text-[40px] font-bold text-[#1E293B] leading-tight">
                        Post Your Property in<br />3 Simple Steps
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-16">
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-start">
                            {/* Icon */}
                            <div className="mb-6 flex items-center justify-center">
                                {step.icon}
                            </div>

                            {/* Title with highlighted number */}
                            <h3 className="text-[19px] font-semibold text-[#1E293B] mb-4 leading-snug">
                                <span className="text-[#0078D7] mr-1">{step.id}.</span> {step.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[15px] text-[#475569] leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Call to Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => document.getElementById('post-property-landing')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-[#0078D7] hover:bg-[#0066B8] text-white text-[15px] font-semibold py-3.5 px-8 rounded-[4px] transition-colors duration-200 shadow-sm"
                    >
                        Begin to Post your Property
                    </button>
                </div>

            </div>
        </section>
    );
};

export default PostPropertySteps;