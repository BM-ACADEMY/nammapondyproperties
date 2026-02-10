
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building, FileCheck, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => pathname.includes(path) ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/admin/dashboard')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/admin/users" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/admin/users')}`}>
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>
          <Link to="/admin/properties" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/admin/properties')}`}>
            <Building className="w-5 h-5 mr-3" />
            Properties
          </Link>
          <Link to="/admin/approvals" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/admin/approvals')}`}>
            <FileCheck className="w-5 h-5 mr-3" />
            Approvals
          </Link>
          <Link to="/admin/settings" className={`flex items-center px-4 py-3 rounded-md transition ${isActive('/admin/settings')}`}>
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600 rounded-md transition">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 bg-white shadow-sm px-6">
          <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Welcome, Admin</span>
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

export default AdminLayout;
