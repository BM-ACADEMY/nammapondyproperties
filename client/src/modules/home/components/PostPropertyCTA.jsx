import React from "react";
import { useNavigate } from "react-router-dom";

const PostPropertyCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1000px] mx-auto rounded-3xl bg-[#eef7f0] relative flex flex-col md:flex-row items-stretch font-sans shadow-sm border border-[#e2efe4] min-h-[300px]">

        {/* Left Side: Text and Actions */}
        <div className="flex-1 p-10 md:p-16 z-10 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3 tracking-tight">
            Sell or rent faster at the right price!
          </h2>
          <p className="text-[#64748b] text-base md:text-lg mb-8">
            Your perfect buyer is waiting, list your property now
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button
              onClick={() => navigate("/post-property")}
              className="bg-[#0b63e5] hover:bg-[#0950b3] text-white font-bold py-3.5 px-8 rounded-lg shadow-sm transition-colors text-base"
            >
              Post Property, It's FREE
            </button>
          </div>
        </div>

        {/* Right Side: Image container */}
        <div className="w-full md:w-2/5 relative flex justify-center items-end">
          <img
            // 1. Ensure this path is correct relative to your 'public' folder.
            // If it's in public/properties/adsman.png, add the extension.
            src="/properties/adsman.png"
            alt="Customer showing app"
            className="h-[250px] md:h-[115%] w-auto object-contain md:absolute md:bottom-0 md:right-4 z-20 pointer-events-none drop-shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default PostPropertyCTA;
