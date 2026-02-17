import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoginModal from "../Auth/LoginModal";

const WishlistButton = ({ propertyId, className = "" }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isWishlisted = user?.wishlist?.some(
    (item) => (typeof item === "string" ? item : item._id) === propertyId,
  );

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Optimistic Update
    const previousWishlist = user.wishlist || [];
    const isCurrentlyWishlisted = previousWishlist.some(
      (item) => (typeof item === "string" ? item : item._id) === propertyId,
    );

    let newWishlist;
    if (isCurrentlyWishlisted) {
      newWishlist = previousWishlist.filter(
        (item) => (typeof item === "string" ? item : item._id) !== propertyId,
      );
    } else {
      newWishlist = [...previousWishlist, propertyId];
    }

    const optimisticUser = { ...user, wishlist: newWishlist };
    refreshUser(optimisticUser);

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const endpoint = isCurrentlyWishlisted
        ? `${import.meta.env.VITE_API_URL}/users/remove-from-wishlist`
        : `${import.meta.env.VITE_API_URL}/users/add-to-wishlist`;

      const res = await axios.post(
        endpoint,
        { propertyId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedWishlist = res.data.wishlist;
      refreshUser({ ...user, wishlist: updatedWishlist });

      toast.success(res.data.message);
    } catch (error) {
      console.error("Wishlist error:", error);
      refreshUser({ ...user, wishlist: previousWishlist });
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleWishlist}
        disabled={loading}
        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
          isWishlisted
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-black/20 text-white hover:bg-black/40 hover:scale-110"
        } ${className}`}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isWishlisted ? "fill-current" : ""
          }`}
        />
      </button>

      <LoginModal
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default WishlistButton;
