import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/users/Users";
import AdminProperties from "./pages/properties/AdminProperties";
import AdminApprovals from "./pages/approvals/AdminApprovals";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="settings" element={<>setting</>} />
        <Route path="properties/add" element={<>types</>}/>
        {/* Settings route can be placeholder too if needed */}
      </Route>
    </Routes>
  );
};

export default AdminRoute;
