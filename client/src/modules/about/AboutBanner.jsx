import React from 'react';
import { Row, Col } from 'antd';

export default function AboutBanner() {
  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden font-sans">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -z-10"></div>

        <Row gutter={[48, 48]} align="middle" className="relative">
          
          {/* LEFT SIDE: CONTENT */}
          <Col xs={24} lg={12} className="pr-0 lg:pr-12">
            
            {/* Tag/Badge */}
            <div className="inline-block mb-6">
              <span className="bg-[#D4AF37] text-white text-[10px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-sm shadow-sm">
                About Us
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#050B14] mb-8 leading-[1.1]">
              Welcome to <br/>
              <span className="text-[#D4AF37] font-normal">
                Namma Pondy Properties
              </span>
            </h1>

            {/* Introduction Paragraph */}
            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl">
              Namma Pondy Properties is a trusted real estate service dedicated to helping individuals and families buy, sell, and invest in properties across Pondicherry.
            </p>

            {/* Stylized Quote Box */}
            <div className="relative pl-8 mb-10">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
              <p className="text-[#050B14] text-xl font-light italic leading-relaxed">
                "We believe real estate is more than transactions — it’s about <span className="text-[#D4AF37] font-semibold not-italic">building dreams and securing futures.</span>"
              </p>
            </div>

            {/* Secondary Paragraph */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              With strong local expertise, we guide our clients with clarity and honesty. Whether you are searching for residential plots or commercial properties, we are here to help.
            </p>
          </Col>

          {/* RIGHT SIDE: IMAGE */}
          {/* ADDED: flex and justification to align image nicely */}
          <Col xs={24} lg={12} className="flex justify-center lg:justify-end">
            
            {/* ADDED: max-w-lg to stop it from getting too huge */}
            <div className="relative group w-full max-w-lg">
              
              {/* Image Container */}
              {/* UPDATED: Changed aspect ratio to square/4:3 for a more professional 'compact' look */}
              <div className="relative aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop')" 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37] -z-10 rounded-br-2xl"></div>
            </div>
          </Col>

        </Row>
      </div>
    </section>
  );
}