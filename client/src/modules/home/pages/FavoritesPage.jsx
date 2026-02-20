import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Heart, Home, Store, Eye } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && user.wishlist) {
      if (user.wishlist.length === 0) {
        setFavorites([]);
        return;
      }
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) =>
          user.wishlist.some(
            (w) => (typeof w === "string" ? w : w._id) === fav._id,
          ),
        ),
      );
    } else if (user) {
      fetchFavorites();
    }
  }, [user?.wishlist]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data && res.data.wishlist) {
        setFavorites(res.data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching favorites", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b5998]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white rounded-[24px] shadow-sm p-12 text-center border border-gray-100 max-w-md w-full relative z-10 mx-4">
          <div className="mx-auto w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-[#3b5998]/60" />
          </div>
          <h2 className="text-2xl font-light text-slate-900 mb-3 tracking-tight">
            Please <span className="font-bold italic">Log In</span>
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            You need to be logged in to view and manage your favorite properties.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center py-3 px-8 bg-[#3b5998] text-white rounded-xl hover:bg-[#2d4373] transition-colors font-semibold shadow-sm w-full"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 relative overflow-hidden">

      {/* Background sparkle effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 border-b border-gray-200/60 pb-8 mt-4">
          <div>
            <div className="inline-block border border-[#d4af37]/60 text-[#b58900] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-white/40 backdrop-blur-sm shadow-sm cursor-default">
              Your Collection
            </div>

            <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight flex items-center gap-3">
              My Favorites
            </h1>
          </div>

          <div className="text-xs font-bold uppercase tracking-widest border border-slate-200 text-slate-500 bg-white px-5 py-2.5 rounded-full shadow-sm">
            {favorites.length} Saved Properties
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {favorites.map((property) => (

              /* --- NEW DARK IMAGE CARD DESIGN --- */
              <div
                key={property._id}
                className="relative w-full h-[420px] sm:h-[460px] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] group block"
              >
                {/* Background Image & Link Area */}
                <Link to={`/properties/${property._id}`} className="absolute inset-0 z-0 block">
                  <img
                    src={
                      property.images?.[0]?.image_url
                        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={property.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${property.isSold ? "grayscale-[0.8]" : ""}`}
                  />
                  {/* Heavy dark gradient to make text pop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15171e] via-[#15171e]/70 to-black/20"></div>
                </Link>

                {/* Top Left Badges */}
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 pointer-events-none">
                  {property.isSold ? (
                    <span className="bg-red-600 shadow-lg text-white text-[11px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider border border-white/20">
                      Sold Out
                    </span>
                  ) : (
                    <>
                      <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {property.view_count || 0}
                      </span>
                      <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
                        Negotiable
                      </span>
                    </>
                  )}
                </div>

                {/* Top Right Wishlist (Heart Button) */}
                <div className="absolute top-5 right-5 z-20">
                  <div className="bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm">
                    <WishlistButton propertyId={property._id} />
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col">

                  {/* Property Type Pill */}
                  <div className="bg-white text-gray-900 text-[11px] font-bold px-3 py-1 rounded-md w-max mb-3 shadow-sm tracking-wide">
                    {property.propertyType || property.type?.name || "Property"}
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-2xl font-bold line-clamp-1 mb-2 drop-shadow-md">
                    {property.title}
                  </h3>

                  {/* Location & Agent Details */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center text-gray-300 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] mr-2" />
                      <span className="truncate">
                        {typeof property.location === "string"
                          ? property.location
                          : `${property.location?.city || ""}, ${property.location?.state || ""}`}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-300 text-xs font-medium">
                      <Store className="w-3.5 h-3.5 text-[#d4af37] mr-2" />
                      <span className="truncate">{property.seller_id?.name || "Verified Agent"}</span>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] w-full bg-white/20 mb-4"></div>

                  {/* Price Block */}
                  <div className="mb-5">
                    {property.isSold && property.soldPrice ? (
                      <>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1">Sold Price</p>
                        <p className="text-white text-2xl font-bold tracking-tight">
                          ₹ {property.soldPrice.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1">
                          {property.isSold ? "Price" : "Launch Price"}
                        </p>
                        <p className="text-white text-2xl font-bold tracking-tight">
                          ₹ {property.price.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Buttons (pointer-events-auto restores clickability inside the text wrapper) */}
                  <div className="pointer-events-auto">
                    {property.isSold ? (
                      <button disabled className="w-full bg-gray-500/50 text-white text-sm font-bold py-3.5 rounded-xl cursor-not-allowed backdrop-blur-sm">
                        Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const sellerPhone = property.seller_id?.phone || "919000000000";
                          const locationStr = typeof property.location === "string"
                            ? property.location
                            : `${property.location?.city || ""}, ${property.location?.state || ""}`;
                          const msg = `Hi, I am interested in your property: ${property.title} located at ${locationStr}.`;
                          window.open(`https://wa.me/${sellerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full bg-white hover:bg-[#e7e5f4] text-gray-900 text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                      >
                        {/* WhatsApp SVG Icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3a307f]">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- BRAND MATCHED EMPTY STATE --- */
          <div className="bg-white rounded-[24px] p-16 text-center border border-dashed border-gray-300 shadow-sm mt-8">
            <div className="mx-auto w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-6">
              <Home className="w-10 h-10 text-[#3b5998]/60" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Favorites Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
              You haven't saved any properties to your collection yet. Start exploring and save your dream homes here!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-3 px-8 bg-[#3b5998] text-white rounded-xl hover:bg-[#2d4373] transition-colors font-semibold shadow-sm"
            >
              Browse Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;