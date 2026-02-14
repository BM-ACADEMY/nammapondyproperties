import { useState, useEffect } from "react";
import { Home, Building2, LandPlot, Store, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PropertyTypeList = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get icon and color based on type name
  const getIconAndColorForType = (typeName) => {
    const lowerType = typeName.toLowerCase();

    if (lowerType.includes("plot")) {
      return {
        icon: <LandPlot className="w-8 h-8 text-white" />,
        gradient: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
      };
    } else if (lowerType.includes("villa") || lowerType.includes("house")) {
      return {
        icon: <Home className="w-8 h-8 text-white" />,
        gradient: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
      };
    } else if (lowerType.includes("apartment") || lowerType.includes("flat")) {
      return {
        icon: <Building2 className="w-8 h-8 text-white" />,
        gradient: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
      };
    } else if (
      lowerType.includes("commercial") ||
      lowerType.includes("shop") ||
      lowerType.includes("office")
    ) {
      return {
        icon: <Store className="w-8 h-8 text-white" />,
        gradient: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
      };
    } else {
      return {
        icon: <Home className="w-8 h-8 text-white" />,
        gradient: "from-gray-500 to-gray-600",
        bgColor: "bg-gray-50",
      };
    }
  };

  // Fetch property types from API
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/properties/filters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.types) {
          // Map each type to an icon and color
          const mappedTypes = data.types.map((type) => ({
            name: type,
            ...getIconAndColorForType(type),
            type: type,
          }));
          setTypes(mappedTypes);
        }
      })
      .catch((err) => console.error("Failed to fetch property types", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Explore Property Types
        </h2>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md animate-pulse"
              >
                <div className="bg-gray-200 w-16 h-16 rounded-full mx-auto mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mx-auto w-3/4"></div>
              </div>
            ))}
          </div>
        ) : types.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Property Types Available
              </h3>
              <p className="text-gray-500">
                Property types will appear here once they are added to the
                system.
              </p>
            </div>
          </div>
        ) : (
          /* Property Types Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {types.map((item) => (
              <div
                key={item.name}
                onClick={() => navigate(`/properties?type=${item.type}`)}
                className={`${item.bgColor} p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center transform hover:-translate-y-2 hover:scale-105 border border-gray-100 hover:border-gray-200`}
              >
                <div
                  className={`bg-gradient-to-br ${item.gradient} p-4 rounded-full mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-6`}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyTypeList;
