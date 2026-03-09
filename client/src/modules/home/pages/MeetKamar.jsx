import React from 'react';

const MeetKamar = () => {
    return (
        <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Main Container: 
               - overflow-hidden is vital to cut the image at the rounded bottom.
               - relative allows the image to pin to the bottom.
            */}
            <div className="max-w-[1100px] mx-auto rounded-[2rem] bg-gradient-to-br from-[#f8faf9] via-[#f1f7f5] to-[#e6f2ee] relative flex flex-col md:flex-row items-stretch shadow-sm border border-white/40 overflow-hidden min-h-[520px]">

                {/* Left Side: Text Content */}
                <div className="flex-1 p-10 md:p-14 lg:p-16 z-10 flex flex-col justify-center">
                    <h2 className="text-4xl md:text-[50px] font-bold text-[#0f172a] mb-3 tracking-tight">
                        Meet Kamar
                    </h2>

                    <h3 className="text-[#b58e45] text-[20px] md:text-[24px] font-semibold mb-8">
                        The Tech-Savvy Asset Manager
                    </h3>

                    <div className="space-y-6 text-[#475569] text-[17px] md:text-[18px] leading-relaxed max-w-[520px]">
                        <p>
                            In a world where technology and property management intersect, Kamar stands at the forefront, bridging traditional values with modern digital solutions to maximize investment returns.
                        </p>
                        <p>
                            His expertise in asset management is complemented by his tech skills, ensuring that Namma Pondy Properties efficiently manages and maximizes the value of each property.
                        </p>
                    </div>
                </div>

                {/* Right Side: Image container */}
                <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-full">
                    <img
                        src="kamar.png"
                        alt="Kamar - Asset Manager"
                        /* Positioning Fixes:
                           - absolute bottom-0: Pins his waist/pants to the very bottom edge.
                           - right-0: Pins him to the right edge.
                           - h-[90%] to h-[105%]: Adjusts his size to fill the height.
                        */
                        className="absolute bottom-0 right-0 w-auto h-[95%] md:h-[105%] lg:h-[110%] max-w-none object-contain object-bottom z-20 transition-transform duration-300"
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