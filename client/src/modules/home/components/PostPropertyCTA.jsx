import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// You can replace this with an actual WhatsApp phone number
const WHATSAPP_NUMBER = "919000000000"; 
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I want to post a property on Namma Pondy Properties.");
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const PostPropertyCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto rounded-3xl bg-[#eef7f0] overflow-hidden relative flex flex-col md:flex-row items-center font-sans shadow-sm border border-[#e2efe4]">
        
        {/* Left Side: Text and Actions */}
        <div className="flex-1 p-10 md:p-16 z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3 tracking-tight">
            Sell or rent faster at the right price!
          </h2>
          <p className="text-[#64748b] text-base md:text-lg mb-8">
            Your perfect buyer is waiting, list your property now
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button
              onClick={() => navigate("/post-property")}
              className="bg-[#0b63e5] hover:bg-[#0950b3] text-white font-semibold py-3.5 px-8 rounded-lg shadow-sm transition-colors text-base"
            >
              Post Property, It's FREE
            </button>
            
          </div>
        </div>

        {/* Right Side: Image container matching the reference */}
        <div className="w-full md:w-2/5 flex justify-center md:items-end mt-8 md:mt-0 relative h-[300px] md:h-auto">
          <img 
            src="https://stimg.cardekho.com/images/carexteriorimages/630x420/Jaguar/F-Pace/10644/1755774688332/front-left-side-47.jpg?impolicy=resize&imwidth=480" // Reusing the same image used in PropertyTypeList right sidebar
            alt="Customer showing app" 
            className="h-full object-contain md:absolute md:bottom-0 md:right-10 z-20 pointer-events-none drop-shadow-lg scale-110 origin-bottom"
          />
        </div>
        
      </div>
    </section>
  );
};

export default PostPropertyCTA;
