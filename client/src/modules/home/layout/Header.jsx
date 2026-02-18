import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  ArrowRight
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPropertiesMobileOpen, setIsPropertiesMobileOpen] = useState(false);
  const [isPropertiesDesktopOpen, setIsPropertiesDesktopOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  // --- Animation Variants ---

  // Desktop Dropdown
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

  // Off-Canvas Backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Off-Canvas Sidebar (Slide in from right)
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
      {/* Main Header with Glassmorphism */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <img
                src="/Logo/logo.png"
                alt="NammaPondy Logo"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Logo/logo.png";
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
                >
                  Home
                </Link>

                {/* ---------------------------------------------------- */}
                {/* NEW MEGA MENU DROPDOWN FOR PROPERTIES                */}
                {/* ---------------------------------------------------- */}
                <div
                  className="relative group h-20 flex items-center"
                  onMouseEnter={() => setIsPropertiesDesktopOpen(true)}
                  onMouseLeave={() => setIsPropertiesDesktopOpen(false)}
                >
                  <button className="flex items-center text-gray-600 group-hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide focus:outline-none">
                    Properties
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPropertiesDesktopOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isPropertiesDesktopOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full mt-1 left-0 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="flex p-2">
                          {/* Left Column: Navigation Links */}
                          <div className="w-5/12 py-4 pl-4 pr-2 flex flex-col justify-top space-y-1">
                            {[

                              { label: "Find Agents", to: "/properties/agent" },
                              { label: "Find Builders", to: "/properties/builders" },
                            ].map((item, index) => (
                              <Link
                                key={index}
                                to={item.to}
                                className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>

                          {/* Right Column: Promotional Card WITH IMAGE OVERLAY */}
                          <div className="w-7/12 p-2">
                            <div className="relative h-full rounded-xl overflow-hidden group cursor-pointer">

                              {/* 1. Background Image */}
                              <div className="absolute inset-0">
                                <img
                                  src="/banner.png"
                                  // ^ Replace this URL with your local image: src="/images/menu-promo.jpg"
                                  alt="Property Promo"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              </div>

                              {/* 2. Dark Overlay Gradient (Top to Bottom) */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>

                              {/* 3. Content sitting on top of the image */}
                              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                <div>
                                  {/* Icon Badge */}
                                  <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
                                    <MapPin className="h-6 w-6 text-white" />
                                  </div>

                                  <h3 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-md">
                                    Discover New Projects
                                  </h3>
                                  <p className="text-gray-200 text-xs font-medium drop-shadow-sm">
                                    New Off-Plan Projects in Pondy
                                  </p>
                                </div>

                                <div className="mt-4">
                                  <Link
                                    to="/properties"
                                    className="inline-flex items-center justify-center w-full bg-white/95 backdrop-blur-sm text-[#1e1b4b] px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-white transition-all group-hover:translate-x-1 duration-300"
                                  >
                                    All Properties <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* ---------------------------------------------------- */}

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

            {/* Desktop Actions (User/Login) */}
            <div className="hidden md:flex items-center space-x-5">
              <Link
                to="/favorites"
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Favorites"
              >
                <Heart className="h-5 w-5" />
              </Link>

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
                            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.profile_image}`}
                            alt={user.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm ${user?.profile_image ? "hidden" : "flex"
                            }`}
                        >
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    {/* <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                        Hello, {user?.name?.split(" ")[0]}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                        {user?.role?.name || "Member"}
                      </p>
                    </div> */}
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors hidden lg:block" />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 mb-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                            Signed in as
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.name || user?.user?.name || "User"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="px-1 space-y-0.5">
                          {(() => {
                            const role = (
                              user?.role?.name ||
                              user?.role?.role ||
                              user?.role_id?.role_name ||
                              ""
                            ).toUpperCase();
                            if (role === "ADMIN") {
                              return (
                                <Link
                                  to="/admin/dashboard"
                                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                                >
                                  <div className="p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded-md mr-2 transition-colors">
                                    <LayoutDashboard className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                                  </div>
                                  Dashboard
                                </Link>
                              );
                            } else if (role === "SELLER") {
                              return (
                                <Link
                                  to="/seller/dashboard"
                                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                                >
                                  <div className="p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded-md mr-2 transition-colors">
                                    <LayoutDashboard className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                                  </div>
                                  Dashboard
                                </Link>
                              );
                            } else {
                              return (
                                <>
                                  <Link
                                    to="/user/profile"
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                                  >
                                    <div className="p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded-md mr-2 transition-colors">
                                      <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                                    </div>
                                    Profile Settings
                                  </Link>
                                  <Link
                                    to="/become-seller"
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                                  >
                                    <div className="p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded-md mr-2 transition-colors">
                                      <Briefcase className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                                    </div>
                                    Become a Seller
                                  </Link>
                                </>
                              );
                            }
                          })()}
                        </div>

                        <div className="border-t border-gray-100 mt-1 pt-1 px-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-all group"
                          >
                            <div className="p-1.5 bg-red-50 group-hover:bg-red-100 rounded-md mr-2 transition-colors">
                              <LogOut className="h-3.5 w-3.5 text-red-500 group-hover:text-red-600" />
                            </div>
                            Sign Out
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
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center transform hover:-translate-y-0.5">
                    Login
                    <ChevronDown
                      className={`ml-2 h-4 w-4 transition-transform duration-200 ${isLoginMenuOpen ? "rotate-180" : ""
                        }`}
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
                          <User className="h-4 w-4 mr-3 text-gray-400" /> Login
                        </Link>
                        <Link
                          to="/seller-register"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-t border-gray-50"
                        >
                          <Store className="h-4 w-4 mr-3 text-gray-400" />{" "}
                          Become a Seller
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <Link
                to="/favorites"
                className="text-gray-600 hover:text-red-500 p-2"
              >
                <Heart className="h-6 w-6" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg focus:outline-none transition-colors"
              >
                <Menu className="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------- */}
      {/* OFF-CANVAS MOBILE MENU (New Animation)      */}
      {/* ------------------------------------------- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 1. Dark Backdrop Overlay */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />

            {/* 2. Side Sheet / Off-Canvas Menu */}
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col overflow-hidden"
            >
              {/* Header inside Menu */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                <img
                  src="/Logo/logo.png"
                  alt="Logo"
                  className="h-12 w-auto"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Auth Section (Top for ease of access) */}
                {isAuthenticated ? (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {user?.customId || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/user/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center py-2 bg-white border border-red-100 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/seller-register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200"
                    >
                      Seller
                    </Link>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Menu
                  </p>

                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Home className="h-5 w-5 mr-3 text-gray-400" /> Home
                  </Link>

                  {/* Mobile Properties Accordion */}
                  <div className="rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setIsPropertiesMobileOpen(!isPropertiesMobileOpen)
                      }
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all text-left"
                    >
                      <div className="flex items-center">
                        <Store className="h-5 w-5 mr-3 text-gray-400" />{" "}
                        Properties
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isPropertiesMobileOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isPropertiesMobileOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-gray-50"
                        >
                          <Link
                            to="/investing-insights"
                            onClick={() => setIsMenuOpen(false)}
                            className="block pl-12 pr-4 py-3 text-sm text-gray-600 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                          >
                            Investing Insights
                          </Link>
                          <Link
                            to="/investor-guide"
                            onClick={() => setIsMenuOpen(false)}
                            className="block pl-12 pr-4 py-3 text-sm text-gray-600 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                          >
                            Investor's Guide
                          </Link>
                          <Link
                            to="/properties/agent"
                            onClick={() => setIsMenuOpen(false)}
                            className="block pl-12 pr-4 py-3 text-sm text-gray-600 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                          >
                            Find Agents
                          </Link>
                          <Link
                            to="/properties/builders"
                            onClick={() => setIsMenuOpen(false)}
                            className="block pl-12 pr-4 py-3 text-sm text-gray-600 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                          >
                            Find Builders
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Info className="h-5 w-5 mr-3 text-gray-400" /> About Us
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Phone className="h-5 w-5 mr-3 text-gray-400" /> Contact
                  </Link>
                </div>
              </div>

              {/* Bottom Footer Area */}
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                {isAuthenticated && (
                  <Link
                    to={
                      user?.role?.name === "SELLER"
                        ? "/seller/dashboard"
                        : "/become-seller"
                    }
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all"
                  >
                    {user?.role?.name === "SELLER" ? (
                      <>
                        {" "}
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Seller
                        Dashboard{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <Briefcase className="h-4 w-4 mr-2" /> Become a Seller{" "}
                      </>
                    )}
                  </Link>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400">
                    © 2024 NammaPondy
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
