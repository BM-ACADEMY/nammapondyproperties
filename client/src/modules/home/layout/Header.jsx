import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Assuming hook exists, if not I will use useContext
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth ? useAuth() : {}; // Will fix if hook doesn't exist
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    // Robust role checking
    const role = (user.role?.name || user.role?.role || user.role_id?.role_name || '')?.toUpperCase();

    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'SELLER': return '/seller/dashboard';
      default: return '/user/profile';
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-blue-600">NammaPondy</span>
            <span className="text-2xl font-bold text-gray-800">Properties</span>
          </Link>

          {/* Desktop Navigation & Auth */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/properties" className="text-gray-600 hover:text-blue-600 font-medium">Properties</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                    <User className="h-6 w-6" />
                    <span className="font-medium">{user?.name || user?.user?.name}</span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible border border-gray-100">
                    <Link to={getDashboardLink()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Home</Link>
            <Link to="/properties" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Properties</Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Contact</Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block w-full text-center mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
