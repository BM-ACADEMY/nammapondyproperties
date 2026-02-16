import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import WishlistButton from "../../../components/Common/WishlistButton";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      const token = sessionStorage.getItem("token");
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
      <div className="flex justify-center items-center h-screen">
        Loading favorites...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Log In</h2>
        <p className="text-gray-500 mb-6">
          You need to be logged in to view your favorite properties.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          My Favorites
        </h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 relative group"
              >
                <div className="relative h-48">
                  <img
                    src={
                      property.images?.[0]?.image_url
                        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${property.images[0].image_url}`
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded z-10">
                    {property.status === "available"
                      ? "FOR SALE"
                      : property.status.toUpperCase()}
                  </div>
                  <div className="absolute top-4 left-4 z-10">
                    <WishlistButton propertyId={property._id} />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <span className="text-blue-600 font-bold whitespace-nowrap">
                      ₹ {property.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <Link
                    to={`/properties/${property._id}`}
                    className="block w-full text-center bg-gray-900 text-white mt-4 py-2 rounded hover:bg-gray-800 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start exploring properties and save them here!
            </p>
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
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
