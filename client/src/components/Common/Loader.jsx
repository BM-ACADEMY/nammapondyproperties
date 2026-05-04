import React from "react";

const Loader = ({ variant = "full" }) => {
  if (variant === "inline") {
    return (
      <div className="flex justify-center items-center p-4">
        <img 
          src="/Loader/Loader.gif" 
          alt="Loading..." 
          className="w-16 h-16 object-contain"
        />
      </div>
    );
  }

  if (variant === "panel") {
    return (
      <div className="absolute inset-0 flex justify-center items-center bg-white/80 backdrop-blur-sm z-50 min-h-[400px]">
        <img 
          src="/Loader/Loader.gif" 
          alt="Loading..." 
          className="w-40 h-40 md:w-56 md:h-56 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center h-screen w-full bg-white z-[9999]">
      <div className="relative">
        <img 
          src="/Loader/Loader.gif" 
          alt="Loading..." 
          className="w-32 h-32 md:w-48 md:h-48 object-contain"
        />
      </div>
    </div>
  );
};

export default Loader;
