
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, ArrowRight } from 'lucide-react';
import axios from 'axios';

const FeaturedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                // Fetching all for now, utilizing 6 on frontend.
                // Ideally backend should support ?limit=6
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/fetch-all-property`);
                // Assuming res.data is array.
                if (Array.isArray(res.data)) {
                    setProperties(res.data.slice(0, 6));
                }
            } catch (error) {
                console.error("Error fetching properties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    if (loading) return <div className="text-center py-10">Loading Properties...</div>;

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Featured Properties</h2>
                        <p className="text-gray-600 mt-2">Check out our latest verified listings</p>
                    </div>
                    <Link to="/properties" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-800">
                        View All Properties <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
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

                                <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-500">
                                    {/* Placeholder attributes if not in model yet */}
                                    <div className="flex items-center">
                                        <span className="font-medium">{property.property_type}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{property.area_size}</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/properties/${property._id}`}
                                    className="block w-full text-center bg-gray-900 text-white mt-4 py-2 rounded hover:bg-gray-800 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/properties" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
                        View All Properties <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProperties;
