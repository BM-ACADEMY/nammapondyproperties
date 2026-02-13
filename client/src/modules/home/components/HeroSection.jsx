import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [approval, setApproval] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
    // Fetch filter options
    fetch(`${import.meta.env.VITE_API_URL}/properties/filters`)
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types || []);
        setLocations(data.locations || []);
        setApprovalTypes(data.approvals || []);
        setPriceRanges(data.priceRanges || []);
      })
      .catch((err) => console.error("Failed to fetch filters", err));

    // Handle click outside to close dropdowns
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) setIsTypeDropdownOpen(false);
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) setIsLocationDropdownOpen(false);
      if (approvalDropdownRef.current && !approvalDropdownRef.current.contains(event.target)) setIsApprovalDropdownOpen(false);
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(event.target)) setIsBudgetDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    const selected = priceRanges.find((r) => r.min === minPrice && r.max === maxPrice);
    return selected ? selected.label : "Budget";
  };

  return (
    <div className="relative h-[550px] flex items-center justify-center font-sans">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center">
        {/* Headlines */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
          Find Your Dream Property
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 text-center drop-shadow-md">
          Search for plots, villas, and apartments in Pondicherry.
        </p>

        {/* --- SEARCH BAR --- */}
        <div className="">
          <div className="bg-white p-2 md:rounded-full rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-0 transition-transform hover:scale-[1.01] relative z-50 md:h-17 h-auto">
            
            {/* 1. SEARCH INPUT */}
            <div className="flex-grow flex items-center px-6 w-full md:w-auto h-14 md:h-full md:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title..."
                className="w-full bg-transparent text-gray-800 text-sm md:text-base placeholder-gray-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* 2. FILTERS CONTAINER */}
            {/* Added relative z-20 to ensure dropdowns sit on top of the search button below */}
            <div className="relative z-20 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 px-2 md:px-4 w-full md:w-auto">
              
              {/* Type Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {propertyType || "Type"}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {/* Fixed Positioning: Centered on mobile, Right aligned on Desktop */}
                {isTypeDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                    <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">Property Type</div>
                    <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => { setPropertyType(""); setIsTypeDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${propertyType === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                            All Types {propertyType === "" && <Check className="w-4 h-4" />}
                        </button>
                        {types.map((t) => (
                            <button key={t} onClick={() => { setPropertyType(t); setIsTypeDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${propertyType === t ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                                {t} {propertyType === t && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {location || "Location"}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">Location</div>
                      <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => { setLocation(""); setIsLocationDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                            All Locations {location === "" && <Check className="w-4 h-4" />}
                        </button>
                        {locations.map((loc) => (
                            <button key={loc} onClick={() => { setLocation(loc); setIsLocationDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === loc ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                                {loc} {location === loc && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              {/* Approval Dropdown */}
              <div className="relative" ref={approvalDropdownRef}>
                <button
                  onClick={() => setIsApprovalDropdownOpen(!isApprovalDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {approval || "Approval"}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isApprovalDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isApprovalDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">Approval</div>
                      <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => { setApproval(""); setIsApprovalDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                            Any {approval === "" && <Check className="w-4 h-4" />}
                        </button>
                        {approvalTypes.map((app) => (
                            <button key={app} onClick={() => { setApproval(app); setIsApprovalDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === app ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                                {app} {approval === app && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              {/* Budget Dropdown */}
              <div className="relative" ref={budgetDropdownRef}>
                <button
                  onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {getBudgetLabel()}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBudgetDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isBudgetDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                      <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">Budget</div>
                      <div className="max-h-60 overflow-y-auto">
                        <button onClick={() => selectBudget({})} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!minPrice && !maxPrice ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                            Any Budget {!minPrice && !maxPrice && <Check className="w-4 h-4" />}
                        </button>
                        {priceRanges.map((range) => (
                            <button key={range.label} onClick={() => selectBudget(range)} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${minPrice === range.min && maxPrice === range.max ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                                {range.label} {minPrice === range.min && maxPrice === range.max && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                      </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="bg-red-500 hover:bg-red-600 text-white text-base font-medium px-10 h-12 md:h-13 w-full md:w-auto md:rounded-full rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center whitespace-nowrap"
            >
              Search
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;