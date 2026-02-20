import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import {
  MapPin,
  Search,
  ArrowRight,
  Filter,
  ChevronDown,
  Check,
  Eye,
} from "lucide-react";
import WishlistButton from "../../../components/Common/WishlistButton";
import PropertyCard from "@/modules/home/components/PropertyCard";
import MapComponent from "../components/MapComponent";
import Loader from "../../../components/Common/Loader";

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [loading, setLoading] = useState(true);

  // --- FILTER DATA STATE ---
  const [types, setTypes] = useState([]);
  const [approvalTypes, setApprovalTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  // --- SELECTION STATE ---
  // Initializing from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  // Independent state for the input field to avoid auto-search
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") || "",
  );

  const [type, setType] = useState(searchParams.get("type") || "");
  const [approval, setApproval] = useState(searchParams.get("approval") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // --- DROPDOWN UI STATE ---
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

  // --- REFS ---
  const typeDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const approvalDropdownRef = useRef(null);
  const budgetDropdownRef = useRef(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/filters`,
        );
        if (res.data) {
          setTypes(res.data.types || []);
          setApprovalTypes(res.data.approvals || []);
          setLocations(res.data.locations || []);
          setPriceRanges(res.data.priceRanges || []);
        }
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();

    // Handle click outside to close dropdowns
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- SYNC STATE FROM URL (Handle Back/Forward navigation) ---
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearchQuery(currentSearch);
    setInputValue(currentSearch);

    setType(searchParams.get("type") || "");
    setApproval(searchParams.get("approval") || "");
    setLocation(searchParams.get("location") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // --- FETCH PROPERTIES WHEN FILTERS CHANGE ---
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, type, approval, location, minPrice, maxPrice]);

  // Update URL params when filters change (except during initial load/sync)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (type) params.type = type;
    if (approval) params.approval = approval;
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    params.page = currentPage;
    setSearchParams(params);
  }, [
    currentPage,
    searchQuery,
    type,
    approval,
    location,
    minPrice,
    maxPrice,
    setSearchParams,
  ]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (type) params.append("type", type);
      if (approval) params.append("approval", approval);
      if (location) params.append("location", location);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("page", currentPage);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?${params.toString()}`,
      );

      if (res.data.properties) {
        setProperties(res.data.properties);
        setTotalPages(res.data.totalPages);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FUNCTIONS FOR UI ---
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
      (r) =>
        String(r.min) === String(minPrice) &&
        String(r.max) === String(maxPrice),
    );
    return selected ? selected.label : `${minPrice} - ${maxPrice}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4">
        {/* --- NEW SEARCH BAR STYLE (Start) --- */}
        <div className="mb-10 relative z-30">
          <div className="bg-white p-2 md:rounded-full rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 md:gap-0 relative">
            {/* 1. SEARCH INPUT */}
            <div className="flex-grow flex items-center px-6 w-full md:w-auto h-14 md:h-14 md:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title..."
                className="w-full bg-transparent text-gray-800 text-sm md:text-base placeholder-gray-400 focus:outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(inputValue);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>

            {/* 2. FILTERS CONTAINER */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 px-2 md:px-4 w-full md:w-auto">
              {/* Type Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {type || "Type"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                    <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                      Property Type
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setType("");
                          setCurrentPage(1);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${type === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        All Types {type === "" && <Check className="w-4 h-4" />}
                      </button>
                      {types.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setType(t);
                            setCurrentPage(1);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${type === t ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          {t} {type === t && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() =>
                    setIsLocationDropdownOpen(!isLocationDropdownOpen)
                  }
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {location || "Location"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                    <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                      Location
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setLocation("");
                          setCurrentPage(1);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        All Locations{" "}
                        {location === "" && <Check className="w-4 h-4" />}
                      </button>
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setLocation(loc);
                            setCurrentPage(1);
                            setIsLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === loc ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          {loc}{" "}
                          {location === loc && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Dropdown */}
              <div className="relative" ref={approvalDropdownRef}>
                <button
                  onClick={() =>
                    setIsApprovalDropdownOpen(!isApprovalDropdownOpen)
                  }
                  className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 font-semibold text-gray-700 text-sm focus:outline-none whitespace-nowrap transition"
                >
                  {approval || "Approval"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isApprovalDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isApprovalDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                    <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                      Approval
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setApproval("");
                          setCurrentPage(1);
                          setIsApprovalDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === "" ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        Any {approval === "" && <Check className="w-4 h-4" />}
                      </button>
                      {approvalTypes.map((app) => (
                        <button
                          key={app}
                          onClick={() => {
                            setApproval(app);
                            setCurrentPage(1);
                            setIsApprovalDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === app ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          {app}{" "}
                          {approval === app && <Check className="w-4 h-4" />}
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
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isBudgetDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isBudgetDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
                    <div className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wider mb-1">
                      Budget
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          selectBudget({});
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${!minPrice && !maxPrice ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        Any Budget{" "}
                        {!minPrice && !maxPrice && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      {priceRanges.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => {
                            selectBudget(range);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${String(minPrice) === String(range.min) && String(maxPrice) === String(range.max) ? "text-blue-600 font-medium" : "text-gray-700"}`}
                        >
                          {range.label}{" "}
                          {String(minPrice) === String(range.min) &&
                            String(maxPrice) === String(range.max) && (
                              <Check className="w-4 h-4" />
                            )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SEARCH BUTTON */}
            <button
              onClick={() => {
                setSearchQuery(inputValue);
                setCurrentPage(1); // Reset page on explicit search click
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-base font-medium px-10 h-12 md:h-13 w-full md:w-auto md:rounded-full rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
        {/* --- NEW SEARCH BAR STYLE (End) --- */}
        {/* Properties Grid */}
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-0">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                No properties found matching your criteria.
              </div>
            )}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
        {/* --- MAP SECTION --- */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Properties on Map
          </h2>
          <div className="h-[600px] w-full relative z-0">
            <MapComponent properties={properties} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
