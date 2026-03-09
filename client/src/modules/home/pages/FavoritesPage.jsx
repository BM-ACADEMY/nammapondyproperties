import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Heart, ArrowRight, Store, Eye, BookmarkX } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { formatIndianPrice } from "../../../utils/formatPrice";
import WishlistButton from "../../../components/Common/WishlistButton";
import { getImageUrl } from "@/utils/imageUrl";

const getLocation = (loc) => {
  if (!loc) return "Location not specified";
  if (typeof loc === "string") return loc;
  return [loc.city, loc.state].filter(Boolean).join(", ");
};

/* ── skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-44 animate-pulse shadow-sm border border-gray-100">
    <div className="w-full sm:w-44 h-44 sm:h-full bg-gray-200 shrink-0" />
    <div className="flex-1 p-5 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded-full w-1/3" />
      <div className="h-5 bg-gray-200 rounded-full w-2/3" />
      <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      <div className="mt-auto flex gap-3">
        <div className="h-9 bg-gray-200 rounded-full w-28" />
        <div className="h-9 bg-gray-200 rounded-full w-28" />
      </div>
    </div>
  </div>
);

/* ── main component ── */
const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  /* sync with wishlist changes */
  useEffect(() => {
    if (user && user.wishlist) {
      if (user.wishlist.length === 0) {
        setFavorites([]);
        return;
      }
      setFavorites((prev) =>
        prev.filter((fav) =>
          user.wishlist.some(
            (w) => (typeof w === "string" ? w : w._id) === fav._id,
          ),
        ),
      );
    } else if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data?.wishlist) setFavorites(res.data.wishlist);
    } catch (err) {
      console.error("Error fetching favorites", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── unauthenticated state ── */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.07)] p-12 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Sign in to see your favorites
          </h2>
          <p className="text-gray-400 text-sm mb-7 leading-relaxed">
            Save properties you love and access them anytime in one place.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2.5 px-6 rounded-full transition-colors"
          >
            Log in <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── empty state ── */
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.07)] p-12 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <BookmarkX className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No saved properties yet
          </h2>
          <p className="text-gray-400 text-sm mb-7 leading-relaxed">
            Browse listings and tap the heart icon to save the properties you
            love.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2.5 px-6 rounded-full transition-colors"
          >
            Browse properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── main content ── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">
                Your Collection
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-2.5">
                <Heart className="w-6 h-6 text-indigo-400 fill-indigo-100" />
                My Favorites
              </h1>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full whitespace-nowrap shrink-0">
              {favorites.length}{" "}
              {favorites.length === 1 ? "property" : "properties"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Property Cards ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {favorites.map((property) => {
          const imgUrl = getImageUrl(property.media?.featuredImage || property.media?.images?.[0]);
          const locStr = getLocation(property.location);
          const sellerPhone = property.seller_id?.phone;

          const whatsappMsg = `Hi, I am interested in your property: ${property.basicInfo?.title || "Untitled"} located at ${locStr}.`;
          const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(whatsappMsg)}`;

          return (
            <div
              key={property._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row group"
            >
              {/* ── Image ── */}
              <Link
                to={`/properties/${property.slug || property._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full sm:w-48 md:w-56 h-52 sm:h-auto shrink-0 overflow-hidden block"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={property.basicInfo?.title || "Property"}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${property.isSold ? "grayscale-[0.6]" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Sold badge */}
                {property.isSold && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Sold
                  </span>
                )}

                {/* View count */}
                {!property.isSold && (
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                    <Eye className="w-3 h-3" />
                    {property.view_count || 0} views
                  </span>
                )}
              </Link>

              {/* ── Details ── */}
              <div className="flex-1 p-5 flex flex-col min-w-0">
                {/* Type pill + Wishlist */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                    {property.businessType?.name ||
                      property.basicInfo?.propertyType ||
                      "Property"}
                  </span>
                  <div className="shrink-0 -mt-0.5">
                    <WishlistButton propertyId={property._id} />
                  </div>
                </div>

                {/* Title */}
                <Link
                  to={`/properties/${property.slug || property._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1 hover:text-indigo-600 transition-colors mb-1.5">
                    {property.basicInfo?.title || "Untitled Property"}
                  </h3>
                </Link>

                {/* Location + Agent */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{locStr}</span>
                  </div>
                  {property.seller_id?.name && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <Store className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">
                        {property.seller_id.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100">
                  {/* Price */}
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">
                      {property.isSold && property.soldPrice
                        ? "Sold Price"
                        : "Price"}
                    </p>
                    <p className="text-lg font-bold text-gray-800 leading-tight">
                      {formatIndianPrice(
                        property.isSold && property.soldPrice
                          ? property.soldPrice
                          : property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent || 0,
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/properties/${property.slug || property._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3.5 py-2 rounded-full transition-colors"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {!property.isSold && sellerPhone && (
                      <button
                        onClick={() => window.open(whatsappUrl, "_blank")}
                        className="flex items-center gap-1.5 text-xs font-medium bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3.5 py-2 rounded-full transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                    )}

                    {property.isSold && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3.5 py-2 rounded-full cursor-default">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesPage;
