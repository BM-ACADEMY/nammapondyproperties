import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import UsersList from "./pages/users/UsersList";
import AdminProperties from "./pages/properties/AdminProperties";
import AdminApprovals from "./pages/approvals/AdminApprovals";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="approvals" element={<AdminApprovals />} />
        {/* Settings route can be placeholder too if needed */}
      </Route>
    </Routes>
  );
};

export default AdminRoute;
