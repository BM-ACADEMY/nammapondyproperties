import { Helmet } from "react-helmet-async";
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
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import PhoneUpdateModal from "../../../components/Common/PhoneUpdateModal";

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // --- FILTER DATA STATE ---
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

  const [approval, setApproval] = useState(searchParams.get("approval") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [businessType, setBusinessType] = useState(
    searchParams.get("businessType") || "",
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  // --- DROPDOWN UI STATE ---
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

  // --- REFS ---
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
          // setTypes removed
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
      // typeDropdownRef logic removed
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

    // setType removed
    setApproval(searchParams.get("approval") || "");
    setLocation(searchParams.get("location") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBusinessType(searchParams.get("businessType") || "");
    setCategory(searchParams.get("category") || "");
    setType(searchParams.get("type") || "");
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // --- FETCH PROPERTIES WHEN FILTERS CHANGE ---
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchQuery,
    // type removed
    approval,
    location,
    minPrice,
    maxPrice,
    businessType,
    category,
    type,
  ]);

  // Update URL params when filters change (except during initial load/sync)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    // if (type) params.type = type; // Removed
    if (approval) params.approval = approval;
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (businessType) params.businessType = businessType;
    if (category) params.category = category;
    if (type) params.type = type;
    params.page = currentPage;
    setSearchParams(params);
  }, [
    currentPage,
    searchQuery,
    // type removed
    approval,
    location,
    minPrice,
    maxPrice,
    businessType,
    category,
    type,
    setSearchParams,
  ]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      // if (type) params.append("type", type); // Removed
      if (approval) params.append("approval", approval);
      if (location) params.append("location", location);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (businessType) params.append("businessType", businessType);
      if (category) params.append("category", category);
      if (type) params.append("type", type);
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

  const handleWhatsAppClick = (e, property) => {
    e.stopPropagation();
    if (!property || !property.seller) {
      toast.error("Seller information missing");
      return;
    }

    if (user) {
      if (!user.phone) {
        setSelectedProperty(property);
        setShowPhoneModal(true);
      } else {
        submitEnquiry(property, user.name, user.email, user.phone);
      }
    } else {
      toast.error("Please login to contact the seller");
      navigate("/login", { state: { from: loc.pathname } });
    }
  };

  const submitEnquiry = async (property, name, email, phone) => {
    const sellerPhone = property.seller.phone || "919000000000";
    const locStr =
      typeof property.location === "string"
        ? property.location
        : `${property.location?.city || ""}, ${property.location?.state || ""}`;
    const message = `Hi, I am interested in your property: ${property.basicInfo?.title || "Untitled"} located at ${locStr}. Please provide more details.`;
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/enquiries/create`, {
        property_id: property._id,
        seller_id: property.seller._id || property.seller,
        message: message,
        name,
        email,
        phone,
      });
      toast.success("Enquiry sent! Opening WhatsApp...");
    } catch (error) {
      console.error(error);
      toast.error("Redirecting to WhatsApp...");
    } finally {
      window.open(whatsappUrl, "_blank");
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
      <Helmet>
        <title>Properties for Sale in Pondicherry | Verified Listings</title>
        <meta
          name="description"
          content="Browse verified residential and commercial properties in Pondicherry. Transparent pricing and expert guidance for buyers."
        />
      </Helmet>
      <div className="container mx-auto px-4">
        {/* --- NEW SEARCH BAR STYLE (Start) --- */}
        <div className="mb-10 relative z-30">
          <div className="bg-white p-2 md:rounded-full rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 md:gap-0 relative">
            {/* 1. SEARCH INPUT */}
            <div className="flex-grow flex items-center px-6 w-full md:w-auto h-14 md:h-14 md:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search properties (title, description, location...)"
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
              {/* Type Dropdown Removed */}

              {/* Location Dropdown */}
              <div
                className="relative"
                ref={locationDropdownRef}
                onMouseEnter={() => setIsLocationDropdownOpen(true)}
                onMouseLeave={() => setIsLocationDropdownOpen(false)}
              >
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
                  <div className="absolute top-full mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
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
                      {locations.map((loc) => {
                        const name =
                          typeof loc === "string"
                            ? loc
                            : loc?.name || "Unknown";
                        const key =
                          typeof loc === "object" ? loc._id || name : loc;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setLocation(name);
                              setCurrentPage(1);
                              setIsLocationDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${location === name ? "text-blue-600 font-medium" : "text-gray-700"}`}
                          >
                            {name}{" "}
                            {location === name && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Dropdown */}
              <div
                className="relative"
                ref={approvalDropdownRef}
                onMouseEnter={() => setIsApprovalDropdownOpen(true)}
                onMouseLeave={() => setIsApprovalDropdownOpen(false)}
              >
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
                  <div className="absolute top-full mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
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
                      {approvalTypes.map((app) => {
                        const name =
                          typeof app === "string"
                            ? app
                            : app?.name || "Unknown";
                        const key =
                          typeof app === "object" ? app._id || name : app;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setApproval(name);
                              setCurrentPage(1);
                              setIsApprovalDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${approval === name ? "text-blue-600 font-medium" : "text-gray-700"}`}
                          >
                            {name}{" "}
                            {approval === name && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget Dropdown */}
              <div
                className="relative"
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
                {isBudgetDropdownOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden py-2 border border-gray-100 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0">
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
                <PropertyCard
                  key={property._id}
                  property={property}
                  onWhatsAppClick={handleWhatsAppClick}
                />
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
      <PhoneUpdateModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={(updatedPhone) => {
          if (user && selectedProperty) {
            submitEnquiry(
              selectedProperty,
              user.name,
              user.email,
              updatedPhone,
            );
          }
        }}
      />
    </div>
  );
};

export default PropertiesPage;
