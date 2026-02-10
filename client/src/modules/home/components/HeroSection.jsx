
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyType, setPropertyType] = useState('');

    const handleSearch = () => {
        navigate(`/properties?search=${searchQuery}&type=${propertyType}`);
    };

    return (
        <div className="relative bg-gray-900 h-[500px] flex items-center justify-center">
            {/* Background Image */}
            <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
            />

            <div className="relative z-10 text-center px-4 w-full max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Find Your Dream Property in Pondicherry
                </h1>
                <p className="text-xl text-gray-200 mb-8">
                    Browse verified plots, villas, apartments, and commercial properties.
                </p>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by location, builder, or project..."
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="Plot">Plots</option>
                        <option value="Villa">Villas</option>
                        <option value="Apartment">Apartments</option>
                        <option value="Commercial">Commercial</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center font-semibold"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
