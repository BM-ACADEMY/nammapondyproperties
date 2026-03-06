import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PropertySearchBar from "./PropertySearchBar";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection to hide hero search
  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 300);
      }
    };

    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (mainContent) {
        mainContent.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Animation Variants for blur reveal
  const blurFadeIn = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative h-[500px] flex items-center justify-center font-sans">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center">
        {/* Headlines */}
        <motion.h1
          variants={blurFadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-medium text-white mb-6 text-center tracking-tight drop-shadow-lg"
        >
          Find Your Dream Property
        </motion.h1>

        <motion.p
          variants={blurFadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white mb-20 text-center leading-relaxed max-w-2xl drop-shadow-md"
        >
          Search for verified plots, villas, and apartments in Pondicherry effortlessly.
        </motion.p>
      </div>

      {/* --- SEARCH BAR (Bottom Overlap) --- */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute -bottom-4 left-0 right-0 z-20 flex justify-center px-4"
          >
            <PropertySearchBar variant="hero" showFilters={true} showKeyword={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;
