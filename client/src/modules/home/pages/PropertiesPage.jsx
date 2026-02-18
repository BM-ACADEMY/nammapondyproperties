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

  const handleIncrementView = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/properties/increment-view-count/${id}`,
      );
    } catch (error) {
      console.error("Error incrementing view", error);
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
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-0">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div
                  key={property._id}
                  onClick={() => {
                    handleIncrementView(property._id);
                  }}
                  className="relative h-[550px] rounded-2xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <Link
                    to={`/properties/${property._id}`}
                    className="absolute inset-0 z-20"
                    onClick={() => handleIncrementView(property._id)}
                  >
                    <span className="sr-only">View Details</span>
                  </Link>

                  {/* Background Image */}
                  <img
                    src={
                      property.images?.[0]?.image_url
                        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
                        : "https://placehold.co/600x800?text=No+Image"
                    }
                    alt={property.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-100/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />

                  {/* Top Left Badges */}
                  <div className="absolute top-5 left-5 flex flex-col gap-2 items-start z-10">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {property.view_count || 0}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
                      Negotiable
                    </span>
                  </div>

                  {/* Wishlist Button - Top Right */}
                  <div className="absolute top-5 right-5 z-30">
                    <WishlistButton propertyId={property._id} />
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
                    <div className="mt-auto pointer-events-auto">
                      {/* Developer Badge */}
                      <div className="bg-white text-gray-900 text-[12px] font-bold px-2 py-1 inline-block rounded-sm mb-3 capitalize tracking-widest">
                        {property.property_type || "DEVELOPER"}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-medium mb-2 leading-tight text-white drop-shadow-md line-clamp-2">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-gray-200 text-xs mb-4 font-medium tracking-wide">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        <span className="truncate uppercase">
                          {typeof property.location === "string"
                            ? property.location
                            : `${property.location?.city || ""}, ${property.location?.state || ""}`}
                        </span>
                      </div>

                      {/* Attributes */}
                      <div className="flex items-center gap-4 text-xs text-gray-300 mb-4 border-t border-white/30 pt-4">
                        <div className="flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-amber-400"
                          >
                            <path d="M2 22h20" />
                            <path d="M20 22V5l-1.07-1.07A2 2 0 0 0 17.5 3h-11a2 2 0 0 0-1.4.6L4 5v17" />
                            <path d="M14 10h-4" />
                            <path d="M10 14h4" />
                          </svg>
                          {property.property_type || "Apartment"}
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-gray-200 mb-1">
                          Launch Price
                        </p>
                        <p className="text-2xl font-medium text-white tracking-tight">
                          ₹ {property.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-white hover:bg-[#e7e5f4] text-gray-900 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.98] opacity-90 group-hover:opacity-100 duration-300 pointer-events-none">
                        {/* WhatsApp SVG Icon */}
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-[#3a307f]"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
};

export default PropertiesPage;
