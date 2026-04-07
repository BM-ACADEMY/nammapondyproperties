import React from 'react';
import { XCircle, CheckCircle2, Home, Zap, MousePointerClick, ShieldCheck } from 'lucide-react';

const Comparison = () => {
  const issues = [
    "No serious buyer calls",
    "Too much competition",
    "Time wasted on fake inquiries",
    "Low visibility for your listings"
  ];

  const solutions = [
    "Get local Pondicherry buyers",
    "Get verified buyer inquiries",
    "Close more property deals",
    "Get priority visibility for leads"
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Label - Matching Hero Badge Style */}
        <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-100 px-4 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#c19b48]" />
                <span className="text-[#0e182b] text-[11px] font-bold tracking-wider uppercase">
                    Get More Buyers
                </span>
            </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Problem Card (Red) */}
          <div className="bg-[#fbe0da] rounded-2xl p-8 lg:p-12 relative shadow-lg shadow-red-100/50 flex flex-col justify-between">
            <div>
                <h3 className="text-3xl lg:text-3xl font-bold text-[#0e182b] mb-8 leading-[1.2] tracking-tight">
                Are you facing <br className="hidden sm:block" /> these issues?
                </h3>
                <ul className="space-y-5">
                {issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-[#ef4444] mt-0.5" />
                        <span className="text-base text-[#38526e] font-semibold leading-relaxed">{issue}</span>
                    </li>
                ))}
                </ul>
            </div>
          </div>
          {/* Right Column: Solution Card (Green) */}
          <div className="bg-[#d9f2d0] rounded-2xl p-8 lg:p-12 relative shadow-lg shadow-green-100/50 flex flex-col justify-between">
            <div>
                <h3 className="text-3xl lg:text-3xl font-bold text-[#0e182b] mb-8 leading-[1.2] tracking-tight">
                Get More Buyers with <br className="hidden sm:block" /> Namma Pondy Properties:
                </h3>
                <ul className="space-y-5">
                {solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-[#22c55e] mt-0.5" />
                        <span className="text-base text-[#38526e] font-semibold leading-relaxed">{solution}</span>
                    </li>
                ))}
                </ul>
            </div>
          </div>

        </div>

        {/* Footer CTA - Exact Hero Button Style */}
        <div className="mt-16 flex flex-col items-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#1aa554] hover:bg-[#168a44] text-white text-xl font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:-translate-y-1 active:scale-95 leading-none flex items-center gap-2">
                <MousePointerClick className="w-6 h-6" />
                Get Buyers Now - Post FREE
            </button>
            <div className="text-[#38526e] font-bold text-base flex items-center gap-2">
                Start Getting Buyers Today!
            </div>
        </div>

      </div>
    </section>
  );
};

export default Comparison;
