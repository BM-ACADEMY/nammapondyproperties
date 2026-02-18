import React from 'react';
import { Row, Col } from 'antd';
import {
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

export default function WhatWeDo() {
  const services = [
    {
      title: "Residential Plots",
      sub: "For Sale in Pondicherry",
      icon: <EnvironmentOutlined />,
      // Accessing image from public folder
      img: "/plot.png.png"
    },
    {
      title: "Villas and Independent Houses",
      sub: "Premium Living",
      icon: <HomeOutlined />,
      img: "/villas.png"
    },
    {
      title: "Commercial Properties",
      sub: "Business Spaces",
      icon: <BankOutlined />,
      img: "/commercial.png"
    },
    {
      title: "Investment Properties",
      sub: "High Value Assets",
      icon: <RiseOutlined />,
      img: "/investment.png"
    },
    {
      title: "Property Selling Assistance",
      sub: "End-to-End Support",
      icon: <SafetyCertificateOutlined />,
      img: "/propperty.png"
    },
  ];

  return (
    <section className="bg-gray-50 py-24 relative overflow-hidden font-sans">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#050B14 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <Row gutter={[64, 48]}>

          {/* LEFT SIDE: CONTENT (Sticky) */}
          <Col xs={24} lg={10} className="flex flex-col">
            <div className="sticky top-4">

              {/* Heading */}
              <div className="mb-6">
                <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs border border-[#D4AF37]/30 px-4 py-2 rounded-full bg-white">
                  Our Expertise
                </span>
              </div>

              {/* H2 */}
              <h2 className="text-4xl md:text-5xl font-light text-[#050B14] mb-6">
                What We Do
              </h2>

              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                At Namma Pondy Properties, we specialize in:
              </p>

              {/* Trust/Verification Block */}
              <div className="bg-white border border-gray-200 border-l-4 border-l-[#D4AF37] p-6 rounded-r-xl mb-8 shadow-md">
                <p className="text-[#050B14] text-lg font-medium italic mb-4">
                  "Every property listed with us is carefully verified to ensure proper documentation and clear ownership."
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We focus on delivering safe, secure, and legally verified real estate opportunities for our clients.
                </p>
              </div>

              {/* Action Button */}
              <button className="self-start flex items-center gap-3 bg-[#D4AF37] text-[#050B14] font-bold py-4 px-8 rounded-lg hover:bg-[#050B14] hover:text-white transition-all duration-300 shadow-lg group">
                <span>Contact Us</span>
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </Col>

          {/* RIGHT SIDE: SERVICES GRID */}
          <Col xs={24} lg={14}>
            <Row gutter={[24, 24]} justify="center">
              {services.map((service, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div className={`group bg-white border border-gray-200 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full relative overflow-hidden flex flex-col items-start justify-between min-h-[280px]`}>

                    {/* Hover Overlay Pattern */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    {/* Content Container with higher z-index */}
                    <div className="relative z-20 w-full">
                      {/* Icon Container */}
                      <div className="w-14 h-14 bg-orange-50/50 rounded-2xl flex items-center justify-center text-xl text-[#D4AF37] mb-6 shadow-sm border border-orange-100/50">
                        {service.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-[#050B14] mb-2 leading-tight">
                        {service.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {service.sub}
                      </p>
                    </div>

                    {/* ILLUSTRATION IMAGE AS OVERLAY */}
                    {service.img && (
                      <div className="absolute bottom-0 right-0 w-3/6 h-auto  mix-blend-multiply pointer-events-none z-10">
                        <img
                          src={service.img}
                          alt={service.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Arrow (Only shows if NO image) */}
                    {!service.img && (
                      <div className="self-end mt-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 relative z-20">
                        <ArrowRightOutlined className="text-[#050B14] text-xl" />
                      </div>
                    )}

                  </div>
                </Col>
              ))}
            </Row>
          </Col>

        </Row>
      </div>
    </section>
  );
}