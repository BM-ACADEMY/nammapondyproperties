import { useEffect, useState } from "react";
import axios from "axios";
import HeroSection from "../components/HeroSection";
import PropertyTypeList from "../components/PropertyTypeList";
import FeaturedProperties from "../components/FeaturedProperties";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import MapComponent from "../components/MapComponent";

const HomePage = () => {
  const [mapProperties, setMapProperties] = useState([]);

  useEffect(() => {
    const fetchMapProperties = async () => {
      try {
        // Fetch properties for the map (verified, limit 20 to show a good spread)
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?is_verified=true&limit=20`
        );
        if (Array.isArray(res.data.properties)) {
          setMapProperties(res.data.properties);
        } else if (Array.isArray(res.data)) {
          setMapProperties(res.data);
        }
      } catch (error) {
        console.error("Error fetching map properties", error);
      }
    };
    fetchMapProperties();
  }, []);

  return (
    <div>
      <HeroSection />
      <PropertyTypeList />
      <FeaturedProperties />

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-medium font-serif text-gray-900">
              Explore Properties on Map
            </h2>
            <p className="text-gray-600 font-serif mt-2">
              Find your dream home in your preferred location
            </p>
          </div>
          <div className="h-[600px] w-full relative z-0 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapComponent properties={mapProperties} />
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <Testimonials />
    </div>
  );
};

export default HomePage;
