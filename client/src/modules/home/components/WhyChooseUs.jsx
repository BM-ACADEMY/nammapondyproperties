import React from 'react';

const WhyChooseUs = () => {
    // IMPORTANT: Replace the 'imageSrc' strings below with paths to your actual illustration images.
    // For best results, use SVG or PNG files with transparent backgrounds, designed to sit on pastel colors.
    const features = [
        { 
            title: 'Verified Listings', 
            description: 'Every property is physically verified by our team to ensure authenticity.',
            linkText: 'Explore Verified Areas',
            // Placeholder path - replace this!
            imageSrc: 'https://thumbs.dreamstime.com/b/flat-style-illustration-smiling-man-blue-vest-red-shirt-holding-clipboard-checkmark-background-features-shelves-411933580.jpg', 
            // Pastel background color for the left panel (matching reference style)
            bgColor: 'bg-pink-100'
        },
        { 
            title: 'No Hidden Fees', 
            description: 'Transparent pricing with zero hidden charges or surprise costs.',
            linkText: 'Read Our Policy',
            // Placeholder path - replace this!
            imageSrc: '/images/no-fees-illustration.svg',
            bgColor: 'bg-orange-100'
        },
        { 
            title: 'Expert Support', 
            description: 'Dedicated support managers available to guide every client.',
            linkText: 'Meet the Experts',
            // Placeholder path - replace this!
            imageSrc: '/images/support-illustration.svg',
            bgColor: 'bg-purple-100'
        },
        { 
            title: 'Bank Loans', 
            description: 'End-to-end assistance with home loans from top banking partners.',
            linkText: 'Check Eligibility',
            // Placeholder path - replace this!
            imageSrc: '/images/loan-illustration.svg',
            bgColor: 'bg-blue-100'
        },
    ];

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800">Why Choose NammaPondy?</h2>
                    <p className="text-gray-600 mt-2">We make property buying simple, secure, and transparent.</p>
                </div>

                {/* 2-Column Grid matching the reference image layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="flex flex-row bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 h-full"
                        >
                            {/* Left Side: Image Area with pastel background */}
                            {/* Adjusted width and padding to accommodate illustrations nicely */}
                            <div className={`w-2/5 md:w-[40%] flex items-center justify-center p-2 ${feature.bgColor}`}>
                                <img 
                                    src={feature.imageSrc} 
                                    alt={feature.title}
                                    // Using object-contain ensures the entire illustration is visible without cropping
                                    // h-32 md:h-full sets a good base height that scales nicely
                                    className="w-full h-32 md:h-auto max-h-48 object-contain transition-transform duration-300 hover:scale-105"
                                    // Added a temporary fallback to show a placeholder box if image is missing
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = `https://placehold.co/200x150/${feature.bgColor.split('-')[1]}/ffffff?text=${feature.title.split(' ')[0]}`;
                                        e.target.className="w-full h-auto object-cover opacity-50 mix-blend-multiply";
                                    }}
                                />
                            </div>
                            
                            {/* Right Side: Content Area */}
                            <div className="w-3/5 md:w-[60%] p-5 sm:p-6 md:p-8 flex flex-col justify-center">
                                <h3 className="font-semibold text-xl text-gray-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
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