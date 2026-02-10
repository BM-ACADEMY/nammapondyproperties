
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Search, ArrowRight, Filter } from 'lucide-react';

const PropertiesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    useEffect(() => {
        fetchProperties();
        // Update URL params
        const params = {};
        if (search) params.search = search;
        if (type) params.type = type;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        params.page = currentPage;
        setSearchParams(params);
    }, [currentPage, search, type, minPrice, maxPrice]); // Fetch on dependency change (debounce could be added)

    // Debounce or manual trigger is better for search/price, but for simplicity here we use effect or handleSearch
    // Let's rely on manual search button or effect with debounce. Ideally effect.
    // To avoid too many calls, let's wrap fetch in a function called by UI or effect.

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const page = searchParams.get('page') || 1;
            setCurrentPage(Number(page));

            const query = new URLSearchParams(searchParams).toString();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/fetch-all-property?${query}`);

            if (res.data.properties) {
                setProperties(res.data.properties);
                setTotalPages(res.data.totalPages);
            } else {
                setProperties([]); // Fallback
            }
        } catch (error) {
            console.error("Error fetching properties", error);
        } finally {
            setLoading(false);
        }
    };

    const handleIncrementView = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/properties/increment-view-count/${id}`);
        } catch (error) {
            console.error("Error incrementing view", error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Filters Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Property</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search location, title..."
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Plot">Plots</option>
                                <option value="Villa">Villas</option>
                                <option value="Apartment">Apartments</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        {/* 
                        <button 
                            onClick={fetchProperties}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center h-10 mt-6 md:mt-0"
                        >
                            <Filter className="w-4 h-4 mr-2" /> Apply
                        </button>
                        */}
                    </div>
                </div>

                {/* Properties Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.length > 0 ? properties.map((property) => (
                            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                                <div className="relative h-48">
                                    <img
                                        src={property.images?.[0]?.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                                        {property.status === 'available' ? 'FOR SALE' : property.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                                        <span className="text-blue-600 font-bold whitespace-nowrap">₹ {property.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {property.location}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                                    <Link
                                        to={`/properties/${property._id}`}
                                        onClick={() => handleIncrementView(property._id)}
                                        className="block w-full text-center bg-gray-900 text-white mt-4 py-2 rounded hover:bg-gray-800 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        )) : <div className="col-span-3 text-center py-10">No properties found matching your criteria.</div>}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 space-x-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
