import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
    const faqs = [
        {
            question: "Is posting property free?",
            answer: "Yes, property owners can post listings completely for free."
        },
        {
            question: "How long does it take to post property?",
            answer: "It takes less than 2 minutes. Just fill in the basic details, upload photos, and you are good to go."
        },
        {
            question: "Can agents post properties?",
            answer: "Yes, agents and builders can also list their properties to reach thousands of potential buyers."
        }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        // Matches the background and padding of your reference component
        <section className="bg-[#f1f7ff] pt-12 pb-20 px-4 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

                {/* Left Column: Text Content */}
                <div className="flex-1 w-full lg:sticky lg:top-24">
                    <p className="text-sm font-bold text-[#0078D7] uppercase tracking-wider mb-3">
                        Got Questions?
                    </p>
                    <h2 className="text-3xl md:text-[40px] font-bold text-[#1E293B] leading-tight mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-[17px] text-[#475569] leading-relaxed mb-6">
                        Find answers to common questions about posting your property on Namma Pondy Properties.
                    </p>
                </div>

                {/* Right Column: FAQ Accordion Card */}
                {/* Matches the white card styling from your reference component */}
                <div className="w-full lg:w-[600px] flex-shrink-0">
                    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        
                        <div className="flex flex-col">
                            {faqs.map((faq, index) => {
                                const isOpen = openIndex === index;

                                return (
                                    <div 
                                        key={index} 
                                        className="border-b border-slate-100 last:border-none py-5 first:pt-0 last:pb-0"
                                    >
                                        {/* Question Button */}
                                        <button
                                            onClick={() => toggleFAQ(index)}
                                            className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                                        >
                                            <h3 className={`text-[16px] sm:text-[17px] font-semibold transition-colors duration-200 pr-4 ${
                                                isOpen ? "text-[#0078D7]" : "text-[#334155] group-hover:text-[#1E293B]"
                                            }`}>
                                                {faq.question}
                                            </h3>
                                            
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isOpen ? "bg-blue-50 text-[#0078D7] rotate-180" : "bg-slate-50 text-[#64748B] group-hover:bg-blue-50 group-hover:text-[#0078D7]"
                                            }`}>
                                                <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                                            </div>
                                        </button>

                                        {/* Answer Content (Animated smoothly) */}
                                        <div 
                                            className={`grid transition-all duration-300 ease-in-out ${
                                                isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-[16px] text-[#475569] leading-relaxed pr-8">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default FAQSection;