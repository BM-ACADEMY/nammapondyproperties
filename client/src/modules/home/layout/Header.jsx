import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNav } from "@/context/NavContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronDown,
  Briefcase,
  Store,
  Home,
  Phone,
  Info,
  MapPin,
  ArrowRight,
  PlusCircle,
  Star,
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

  const { businessTypes, propertyTypes } = useNav();

  const userMenuRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
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

  // Data fetching moved to NavContext

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  // --- Animation Variants ---
  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
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
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <img
                src="/Logo/logo.png"
                alt="NammaPondy Logo"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                {/* Removed Home Link */}

                {/* BUSINESS TYPES (Direct Links) */}
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
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
                    >
                      {name}
                    </Link>
                  );
                })}

                {/* PROPERTY TYPE (Buy & Rent only) */}
                {propertyTypes
                  .filter((type) => {
                    const name = typeof type === "string" ? type : type?.name;
                    return (
                      name &&
                      typeof name === "string" &&
                      ["buy", "rent"].includes(name.toLowerCase())
                    );
                  })
                  .map((type) => {
                    const name = typeof type === "string" ? type : type.name;
                    return (
                      <Link
                        key={name}
                        to={`/properties?type=${encodeURIComponent(name)}`}
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
                      >
                        {name}
                      </Link>
                    );
                  })}

                <Link
                  to="/about"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-5">
              <Link
                to="/favorites"
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    const role =
                      user?.role_id?.role_name?.toUpperCase() ||
                      user?.role?.name?.toUpperCase();
                    if (role === "ADMIN") {
                      navigate("/admin/properties/add");
                    } else if (role === "SELLER") {
                      navigate("/seller/add-property");
                    } else {
                      navigate("/add-property");
                    }
                  } else {
                    navigate("/login", { state: { from: "/add-property" } });
                  }
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-bold shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post Properties</span>
              </button>

              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={userMenuRef}
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button className="flex items-center space-x-2 focus:outline-none py-1 group">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 shadow-sm ring-2 ring-gray-100 group-hover:ring-blue-100">
                        {user?.profile_image ? (
                          <img
                            src={
                              user.profile_image.startsWith("http")
                                ? user.profile_image
                                : `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`
                            }
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 mb-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                            Signed in as
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="px-1 space-y-0.5">
                          {user?.role_id?.role_name?.toUpperCase() ===
                            "ADMIN" ||
                          user?.role?.name?.toUpperCase() === "ADMIN" ? (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                            >
                              <LayoutDashboard className="h-3.5 w-3.5 mr-2" />{" "}
                              Admin Dashboard
                            </Link>
                          ) : user?.role_id?.role_name?.toUpperCase() ===
                              "SELLER" ||
                            user?.role?.name?.toUpperCase() === "SELLER" ? (
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                            >
                              <LayoutDashboard className="h-3.5 w-3.5 mr-2" />{" "}
                              Seller Dashboard
                            </Link>
                          ) : (
                            <>
                              <Link
                                to="/user/profile"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                              >
                                <User className="h-3.5 w-3.5 mr-2" /> My Profile
                              </Link>
                              <Link
                                to="/user/reviews"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                              >
                                <Star className="h-3.5 w-3.5 mr-2" /> My Reviews
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-100 mt-1 pt-1 px-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-all"
                          >
                            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
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
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 font-medium shadow-md flex items-center transform hover:-translate-y-0.5">
                    Login{" "}
                    <ChevronDown
                      className={`ml-2 h-4 w-4 transition-transform ${isLoginMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isLoginMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden"
                      >
                        <Link
                          to="/login"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" /> Login
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center space-x-3">
              <Link to="/favorites" className="text-gray-600 p-2">
                <Heart className="h-6 w-6" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg focus:outline-none"
              >
                <Menu className="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                <img src="/Logo/logo.png" alt="Logo" className="h-12 w-auto" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {isAuthenticated ? (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-blue-100">
                        {user?.profile_image ? (
                          <img
                            src={
                              user.profile_image.startsWith("http")
                                ? user.profile_image
                                : `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`
                            }
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
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
                          className="flex justify-center py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 col-span-2"
                        >
                          Dashboard
                        </Link>
                      ) : user?.role_id?.role_name?.toUpperCase() ===
                          "SELLER" ||
                        user?.role?.name?.toUpperCase() === "SELLER" ? (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex justify-center py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 col-span-2"
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex justify-center py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/user/reviews"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex justify-center py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          >
                            Reviews
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex justify-center py-2 bg-white border border-red-100 rounded-lg text-sm text-red-500 col-span-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex justify-center px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Menu
                  </p>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (isAuthenticated) {
                        const role =
                          user?.role_id?.role_name?.toUpperCase() ||
                          user?.role?.name?.toUpperCase();
                        if (role === "ADMIN") {
                          navigate("/admin/properties/add");
                        } else if (role === "SELLER") {
                          navigate("/seller/add-property");
                        } else {
                          navigate("/add-property");
                        }
                      } else {
                        navigate("/login", {
                          state: { from: "/add-property" },
                        });
                      }
                    }}
                    className="flex items-center w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold"
                  >
                    <PlusCircle className="h-5 w-5 mr-3" /> Post Properties
                  </button>

                  {/* BUSINESS LINK DIRECT */}
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
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl"
                      >
                        <Briefcase className="h-5 w-5 mr-3" /> {name}
                      </Link>
                    );
                  })}

                  {/* BUY & RENT DIRECT */}
                  {propertyTypes
                    .filter((type) => {
                      const name = typeof type === "string" ? type : type?.name;
                      return (
                        name &&
                        typeof name === "string" &&
                        ["buy", "rent"].includes(name.toLowerCase())
                      );
                    })
                    .map((type) => {
                      const name = typeof type === "string" ? type : type.name;
                      return (
                        <Link
                          key={name}
                          to={`/properties?type=${encodeURIComponent(name)}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl"
                        >
                          <Home className="h-5 w-5 mr-3" /> {name}
                        </Link>
                      );
                    })}

                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl"
                  >
                    <Info className="h-5 w-5 mr-3" /> About Us
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl"
                  >
                    <Phone className="h-5 w-5 mr-3" /> Contact
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
