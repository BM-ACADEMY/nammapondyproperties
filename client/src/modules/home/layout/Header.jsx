import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { getImageUrl } from "@/utils/imageUrl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronDown,
  Headphones,
  Star,
  PhoneCall,
} from "lucide-react";
import RequestCallBackModal from "@/components/Common/RequestCallBackModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  const { businessTypes, propertyCategories = [] } = useNav();

  const userMenuRef = useRef(null);
  const { user, logout, isAuthenticated, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // --- Animation Variants ---
  const dropdownVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      <header className="bg-[#1a1a1a] backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left Side */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center group"
              onClick={() => {
                const mainContent = document.getElementById("main-content");
                if (mainContent) {
                  mainContent.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <img
                src="/Logo/logo.png"
                alt="NammaPondy Logo"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Right Side Container (Navigation + Actions) - Visible on lg and above */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {/* Desktop Navigation */}
              <nav className="flex items-center space-x-5 xl:space-x-6">
                {propertyCategories
                  .map((category) => {
                    const name = category; // Sell, Rent
                    return (
                      <Link
                        key={name}
                        to={`/properties?category=${encodeURIComponent(name)}`}
                        className="text-gray-300 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                      >
                        For {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Link>
                    );
                  })}

                {businessTypes.map((type) => {
                  const id = type._id?.toString() || type.name;
                  const name =
                    typeof type.name === "string"
                      ? type.name
                      : type.name?.name || "Unknown";
                  return (
                    <Link
                      key={id}
                      to={`/properties?businessType=${id}`}
                      className="text-gray-300 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide capitalize"
                    >
                      {name}
                    </Link>
                  );
                })}

                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                >
                  Contact
                </Link>
              </nav>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-700 mx-2"></div>

              {/* Actions */}
              <div className="flex items-center space-x-4 lg:space-x-5">
                {/* Post Property Button */}
                <button
                  onClick={() => {
                    navigate("/post-property");
                  }}
                  className="flex items-center cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-all font-semibold shadow-sm"
                >
                  <span className="text-[14px]">Post property</span>
                  <span className="ml-2 bg-[#1aa554] text-white text-[10px] tracking-wider font-bold px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </button>

                {/* Support/Headphones Icon Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsContactMenuOpen(true)}
                  onMouseLeave={() => setIsContactMenuOpen(false)}
                >
                  <button className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors shadow-sm focus:outline-none">
                    <Headphones className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {isContactMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-6 px-6 z-50 overflow-hidden cursor-default"
                      >
                        <h3 className="text-[#003366] font-bold text-[13px] tracking-wide mb-6">
                          CONTACT US
                        </h3>

                        <div className="flex items-start mb-6">
                          <PhoneCall className="h-5 w-5 text-[#4A5568] mt-1 mr-4 shrink-0" />
                          <div>
                            <p className="text-[#A0AEC0] text-[13px] font-medium tracking-wide">
                              Toll Free | 9:30 AM to 6:30 PM
                            </p>
                            <p className="text-[#A0AEC0] text-[13px] font-medium tracking-wide">
                              (Mon-Sun)
                            </p>
                            <p className="text-[#2D3748] font-semibold text-lg mt-0.5 tracking-wide">
                              1800-41-99099
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsContactMenuOpen(false);
                            setIsCallbackModalOpen(true);
                          }}
                          className="w-full border-2 border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3] hover:text-white transition-colors duration-300 rounded-lg py-2.5 font-bold flex items-center justify-center space-x-2 text-[15px]"
                        >
                          <PhoneCall className="h-4 w-4" />
                          <span>Request a Call Back</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Favorites icon is commented out as requested */}
                {/* 
                <Link
                  to="/favorites"
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Heart className="h-5 w-5" />
                </Link> 
                */}

                {/* USER PROFILE DROPDOWN (NEW LIGHT DESIGN) */}
                {isAuthenticated ? (
                  <div
                    className="relative"
                    ref={userMenuRef}
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <button className="flex items-center space-x-1 focus:outline-none group py-1">
                      <div className="relative">
                        <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center overflow-hidden border border-transparent group-hover:border-gray-400 transition-all duration-300 text-gray-900">
                          {user?.profile_image ? (
                            <img
                              src={getImageUrl(user.profile_image)}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        {/* Red Notification Dot */}
                        <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 border-2 border-[#1a1a1a] rounded-full"></div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors ml-1" />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 overflow-hidden"
                        >
                          {/* Profile Card Header inside Dropdown */}
                          <div className="px-5 py-4 border-b border-gray-100 mb-2 flex items-center space-x-3 bg-slate-50">
                            <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-blue-100 flex items-center justify-center text-blue-600">
                              {user?.profile_image ? (
                                <img
                                  src={
                                    user.profile_image.startsWith("http") ||
                                      user.profile_image.startsWith("//")
                                      ? user.profile_image
                                      : `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`
                                  }
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-gray-900 truncate tracking-wide">
                                {user?.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {user?.email}
                              </p>
                            </div>
                          </div>

                          {/* Navigation Links */}
                          <div className="px-2 space-y-1">
                            {user?.role_id?.role_name?.toUpperCase() ===
                              "ADMIN" ||
                              user?.role?.name?.toUpperCase() === "ADMIN" ? (
                              <Link
                                to="/admin/dashboard"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition-all group"
                              >
                                <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="group-hover:translate-x-1 transition-transform">
                                  Admin Dashboard
                                </span>
                              </Link>
                            ) : user?.role_id?.role_name?.toUpperCase() ===
                              "SELLER" ||
                              user?.role?.name?.toUpperCase() === "SELLER" ? (
                              <Link
                                to="/seller/dashboard"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition-all group"
                              >
                                <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="group-hover:translate-x-1 transition-transform">
                                  Seller Dashboard
                                </span>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to="/user/profile"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition-all group"
                                >
                                  <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                  <span className="group-hover:translate-x-1 transition-transform">
                                    My Profile
                                  </span>
                                </Link>
                                <Link
                                  to="/user/reviews"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition-all group"
                                >
                                  <Star className="h-4 w-4 mr-3 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                                  <span className="group-hover:translate-x-1 transition-transform">
                                    My Reviews
                                  </span>
                                </Link>
                                {/* <Link
                                  to="/favorites"
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl transition-all group"
                                >
                                  <Heart className="h-4 w-4 mr-3 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                  <span className="group-hover:translate-x-1 transition-transform">
                                    Favorites
                                  </span>
                                </Link> */}
                              </>
                            )}
                          </div>

                          {/* Action - Sign out */}
                          <div className="border-t border-gray-100 mt-2 pt-2 px-2 pb-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center px-4 py-2.5 mx-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                            >
                              <LogOut className="h-4 w-4 mr-3 text-red-500 transition-transform group-hover:scale-110" />
                              <span className="group-hover:translate-x-1 transition-transform">
                                Sign Out
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsLoginMenuOpen(true)}
                    onMouseLeave={() => setIsLoginMenuOpen(false)}
                  >
                    <button className="flex items-center space-x-1 focus:outline-none group py-1">
                      <div className="relative">
                        <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-gray-900 border border-transparent group-hover:border-gray-400 transition-all">
                          <User className="h-5 w-5" />
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 group-hover:text-white transition-all ml-1 ${isLoginMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isLoginMenuOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-2 z-50 border border-gray-100 overflow-hidden"
                        >
                          <div className="px-2">
                            <button
                              onClick={() => {
                                setIsLoginMenuOpen(false);
                                navigate("/login");
                              }}
                              className="w-full flex items-center px-4 py-3 mx-1 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                            >
                              <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="group-hover:translate-x-1 transition-transform">
                                Login
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle - Visible below lg */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Contact Button */}
              <button
                onClick={() => setIsCallbackModalOpen(true)}
                className="text-gray-300 p-2 hover:text-white transition-colors focus:outline-none"
              >
                <Headphones className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg focus:outline-none transition-colors"
              >
                <Menu className="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU (Off-canvas sidebar matching dark theme) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#1a1a1a] border-l border-gray-800 shadow-2xl z-50 lg:hidden flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#1a1a1a]">
                <Link
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    const mainContent = document.getElementById("main-content");
                    if (mainContent) {
                      mainContent.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <img src="/Logo/logo.png" alt="Logo" className="h-12 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-[#333333] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {isAuthenticated ? (
                  <div className="bg-[#242424] rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#1a1a1a] shadow-sm ring-2 ring-gray-700">
                        {user?.profile_image ? (
                          <img
                            src={getImageUrl(user.profile_image)}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-700 text-white font-bold text-lg">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-white truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {user?.role_id?.role_name?.toUpperCase() === "ADMIN" ||
                        user?.role?.name?.toUpperCase() === "ADMIN" ? (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex justify-center py-2 bg-[#333333] rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-[#404040] transition-colors col-span-2 shadow-sm"
                        >
                          Dashboard
                        </Link>
                      ) : user?.role_id?.role_name?.toUpperCase() ===
                        "SELLER" ||
                        user?.role?.name?.toUpperCase() === "SELLER" ? (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex justify-center py-2 bg-[#333333] rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-[#404040] transition-colors col-span-2 shadow-sm"
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex justify-center py-2 bg-[#333333] rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-[#404040] transition-colors shadow-sm"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/user/reviews"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex justify-center py-2 bg-[#333333] rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-[#404040] transition-colors shadow-sm"
                          >
                            Reviews
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex justify-center py-2 bg-[#333333] rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors col-span-2 shadow-sm mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                      className="flex justify-center px-4 py-3 bg-white text-gray-900 hover:bg-gray-200 transition-colors rounded-xl text-sm font-semibold shadow-md"
                    >
                      Login / Register
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3 ml-1">
                    Menu
                  </p>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/post-property");
                    }}
                    className="flex items-center w-full px-4 py-3 bg-white text-[#003366] hover:bg-gray-100 transition-colors rounded-xl font-bold mb-2 shadow-sm"
                  >
                    <span className="flex-1 text-left text-[14px]">
                      Post Properties
                    </span>
                    <span className="bg-[#1aa554] text-white text-[10px] tracking-wider font-bold px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  </button>

                  {propertyCategories
                    .map((category) => {
                      const name = category;
                      return (
                        <Link
                          key={name}
                          to={`/properties?category=${encodeURIComponent(name)}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#242424] hover:text-white transition-colors rounded-xl font-medium"
                        >
                          For {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Link>
                      );
                    })}

                  {businessTypes.map((type) => {
                    const id = type._id?.toString() || type.name;
                    const name =
                      typeof type.name === "string"
                        ? type.name
                        : type.name?.name || "Unknown";
                    return (
                      <Link
                        key={id}
                        to={`/properties?businessType=${id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#242424] hover:text-white transition-colors rounded-xl font-medium capitalize"
                      >
                        {name}
                      </Link>
                    );
                  })}

                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#242424] hover:text-white transition-colors rounded-xl font-medium"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RequestCallBackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
      />
    </>
  );
};

export default Header;
