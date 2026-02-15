
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building, PlusCircle, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SellerLayout = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => pathname.includes(path) ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-blue-800">
          <span className="text-xl font-bold">Seller Panel</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/seller/dashboard" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/seller/dashboard')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/seller/my-properties" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/seller/my-properties')}`}>
            <Building className="w-5 h-5 mr-3" />
            My Properties
          </Link>
          <Link to="/seller/add-property" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/seller/add-property')}`}>
            <PlusCircle className="w-5 h-5 mr-3" />
            Add Property
          </Link>
          <Link to="/seller/profile" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/seller/profile')}`}>
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-blue-100 hover:text-white hover:bg-red-600 rounded-md transition">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 bg-white shadow-sm px-6">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Welcome, Seller</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
