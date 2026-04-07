import React from 'react';
import { ShieldCheck } from 'lucide-react';

const BuilderPricing = () => {
  return (
    <div className="flex justify-center items-center py-20 bg-white p-4 font-sans">
      
      {/* Main Container */}
      <div className="relative w-full max-w-6xl flex flex-col py-12 px-4 md:px-0">
        
        {/* TOP BANNER (Background) */}
        <div className="w-full bg-[#FFF6E9] rounded-4xl pt-12 pb-32 px-8 md:px-16 flex flex-col justify-center items-center relative text-center">
          
          <div className="max-w-2xl z-10 flex flex-col items-center">
            {/* Badge Tag */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white px-4 py-1.5 rounded-full shadow-sm mb-4">
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              <span className="text-[#091E42] text-[11px] font-bold tracking-wider uppercase">
                Builder Packages
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#091E42] leading-tight">
              Pick a plan to sell properties Faster
            </h1>
          </div>

        </div>

        {/* CARDS GRID (Foreground/Overlapping) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 md:px-8 -mt-20 z-20">
          
          {/* --- CARD 1: Basic --- */}
          <div className="bg-white border border-[#0078DB] rounded shadow-[0_8px_24px_rgba(0,0,0,0.08)] w-full p-6 transition-colors duration-300 hover:bg-gray-100 flex flex-col group">
            {/* Top Icon Area (Orange House) */}
            <div className="mb-5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 38V22L24 12L38 22V38H10Z" fill="#F4B459"/>
                <path d="M28 38V26H38V38H28Z" fill="#0078DB"/>
                <circle cx="24" cy="18" r="4" fill="white"/>
                <circle cx="24" cy="18" r="2" fill="#0078DB"/>
                <path d="M14 18C14 18 19 12 24 12C29 12 34 18 34 18" stroke="#D1E4F9" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-[22px] font-bold text-[#091E42] mb-1">Basic</h2>
            <p className="text-[13px] text-[#5E6D82] leading-snug mb-6 h-10">
              Essential platform visibility for your listings.
            </p>

            {/* Pricing Info */}
            <div className="mb-4">
              <p className="text-[13px] text-[#091E42] font-medium uppercase tracking-wide">Unlimited Listings</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[26px] font-bold text-[#091E42]">₹5,000</span>
                <span className="text-[11px] text-[#8B95A5] font-bold lowercase">/month</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4 mb-5 mt-4">
              <BenefitItem text="Unlimited listings" iconType="listings" />
              <BenefitItem text="Platform visibility" iconType="visibility" />
              <BenefitItem text="No guaranteed leads" iconType="leads" isNegative />
            </ul>

            {/* Action Button */}
            <button className="w-full bg-[#091E42] text-white py-3.5 rounded-sm font-bold text-[14px] hover:bg-[#c5a059] transition duration-200 mt-auto shadow-md group-hover:scale-[1.02]">
              Get Basic
            </button>
          </div>

          {/* --- CARD 2: Pro --- */}
          <div className="bg-white border border-[#0078DB] rounded shadow-[0_12px_32px_rgba(0,0,0,0.12)] w-full p-6 transition-colors duration-300 hover:bg-gray-100 flex flex-col relative group">
            
            {/* Top Icon Area (Green House) */}
            <div className="mb-5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 38V22L24 12L38 22V38H10Z" fill="#36B37E"/>
                <path d="M28 38V26H38V38H28Z" fill="#0078DB"/>
                <circle cx="24" cy="18" r="4" fill="white"/>
                <circle cx="24" cy="18" r="2" fill="#0078DB"/>
                <path d="M14 18C14 18 19 12 24 12C29 12 34 18 34 18" stroke="#D1E4F9" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-[22px] font-bold text-[#091E42] mb-1">Pro</h2>
            <p className="text-[13px] text-[#5E6D82] leading-snug mb-6 h-10">
              Dedicated project promotion and shared lead inquiries.
            </p>

            {/* Pricing Info */}
            <div className="mb-4">
              <p className="text-[13px] text-[#091E42] font-medium uppercase tracking-wide">Builder Pro Plan</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[26px] font-bold text-[#091E42]">₹10k - 15k</span>
                <span className="text-[11px] text-[#8B95A5] font-bold lowercase">/month</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4 mb-5 mt-4">
              <BenefitItem text="Dedicated landing page" iconType="placement" />
              <BenefitItem text="Shared leads" iconType="leads" />
              <BenefitItem text="Homepage visibility" iconType="visibility" />
              <BenefitItem text="WhatsApp promotion" iconType="leads" hasInfo />
            </ul>

            {/* Action Button */}
            <button className="w-full bg-[#091E42] text-white py-3.5 rounded-lg font-semibold text-[14px] hover:bg-[#c5a059] transition duration-200 mt-auto shadow-md group-hover:scale-[1.02]">
              Choose Pro
            </button>
          </div>

          {/* --- CARD 3: Premium --- */}
          <div className="bg-white border border-[#0078DB] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] w-full p-6 transition-colors duration-300 hover:bg-gray-100 flex flex-col group relative">
            
            {/* Top Icon Area (Purple House) */}
            <div className="mb-5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 38V22L24 12L38 22V38H10Z" fill="#8777D9"/>
                <path d="M28 38V26H38V38H28Z" fill="#0078DB"/>
                <circle cx="24" cy="18" r="4" fill="white"/>
                <circle cx="24" cy="18" r="2" fill="#0078DB"/>
                <path d="M14 18C14 18 19 12 24 12C29 12 34 18 34 18" stroke="#D1E4F9" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-[22px] font-bold text-[#091E42] mb-1">Premium</h2>
            <p className="text-[13px] text-[#5E6D82] leading-snug mb-6 h-10">
              Maximum ROI with Meta ads and exclusive leads.
            </p>

            {/* Pricing Info */}
            <div className="mb-4">
              <p className="text-[13px] text-[#091E42] font-medium uppercase tracking-wide">Project Exclusive</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[26px] font-bold text-[#091E42]">₹20k - 50k</span>
                <span className="text-[11px] text-[#8B95A5] font-bold lowercase">/month</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4 mb-5 mt-4">
              <BenefitItem text="Meta ads included" iconType="placement" />
              <BenefitItem text="Exclusive leads" iconType="leads" />
              <BenefitItem text="Full marketing" iconType="visibility" />
              <BenefitItem text="Priority delivery" iconType="listings" hasInfo />
            </ul>

            {/* Action Button */}
            <button className="w-full bg-[#091E42] text-white py-3.5 rounded-lg font-semibold text-[14px] hover:bg-[#c5a059] transition duration-200 mt-auto shadow-md group-hover:scale-[1.02]">
              Get Premium Leads
            </button>
          </div>


        </div>
        
        {/* BOTTOM SECTION (Consistency Check) */}
        <div className="mt-20 flex flex-col items-center text-center">
            <p className="text-[#091E42] font-semibold text-lg mb-4">Want a custom plan for your project?</p>
            <button className="flex items-center gap-2 bg-[#1aa554] text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-[#168a44] transition-all transform hover:-translate-y-1 shadow-lg active:scale-95">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.21-2.21a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Book Consultation
            </button>
        </div>

      </div>
    </div>
  );
};

// --- Reusable Benefit Item Component (REPLICATING AGENT PAGE EXACTLY) ---
const BenefitItem = ({ text, hasInfo, isNegative, iconType }) => {
  const getIcon = () => {
    const colorClass = isNegative ? 'text-red-500' : 'text-[#c5a059]';
    switch (iconType) {
      case 'listings':
        return (
          <svg className={`w-3.5 h-3.5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'visibility':
        return (
          <svg className={`w-3.5 h-3.5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        );
      case 'leads':
        return (
          <svg className={`w-3.5 h-3.5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        );
      case 'placement':
        return (
          <svg className={`w-3.5 h-3.5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
        );
      default:
        return isNegative ? (
          <span className="text-red-500 font-bold text-xs shrink-0">✕</span>
        ) : (
          <svg className="w-2.5 h-2.5 text-[#c5a059]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        );
    }
  };

  return (
    <li className="flex items-center text-[13px] text-[#091E42]">
      <div className={`${isNegative ? 'bg-red-50' : 'bg-gray-50'} rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0`}>
        {getIcon()}
      </div>
      <span className={isNegative ? 'text-[#8B95A5]' : ''}>{text}</span>
      {hasInfo && (
        <svg className="w-3.5 h-3.5 text-[#A0AABF] ml-auto shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )}
    </li>
  );
};

export default BuilderPricing;
