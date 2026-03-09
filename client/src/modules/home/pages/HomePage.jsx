import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import HeroSection from "../components/HeroSection";
import PropertyTypeList from "../components/PropertyTypeList";
import FeaturedProperties from "../components/FeaturedProperties";
import BannerAdSection from "../components/BannerAdSection";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import MapComponent from "../components/MapComponent";
import PostPropertyCTA from "../components/PostPropertyCTA";
import RecommendedProperties from "../components/RecommendedProperties";
import AdvertiserTypeSection from "../components/AdvertiserTypeSection";

const HomePage = () => {
  const [mapProperties, setMapProperties] = useState([]);

  useEffect(() => {
    const fetchMapProperties = async () => {
      try {
        // Fetch properties for the map (verified, all properties)
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/properties/fetch-all-property?isVerified=true`,
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
      <Helmet>
        <title>Namma Pondy Properties | Buy & Sell in Pondicherry</title>
        <meta
          name="description"
          content="Explore verified plots, villas, and commercial properties in Pondicherry. Trusted real estate experts in Kottakuppam & nearby areas."
        />
      </Helmet>
      <HeroSection />
      <PropertyTypeList />
      <FeaturedProperties />
      <BannerAdSection />
      <RecommendedProperties />
      <AdvertiserTypeSection />

      {/* Map Section */}
      {/* <section className="py-16 bg-[#f9fafb] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="mb-10 text-center md:text-left flex flex-col md:items-start items-center">
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-4 tracking-tight">
              Explore Properties on Map
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              Find your dream home in your preferred location seamlessly.
            </p>
          </div>

          <div className="h-[600px] w-full relative z-0 rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100">
            <MapComponent properties={mapProperties} />
          </div>
        </div>
      </section> */}

      {/* <WhyChooseUs /> */}
      <Testimonials />
      <PostPropertyCTA />
    </div>
  );
};

export default HomePage;
