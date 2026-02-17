import React from 'react';
import { Row, Col } from 'antd';

export default function AboutBanner() {
  return (
    <section className="bg-[#050B14] py-16 md:py-24 overflow-hidden font-sans">
      {/* Main Container: This ensures the content doesn't hit the screen edges */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Background Decorative Element (Subtle Ring) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10"></div>

        <Row gutter={[48, 48]} align="middle" className="relative">
          
          {/* LEFT SIDE: CONTENT */}
          <Col xs={24} lg={12} className="pr-0 lg:pr-12">
            
            {/* Tag/Badge */}
            <div className="inline-block mb-6">
              <span className="bg-[#D4AF37] text-[#050B14] text-[10px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-sm shadow-md">
                About Us
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.1]">
              Welcome to <br/>
              <span className="text-[#D4AF37]">
                Namma Pondy Properties
              </span>
            </h1>

            {/* Introduction Paragraph */}
            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              Namma Pondy Properties is a trusted real estate service dedicated to helping individuals and families buy, sell, and invest in properties across Pondicherry.
            </p>

            {/* Stylized Quote Box */}
            <div className="relative pl-8 mb-10">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
              <p className="text-gray-200 text-xl font-light italic leading-relaxed">
                "We believe real estate is more than transactions — it’s about <span className="text-[#F2D06B] font-semibold not-italic">building dreams and securing futures.</span>"
              </p>
            </div>

            {/* Secondary Paragraph */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              With strong local expertise, we guide our clients with clarity and honesty. Whether you are searching for residential plots or commercial properties, we are here to help.
            </p>
          </Col>

          {/* RIGHT SIDE: IMAGE */}
          <Col xs={24} lg={12}>
            <div className="relative group">
              {/* The Image Container with specific aspect ratio */}
              <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop')" 
                  }}
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/40 to-transparent"></div>
              </div>

              {/* Decorative Accent: Floating gold frame slightly offset */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b-2 border-r-2 border-[#D4AF37]/40 -z-10 rounded-br-2xl"></div>
            </div>
          </Col>

        </Row>
      </div>
    </section>
  );
}