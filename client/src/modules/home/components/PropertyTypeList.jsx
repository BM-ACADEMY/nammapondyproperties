
import { Home, Building2, LandPlot, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyTypeList = () => {
    const navigate = useNavigate();

    const types = [
        { name: 'Plots', icon: <LandPlot className="w-8 h-8 text-blue-600" />, type: 'Plot' },
        { name: 'Villas', icon: <Home className="w-8 h-8 text-green-600" />, type: 'Villa' },
        { name: 'Apartments', icon: <Building2 className="w-8 h-8 text-purple-600" />, type: 'Apartment' },
        { name: 'Commercial', icon: <Store className="w-8 h-8 text-orange-600" />, type: 'Commercial' },
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Explore Property Types</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {types.map((item) => (
                        <div
                            key={item.name}
                            onClick={() => navigate(`/properties?type=${item.type}`)}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center transform hover:-translate-y-1"
                        >
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                {item.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-gray-700">{item.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PropertyTypeList;
