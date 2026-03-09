import React from 'react';

const MeetKamar = () => {
    return (
        <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 mt-8">
            {/* Main Container: 
                - Removed overflow-hidden so the image can escape the bounds and sit in front.
            */}
            <div className="max-w-[1100px] mx-auto relative flex flex-col md:flex-row items-stretch min-h-[520px]">

                {/* 
                   Background Layer: 
                   This dedicated div handles the gradient, rounded corners, and overflow. 
                   Because it's isolated, it won't clip the image!
                */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#f8faf9] via-[#f1f7f5] to-[#e6f2ee] shadow-sm border border-white/40 overflow-hidden z-0"></div>

                {/* Left Side: Text Content */}
                <div className="flex-1 p-10 md:p-14 lg:p-16 z-10 flex flex-col justify-center relative">
                    <h2 className="text-4xl md:text-[50px] font-bold text-[#0f172a] mb-3 tracking-tight">
                        Meet Kamar
                    </h2>

                    <h3 className="text-[#b58e45] text-[20px] md:text-[24px] font-semibold mb-8">
                        The Founder of Namma Pondy Properties
                    </h3>

                    <div className="space-y-6 text-[#475569] text-[17px] md:text-[18px] leading-relaxed max-w-[520px]">
                        <p>
                            Kamar founded Namma Pondy Properties with a vision to make property buying and selling in Pondicherry simple, transparent, and trustworthy.
                        </p>
                        <p>
                            With strong local knowledge and real estate experience, he is committed to helping people find the right property for their home, investment, or future. Through technology and genuine listings, he aims to make property search easier for everyone.
                        </p>
                    </div>
                </div>

                {/* Right Side: Image container */}
                <div className="relative w-full md:w-[45%] min-h-[400px] md:min-h-full z-10 flex items-end justify-center md:justify-end">
                    <img
                        src="kamar.png"
                        alt="Kamar - Asset Manager"
                        /* Positioning Fixes:
                           - absolute & bottom-0: Locks the image perfectly flush with the bottom.
                           - md:right-8: Pulls him slightly away from the rounded corner edge.
                           - z-20: Ensures he is fully in the front of the card.
                           - h-[115%]: Allows him to scale up and pop out of the top slightly if needed.
                        */
                        className="absolute bottom-0 right-0 md:right-8 w-auto h-[100%] md:h-[115%] max-w-none object-contain object-bottom z-20 transition-transform duration-300 pointer-events-none"
                        onError={(e) => {
                            e.target.src = "/properties/adsman.png";
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default MeetKamar;