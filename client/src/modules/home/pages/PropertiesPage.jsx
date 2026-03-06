import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "@/modules/home/components/PropertyCard";
import MapComponent from "../components/MapComponent";
import Loader from "../../../components/Common/Loader";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import PhoneUpdateModal from "../../../components/Common/PhoneUpdateModal";
import PropertySidebarFilter from "../components/PropertySidebarFilter";

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // --- FILTER STATE (Synced with URL) ---
  const getParamArray = (key) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    type: getParamArray("type"),
    location: getParamArray("location"),
    approval: getParamArray("approval"),
    bedrooms: getParamArray("bedrooms"),
  });

  // SYNC FROM URL
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      type: getParamArray("type"),
      location: getParamArray("location"),
      approval: getParamArray("approval"),
      bedrooms: getParamArray("bedrooms"),
    });
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // FETCH PROPERTIES
  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.type.length) params.append("type", filters.type.join(","));
      if (filters.location.length) params.append("location", filters.location.join(","));
      if (filters.approval.length) params.append("approval", filters.approval.join(","));
      if (filters.bedrooms.length) params.append("bedrooms", filters.bedrooms.join(","));
      params.append("page", currentPage);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?${params.toString()}`
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

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      if (value.length > 0) newParams.set(key, value.join(","));
      else newParams.delete(key);
    } else {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    }
    newParams.set("page", "1"); // Reset to page 1 on filter
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({ page: "1" });
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

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-8 font-sans">
      <Helmet>
        <title>Properties for Sale in Pondicherry | Verified Listings</title>
        <meta
          name="description"
          content="Browse verified residential and commercial properties in Pondicherry. Transparent pricing and expert guidance for buyers."
        />
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-1/4">
            <PropertySidebarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Properties Content */}
          <main className="w-full lg:w-3/4">
            {loading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 relative z-0">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      onWhatsAppClick={handleWhatsAppClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <div className="text-gray-400 mb-4 inline-block p-4 bg-gray-50 rounded-full">
                      <SearchIcon className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 font-medium">No properties found matching your criteria.</p>
                    <button onClick={clearFilters} className="text-blue-600 font-semibold mt-2 hover:underline">Clear all filters</button>
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
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
                >
                  Previous
                </button>
                <span className="px-5 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg font-medium shadow-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
                >
                  Next
                </button>
              </div>
            )}

            {/* Map Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Explore Properties on Map
              </h2>
              <div className="h-[500px] w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative z-0">
                <MapComponent properties={properties} />
              </div>
            </div>
          </main>
        </div>
      </div>
      <PhoneUpdateModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={(updatedPhone) => {
          if (user && selectedProperty) {
            submitEnquiry(selectedProperty, user.name, user.email, updatedPhone);
          }
        }}
      />
    </div>
  );
};

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default PropertiesPage;
