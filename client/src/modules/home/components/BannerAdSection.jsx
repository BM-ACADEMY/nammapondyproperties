import { useState, useEffect } from "react";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUrl";

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

    if (loading) return null;
    if (activeAds.length === 0) return null;

    // For now, we display the most recent active ad
    const ad = activeAds[0];

    return (
        <section className="py-12 bg-[#f9fafb]">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className={`relative overflow-hidden rounded-[24px] shadow-lg duration-500 ${ad.linkUrl?.trim() ? 'hover:shadow-2xl cursor-pointer' : ''}`}>
                    {ad.linkUrl?.trim() ? (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <AdContent ad={ad} />
                        </a>
                    ) : (
                        <AdContent ad={ad} />
                    )}
                </div>
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
