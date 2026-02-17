
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    // Redirect based on role
    const role = user.role?.name?.toUpperCase() || user.user?.role?.role_name?.toUpperCase();
    // Need to be careful with user structure. 
    // In AuthContext, user might be the full object.
    // Let's assume user.role.name or user.role_id.role_name.
    // Based on userController, populate('role_id').
    // So user.role_id.role_name should be correct if populated.
    // Note: userController returns user object directly.
    // Verify AuthContext user structure again.

    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'SELLER') return <Navigate to="/seller/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
