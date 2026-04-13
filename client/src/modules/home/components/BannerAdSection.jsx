import { useState, useEffect } from "react";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUrl";

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const BannerAdSection = () => {
  const [activeAds, setActiveAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/banner-ads/active`,
        );
        if (response.data.success) {
          setActiveAds(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching active banner ads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveAds();
  }, []);

  if (loading)
    return (
      <section className="w-full my-4 md:my-8">
        <div className="w-full h-[250px] md:h-[350px] lg:h-[450px] bg-gray-200 animate-pulse"></div>
      </section>
    );

  if (activeAds.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 my-4 md:my-8">
      <div className="w-full overflow-hidden rounded-xl md:rounded-2xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={activeAds.length > 1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          className="w-full overflow-hidden"
        >
          {activeAds.map((ad) => (
            <SwiperSlide key={ad._id} className="!w-full !m-0 !p-0">
              <div
                className={`relative w-full h-full duration-500 ${ad.linkUrl?.trim() ? "hover:shadow-2xl cursor-pointer" : ""}`}
              >
                {ad.linkUrl?.trim() ? (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <AdContent ad={ad} />
                  </a>
                ) : (
                  <AdContent ad={ad} />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const AdContent = ({ ad }) => (
  <div className="relative w-full h-[250px] md:h-[350px] lg:h-[450px] overflow-hidden">
    <img
      src={getImageUrl(ad.imageUrl)}
      alt={ad.title}
      className="w-full h-full object-cover block transition-transform duration-700"
    />
  </div>
);

export default BannerAdSection;
