import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronDown,
  Star,
  Briefcase,
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPropertiesMobileOpen, setIsPropertiesMobileOpen] = useState(false); // Renamed for clarity
  const [isPropertiesDesktopOpen, setIsPropertiesDesktopOpen] = useState(false); // New state for desktop hover
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false); // For Login Dropdown

  const userMenuRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleMobileProperties = () =>
    setIsPropertiesMobileOpen(!isPropertiesMobileOpen);

  // Close user menu when clicking outside
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
  };

  // --- Animation Variants ---
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.95, transformOrigin: "top" },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scaleY: 0.95,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  const mobileMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Left Side */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/Logo/logo.png"
              alt="NammaPondy Logo"
              className="h-15 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Logo/logo.png";
              }}
            />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </Link>

              {/* Properties Dropdown (Desktop) */}
              <div
                className="relative"
                onMouseEnter={() => setIsPropertiesDesktopOpen(true)}
                onMouseLeave={() => setIsPropertiesDesktopOpen(false)}
              >
                <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none">
                  Properties
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPropertiesDesktopOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isPropertiesDesktopOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-100"
                    >
                      <Link
                        to="/properties/agent"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Agent
                      </Link>
                      <Link
                        to="/properties/builders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Builders
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/testimonial"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Testimonial
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Icons & User - Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/favorites"
              className="text-gray-600 hover:text-red-500 transition-colors"
              title="Favorites"
            >
              <Heart className="h-6 w-6" />
            </Link>

            {isAuthenticated ? (
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none py-2">
                  <div className="bg-blue-100 p-2 rounded-full transition-transform hover:scale-105 active:scale-95">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-100"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.name || user?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {user?.customId || user?.user?.customId || "N/A"}
                        </p>
                      </div>

                      {/* Role-based Menu Items */}
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
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 mr-2 text-gray-500" />{" "}
                              Dashboard
                            </Link>
                          );
                        } else if (role === "SELLER") {
                          return (
                            <>
                              <Link
                                to="/user/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <User className="h-4 w-4 mr-2 text-gray-500" />{" "}
                                Profile
                              </Link>
                              <Link
                                to="/seller/dashboard"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <LayoutDashboard className="h-4 w-4 mr-2 text-gray-500" />{" "}
                                Dashboard
                              </Link>
                            </>
                          );
                        } else {
                          // Default USER
                          return (
                            <>
                              <Link
                                to="/user/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <User className="h-4 w-4 mr-2 text-gray-500" />{" "}
                                Profile
                              </Link>
                              <Link
                                to="/user/reviews"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Star className="h-4 w-4 mr-2 text-gray-500" />{" "}
                                Reviews
                              </Link>
                              <Link
                                to="/become-seller"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Briefcase className="h-4 w-4 mr-2 text-gray-500" />{" "}
                                Become a Seller
                              </Link>
                            </>
                          );
                        }
                      })()}

                      <div className="border-t border-gray-100 mt-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
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
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg flex items-center focus:outline-none">
                  <User className="h-4 w-4 mr-2" /> Login
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLoginMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isLoginMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-100"
                    >
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/seller-register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Become a Seller
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/favorites" className="text-gray-600 hover:text-red-500">
              <Heart className="h-6 w-6" />
            </Link>
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden shadow-inner"
          >
            <div className="px-4 pt-4 pb-3 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Home
              </Link>

              {/* Mobile Properties Dropdown */}
              <div>
                <button
                  onClick={toggleMobileProperties}
                  className="flex justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md focus:outline-none"
                >
                  Properties{" "}
                  <ChevronDown
                    className={`h-5 w-5 transform transition-transform duration-200 ${isPropertiesMobileOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isPropertiesMobileOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 space-y-1 bg-gray-50 rounded-md mt-1 py-1">
                        <Link
                          to="/properties/agent"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
                        >
                          Agent
                        </Link>
                        <Link
                          to="/properties/builders"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600"
                        >
                          Builders
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                About
              </Link>
              <Link
                to="/testimonial"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Testimonial
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Contact
              </Link>

              <div className="border-t border-gray-200 my-2 pt-2"></div>

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center space-x-3 mb-2">
                    <div className="bg-blue-100 p-1.5 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {user?.name || user?.user?.name}
                    </span>
                  </div>
                  {/* Role-based Mobile Menu Items */}
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
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                        </Link>
                      );
                    } else if (role === "SELLER") {
                      return (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center"
                          >
                            <User className="h-4 w-4 mr-2" /> Profile
                          </Link>
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />{" "}
                            Dashboard
                          </Link>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <Link
                            to="/user/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center"
                          >
                            <User className="h-4 w-4 mr-2" /> Profile
                          </Link>
                          <Link
                            to="/user/reviews"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center"
                          >
                            <Star className="h-4 w-4 mr-2" /> Reviews
                          </Link>
                        </>
                      );
                    }
                  })()}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
