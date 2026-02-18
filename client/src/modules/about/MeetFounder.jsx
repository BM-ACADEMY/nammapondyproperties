import React from 'react';
import { Row, Col } from 'antd';
import { 
  MailOutlined, 
  InstagramOutlined, 
  TwitterOutlined, 
  LinkedinFilled 
} from '@ant-design/icons';

export default function MeetFounder() {
  return (
    /* Section background changed to Smoky White (bg-gray-50) */
    <section className="bg-gray-50 py-24 relative overflow-hidden font-sans border-t border-gray-100">
      
      {/* --- VECTOR BACKGROUNDS (Light Mode) --- */}

      {/* 1. Architectural Dot Grid (Subtle Dark Pattern) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#050B14 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* 2. Large Flowing Gold Wave (Reduced Opacity for Light Mode) */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100 600C200 600 400 300 800 500C1200 700 1300 200 1500 300" stroke="#D4AF37" strokeWidth="2" strokeDasharray="10 10"/>
        <path d="M-100 650C200 650 450 350 850 550C1250 750 1350 250 1550 350" stroke="#D4AF37" strokeWidth="1" opacity="0.3"/>
      </svg>

      {/* 3. Soft Golden Glow (Adjusted for Light BG) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <Row gutter={[80, 48]} align="middle">
          
          {/* LEFT SIDE: IMAGE WITH DECOR */}
          <Col xs={24} lg={10} className="relative">
            
            {/* Decorative Squares & Vectors */}
            
            {/* 1. Gold Frame Outline */}
            <div className="absolute -top-6 -left-6 w-full h-full border border-[#D4AF37]/40 rounded-xl -z-10"></div>
            
            {/* 2. Solid Gold Accent Block (Subtle) */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-xl -z-10"></div>

            {/* 3. Small Geometric Floater */}
            <div className="absolute top-1/2 -left-12 w-6 h-6 border border-[#D4AF37] rotate-45 animate-pulse"></div>

            {/* Main Image Container */}
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-gray-200 group bg-white p-2">
              <img 
                src="/kamar.jpeg" 
                alt="Kamar - Founder" 
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 rounded-lg"
              />
              {/* Subtle bottom gradient to help photo blend with light section */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-transparent to-transparent opacity-40"></div>
            </div>

          </Col>

          {/* RIGHT SIDE: CONTENT */}
          <Col xs={24} lg={14}>
            
            {/* Header */}
            <div className="mb-8 relative">
              {/* Tiny decorative line */}
              <div className="absolute -left-20 top-4 w-12 h-[1px] bg-[#D4AF37] hidden lg:block"></div>
              
              <div className="inline-block mb-3">
                <span className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-xs border border-[#D4AF37]/30 px-3 py-1 rounded-full bg-white shadow-sm">
                  The Founder
                </span>
              </div>
              
              {/* UPDATED: Removed font-serif, Changed font-bold to font-light */}
              <h2 className="text-4xl md:text-5xl font-light text-[#050B14] leading-tight">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#B8860B]">Kamar</span>
              </h2>
              
              <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-semibold">
                The Heart Behind Namma Pondy Properties
              </p>
            </div>

            {/* Main Story Content */}
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-light">
              <p>
                Every successful journey begins with a strong purpose. For Kamar, that purpose has always been simple — to help people find not just properties, but places they can truly call home.
              </p>
              
              <p>
                With deep roots in Pondicherry and years of real estate experience, Kamar understands that buying land or a house is one of the most important financial decisions in a person’s life.
              </p>

              {/* Highlight Quote Block */}
              <div className="relative border-l-4 border-[#D4AF37] pl-8 py-6 my-8 bg-white border border-gray-100 rounded-r-lg shadow-sm overflow-hidden">
                {/* Giant Quote Icon Background */}
                <div className="absolute -right-4 -bottom-8 text-9xl text-gray-50 font-serif pointer-events-none">”</div>
                
                <p className="text-[#050B14] font-medium italic text-xl leading-relaxed relative z-10">
                  "Success is not measured by the number of properties sold, but by the satisfaction and trust of every client served."
                </p>
              </div>

              <p>
                Namma Pondy Properties was founded with a clear vision: <strong className="text-[#050B14] font-semibold">To build a real estate brand based on transparency, trust, and long-term relationships.</strong> In an industry where confusion can create stress, Kamar believes in complete clarity — from property selection to registration support.
              </p>
            </div>

            

          </Col>

        </Row>
      </div>
    </section>
  );
}