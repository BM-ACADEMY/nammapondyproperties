import React from 'react';

const WhyChooseUs = () => {
    // New Content Array
    const features = [
        {
            title: 'Local Market Expertise',
            description: 'Strong local market knowledge to guide you to the best opportunities in Pondicherry.',
            // Replace with your actual image path
            imageSrc: '/whychoose/local.png',
            colorTheme: 'text-blue-600 bg-blue-50',
        },
        {
            title: 'Verified Titles',
            description: '100% verified and clear title properties. We do the due diligence so you don\'t have to.',
            imageSrc: 'whychoose/verified.png',
            colorTheme: 'text-green-600 bg-green-50',
        },
        {
            title: 'Transparent Process',
            description: 'Clear pricing and honest processes. No hidden charges, no surprises.',
            imageSrc: 'whychoose/transparent.png',
            colorTheme: 'text-orange-600 bg-orange-50',
        },
        {
            title: 'Personalized Guidance',
            description: 'We listen to your specific needs and tailor our search to find your perfect match.',
            imageSrc: 'whychoose/personalized.png',
            colorTheme: 'text-purple-600 bg-purple-50',
        },
        {
            title: 'End-to-End Support',
            description: 'From the first site visit to the final registration, we are with you every step of the way.',
            imageSrc: '/whychoose/endtoend.png',
            colorTheme: 'text-teal-600 bg-teal-50',
        }
    ];

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header Section */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-800">Why Choose NammaPondy?</h2>
                    <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                        We make property buying simple, secure, and transparent.
                    </p>
                </div>

                {/* Card Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            // The "group" class enables group-hover effects on child elements
                            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                        >
                            {/* Watermark Image Effect (Low Opacity) */}
                            <img
                                src={feature.imageSrc}
                                alt=""
                                // Positioned to the bottom-right, large, and partially transparent
                                className="absolute -bottom-6 right-1 w-40 h-40 object-contain opacity-30 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none"
                                // Fallback if image path is broken
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/200x200/cccccc/ffffff?text=${index + 1}`;
                                }}
                            />

                            {/* Content Layer (z-10 ensures it stays above the watermark) */}
                            <div className="relative z-10 flex flex-col flex-grow">
                                {/* Number Indicator / Icon block */}
                                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center font-bold text-lg shadow-sm ${feature.colorTheme}`}>
                                    {index + 1}
                                </div>

                                <h3 className="font-semibold text-xl text-gray-800 mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-500 text-[15px] leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default WhyChooseUs;
