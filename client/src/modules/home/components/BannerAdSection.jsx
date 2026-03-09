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
                    `${import.meta.env.VITE_API_URL}/banner-ads/active`
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

    if (loading) return (
        <section className="py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="w-full aspect-[21/6] md:aspect-[21/5] lg:aspect-[21/4] bg-gray-200 animate-pulse rounded-[24px]"></div>
            </div>
        </section>
    );

    if (activeAds.length === 0) return null;

    return (
        <section className="py-12">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={activeAds.length > 1}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    className="rounded-[24px] shadow-lg overflow-hidden"
                >
                    {activeAds.map((ad) => (
                        <SwiperSlide key={ad._id}>
                            <div className={`relative w-full h-full duration-500 ${ad.linkUrl?.trim() ? 'hover:shadow-2xl cursor-pointer' : ''}`}>
                                {ad.linkUrl?.trim() ? (
                                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
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
    <div className="relative w-full aspect-[21/6] md:aspect-[21/5] lg:aspect-[21/4] overflow-hidden">
        <img
            src={getImageUrl(ad.imageUrl)}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700"
        />
    </div>
);

export default BannerAdSection;
