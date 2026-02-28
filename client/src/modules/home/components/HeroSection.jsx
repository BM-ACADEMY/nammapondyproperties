import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [approval, setApproval] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Animated Placeholder State
  const searchPlaceholders = [
    "Search by title or description...",
    "Search by area or pincode...",
    "Search by property type (Villa, Plot...)",
    "Search by attributes (3 BHK...)",
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Filter Data
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  // Dropdown Open States
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

  // Refs for click outside
  const typeDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const approvalDropdownRef = useRef(null);
  const budgetDropdownRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    // 1. Fetch Filters
    fetch(`${import.meta.env.VITE_API_URL}/properties/filters`)
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types || []);
        setLocations(data.locations || []);
        setApprovalTypes(data.approvals || []);
        setPriceRanges(data.priceRanges || []);
      })
      .catch((err) => console.error("Failed to fetch filters", err));

    // 2. Click Outside Logic
    const handleClickOutside = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      )
        setIsTypeDropdownOpen(false);
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      )
        setIsLocationDropdownOpen(false);
      if (
        approvalDropdownRef.current &&
        !approvalDropdownRef.current.contains(event.target)
      )
        setIsApprovalDropdownOpen(false);
      if (
        budgetDropdownRef.current &&
        !budgetDropdownRef.current.contains(event.target)
      )
        setIsBudgetDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    // 3. Animated Placeholder Interval (Increased to 3s for better reading time)
    const placeholderInterval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(placeholderInterval);
    };
  }, []);

  // --- HANDLERS ---
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (propertyType) params.append("type", propertyType);
    if (location) params.append("location", location);
    if (approval) params.append("approval", approval);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  const selectBudget = (range) => {
    if (range.min !== undefined && range.max !== undefined) {
      setMinPrice(range.min);
      setMaxPrice(range.max);
    } else {
      setMinPrice("");
      setMaxPrice("");
    }
    setIsBudgetDropdownOpen(false);
  };

  const getBudgetLabel = () => {
    if (!minPrice && !maxPrice) return "Budget";
    const selected = priceRanges.find(
      (r) => r.min === minPrice && r.max === maxPrice,
    );
    return selected ? selected.label : "Budget";
  };

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
    <div className="relative h-[600px] flex items-center justify-center font-sans">
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
          className="text-lg md:text-xl text-white mb-12 text-center leading-relaxed max-w-2xl drop-shadow-md"
        >
          Search for verified plots, villas, and apartments in Pondicherry effortlessly.
        </motion.p>

        {/* --- SEARCH BAR --- */}
        <div className="w-full max-w-5xl flex justify-center">
          <motion.div
            initial={{ width: "10%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-white p-1.5 md:p-2 rounded-full shadow-2xl flex flex-row items-center justify-between relative z-50 h-14 md:h-[72px] w-full overflow-visible"
          >
            {/* 1. SEARCH INPUT */}
            <div className="flex-grow flex items-center pl-4 pr-2 md:px-6 h-full md:border-r border-gray-200 min-w-0 relative">
              <Search className="w-5 h-5 text-gray-400 mr-2 md:mr-3 flex-shrink-0" />

              {/* Custom Animated Placeholder Wrapper */}
              <div className="relative w-full h-full flex items-center overflow-hidden">
                {!searchQuery && (
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={placeholderIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute left-0 text-gray-400 text-sm md:text-base pointer-events-none whitespace-nowrap"
                    >
                      {searchPlaceholders[placeholderIdx]}
                    </motion.span>
                  </AnimatePresence>
                )}

                {/* Actual Input Field */}
                <input
                  type="text"
                  className="w-full bg-transparent text-gray-800 text-sm md:text-base focus:outline-none min-w-0 relative z-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* 2. FILTERS CONTAINER (Hidden on mobile) */}
            <div className="relative z-20 hidden md:flex items-center justify-center gap-2 px-4">
              {/* Type Dropdown */}
              <div
                className="relative group"
                ref={typeDropdownRef}
                onMouseEnter={() => setIsTypeDropdownOpen(true)}
                onMouseLeave={() => setIsTypeDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {propertyType || "Type"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isTypeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0"
                    >
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                        Property Type
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            setPropertyType("");
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${propertyType === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          All Types {propertyType === "" && <Check className="w-4 h-4" />}
                        </button>
                        {types.map((t) => {
                          const name = typeof t === "string" ? t : t?.name || "Unknown";
                          const key = typeof t === "object" ? t._id || name : t;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setPropertyType(name);
                                setIsTypeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${propertyType === name ? "text-blue-600 font-medium" : "text-gray-700"}`}
                            >
                              {name} {propertyType === name && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location Dropdown */}
              <div
                className="relative group"
                ref={locationDropdownRef}
                onMouseEnter={() => setIsLocationDropdownOpen(true)}
                onMouseLeave={() => setIsLocationDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {location || "Location"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isLocationDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0"
                    >
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                        Location
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            setLocation("");
                            setIsLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          All Locations {location === "" && <Check className="w-4 h-4" />}
                        </button>
                        {locations.map((loc) => {
                          const name = typeof loc === "string" ? loc : loc?.name || "Unknown";
                          const key = typeof loc === "object" ? loc._id || name : loc;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setLocation(name);
                                setIsLocationDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === name ? "text-blue-600 font-medium" : "text-gray-700"}`}
                            >
                              {name} {location === name && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Approval Dropdown */}
              <div
                className="relative group"
                ref={approvalDropdownRef}
                onMouseEnter={() => setIsApprovalDropdownOpen(true)}
                onMouseLeave={() => setIsApprovalDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsApprovalDropdownOpen(!isApprovalDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {approval || "Approval"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isApprovalDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isApprovalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0"
                    >
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                        Approval
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            setApproval("");
                            setIsApprovalDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          Any {approval === "" && <Check className="w-4 h-4" />}
                        </button>
                        {approvalTypes.map((app) => {
                          const name = typeof app === "string" ? app : app?.name || "Unknown";
                          const key = typeof app === "object" ? app._id || name : app;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setApproval(name);
                                setIsApprovalDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === name ? "text-blue-600 font-medium" : "text-gray-700"}`}
                            >
                              {name} {approval === name && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Budget Dropdown */}
              <div
                className="relative group"
                ref={budgetDropdownRef}
                onMouseEnter={() => setIsBudgetDropdownOpen(true)}
                onMouseLeave={() => setIsBudgetDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {getBudgetLabel()}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isBudgetDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isBudgetDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0"
                    >
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                        Budget
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          onClick={() => selectBudget({})}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!minPrice && !maxPrice ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          Any Budget {!minPrice && !maxPrice && <Check className="w-4 h-4" />}
                        </button>
                        {priceRanges.map((range) => (
                          <button
                            key={range.label}
                            onClick={() => selectBudget(range)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${minPrice === range.min && maxPrice === range.max ? "text-blue-600 font-medium" : "text-gray-700"}`}
                          >
                            {range.label}{" "}
                            {minPrice === range.min && maxPrice === range.max && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 3. SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white text-sm md:text-base font-medium px-5 md:px-10 h-full rounded-full transition-colors duration-300 shadow-md flex items-center justify-center whitespace-nowrap flex-shrink-0 z-10"
            >
              Search
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
