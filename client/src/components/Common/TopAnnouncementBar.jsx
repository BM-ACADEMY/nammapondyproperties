import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "@/context/AuthContext";

const TopAnnouncementBar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePostProperty = (e) => {
    e.preventDefault();
    if (isAuthenticated && user) {
      const role =
        user?.role_id?.role_name?.toUpperCase() ||
        user?.role?.name?.toUpperCase();

      // 🛡️ Restriction: Unverified profiles can only list ONE property
      if (role !== "ADMIN" && (user.propertyCount >= 1) && !user.badgeVerified) {
        message.warning({
          content: "First complete your profile, once verified your profile then only you listing other properties",
          key: "verification-restricted"
        });
        if (role === "SELLER") {
          navigate("/seller/profile");
        } else {
          navigate("/user/profile");
        }
        return;
      }

      if (role === "ADMIN") {
        navigate("/admin/properties/add");
      } else if (role === "SELLER") {
        navigate("/seller/add-property");
      } else {
        navigate("/add-property");
      }
    } else {
      navigate("/post-property");
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#166aa8] text-white py-1.5 px-4 text-center text-[10px] sm:text-xs font-medium relative z-[2000] border-b border-white/10"
    >
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 animate-pulse hidden sm:block" />
        <p className="tracking-wide whitespace-nowrap">
          Sell your property faster!{" "}
          <span className="text-yellow-400 font-bold uppercase tracking-wider ml-1">
            Get Buyers in 7 Days
          </span>
        </p>
        <Link
          to="/add-property"
        <button
          onClick={handlePostProperty}
          className="hidden sm:flex items-center space-x-1 group hover:text-yellow-300 transition-colors ml-2 border-l border-white/20 pl-3 cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] font-bold">Post Now</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default TopAnnouncementBar;

