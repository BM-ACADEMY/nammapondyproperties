import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "@/context/NavContext";

/**
 * Reusable Property Search Bar
 * @param {string} variant - 'hero' or 'header'
 * @param {boolean} showFilters - Whether to show Location/Approval/Budget dropdowns
 * @param {boolean} showKeyword - Whether to show the keyword search input
 */
const PropertySearchBar = ({
    variant = "hero",
    showFilters = true,
    showKeyword = true
}) => {
    const navigate = useNavigate();
    const { locations, approvalTypes, priceRanges } = useNav();

    // --- STATE MANAGEMENT ---
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");
    const [approval, setApproval] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Dropdown UI State
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false);
    const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

    // Refs for click-outside
    const locationRef = useRef(null);
    const approvalRef = useRef(null);
    const budgetRef = useRef(null);

    // Animated Placeholder State
    const searchPlaceholders = [
        "Search by title...",
        "Search by description...",
        "Search by area...",
    ];
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    // --- EFFECTS ---
    useEffect(() => {
        const placeholderInterval = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
        }, 3000);

        const handleClickOutside = (event) => {
            if (locationRef.current && !locationRef.current.contains(event.target)) setIsLocationDropdownOpen(false);
            if (approvalRef.current && !approvalRef.current.contains(event.target)) setIsApprovalDropdownOpen(false);
            if (budgetRef.current && !budgetRef.current.contains(event.target)) setIsBudgetDropdownOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(placeholderInterval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchPlaceholders.length]);

    // --- HANDLERS ---
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (location) params.append("location", location);
        if (approval) params.append("approval", approval);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        navigate(`/properties?${params.toString()}`);
    };

    const selectBudget = (range) => {
        setMinPrice(range.min || "");
        setMaxPrice(range.max || "");
        setIsBudgetDropdownOpen(false);
    };

    const getBudgetLabel = () => {
        if (!minPrice && !maxPrice) return "Budget";
        const selected = priceRanges.find(r => String(r.min) === String(minPrice) && String(r.max) === String(maxPrice));
        return selected ? selected.label : `${minPrice} - ${maxPrice}`;
    };

    const isHeader = variant === "header";

    return (
        <div className={`w-full ${isHeader ? "max-w-4xl" : "max-w-6xl"} flex justify-center`}>
            <motion.div
                initial={isHeader ? { opacity: 0, scale: 0.95 } : { width: "10%", opacity: 0 }}
                animate={isHeader ? { opacity: 1, scale: 1 } : { width: "100%", opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`bg-white p-2 rounded-full shadow-2xl flex flex-row items-center relative z-[100] w-full overflow-visible ${isHeader ? "h-12 border border-gray-200" : "h-14 md:h-[72px]"
                    }`}
            >
                {/* 1. SEARCH INPUT */}
                {showKeyword && (
                    <div className={`flex-grow flex items-center ${isHeader ? "pl-4 pr-1" : "pl-4 pr-2 md:px-6"} h-full min-w-0 relative ${showFilters ? "md:border-r border-gray-100" : ""}`}>
                        <Search className={`${isHeader ? "w-4 h-4" : "w-5 h-5"} text-gray-400 mr-2 flex-shrink-0`} />

                        <div className="relative w-full h-full flex items-center overflow-hidden">
                            {!searchQuery && (
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={placeholderIdx}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className={`absolute left-0 text-gray-400 ${isHeader ? "text-xs" : "text-sm md:text-base"} pointer-events-none whitespace-nowrap`}
                                    >
                                        {searchPlaceholders[placeholderIdx]}
                                    </motion.span>
                                </AnimatePresence>
                            )}

                            <input
                                type="text"
                                className={`w-full bg-transparent text-gray-800 ${isHeader ? "text-xs" : "text-sm md:text-base"} focus:outline-none min-w-0 relative z-10`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>
                )}

                {/* 2. FILTERS CONTAINER */}
                {showFilters && (
                    <div className={`flex items-center px-4 gap-1 md:gap-4 flex-shrink-0 ${!showKeyword ? "w-full justify-between" : ""}`}>
                        {/* Location */}
                        <div
                            className="relative"
                            ref={locationRef}
                            onMouseEnter={() => !isHeader && setIsLocationDropdownOpen(true)}
                            onMouseLeave={() => !isHeader && setIsLocationDropdownOpen(false)}
                        >
                            <button
                                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 font-semibold text-gray-700 transition ${isHeader ? "text-[10px]" : "text-sm"}`}
                            >
                                <span className="max-w-[80px] truncate">{location || "Location"}</span>
                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isLocationDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[110] left-1/2 -translate-x-1/2"
                                    >
                                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50">Select Location</div>
                                        <button onClick={() => { setLocation(""); setIsLocationDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!location ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                            Anywhere {!location && <Check className="w-3 h-3" />}
                                        </button>
                                        <div className="max-h-60 overflow-y-auto">
                                            {locations.map((loc) => {
                                                const name = typeof loc === "string" ? loc : loc?.name || "Unknown";
                                                return (
                                                    <button key={name} onClick={() => { setLocation(name); setIsLocationDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === name ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                                        {name} {location === name && <Check className="w-3 h-3" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Approval */}
                        <div
                            className="relative"
                            ref={approvalRef}
                            onMouseEnter={() => !isHeader && setIsApprovalDropdownOpen(true)}
                            onMouseLeave={() => !isHeader && setIsApprovalDropdownOpen(false)}
                        >
                            <button
                                onClick={() => setIsApprovalDropdownOpen(!isApprovalDropdownOpen)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 font-semibold text-gray-700 transition ${isHeader ? "text-[10px]" : "text-sm"}`}
                            >
                                <span className="max-w-[80px] truncate">{approval || "Approval"}</span>
                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isApprovalDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isApprovalDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[110] left-1/2 -translate-x-1/2"
                                    >
                                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50">Select Approval</div>
                                        <button onClick={() => { setApproval(""); setIsApprovalDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!approval ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                            Any {!approval && <Check className="w-3 h-3" />}
                                        </button>
                                        {approvalTypes.map((app) => {
                                            const name = typeof app === "string" ? app : app?.name || "Unknown";
                                            return (
                                                <button key={name} onClick={() => { setApproval(name); setIsApprovalDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === name ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                                    {name} {approval === name && <Check className="w-3 h-3" />}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Budget */}
                        <div
                            className="relative"
                            ref={budgetRef}
                            onMouseEnter={() => !isHeader && setIsBudgetDropdownOpen(true)}
                            onMouseLeave={() => !isHeader && setIsBudgetDropdownOpen(false)}
                        >
                            <button
                                onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 font-semibold text-gray-700 transition ${isHeader ? "text-[10px]" : "text-sm"}`}
                            >
                                <span className="max-w-[100px] truncate">{getBudgetLabel()}</span>
                                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isBudgetDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isBudgetDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-[110] left-1/2 -translate-x-1/2"
                                    >
                                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50">Select Budget</div>
                                        <button onClick={() => { selectBudget({}); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!minPrice && !maxPrice ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                            Any Budget {!minPrice && !maxPrice && <Check className="w-3 h-3" />}
                                        </button>
                                        {priceRanges.map((range) => (
                                            <button key={range.label} onClick={() => { selectBudget(range); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${String(minPrice) === String(range.min) && String(maxPrice) === String(range.max) ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                                                {range.label} {String(minPrice) === String(range.min) && String(maxPrice) === String(range.max) && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* 3. SEARCH BUTTON */}
                <button
                    onClick={handleSearch}
                    className={`bg-red-500 cursor-pointer hover:bg-red-600 text-white font-medium h-full rounded-full transition-colors duration-300 shadow-md flex items-center justify-center whitespace-nowrap flex-shrink-0 z-10 ${isHeader ? "px-4 md:px-6 text-xs" : "px-5 md:px-10 text-sm md:text-base"
                        }`}
                >
                    Search
                </button>
            </motion.div>
        </div>
    );
};

export default PropertySearchBar;
