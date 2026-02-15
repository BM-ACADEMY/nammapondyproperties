import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/users/Users";
import AdminProperties from "./pages/properties/AdminProperties";
import AdminApprovals from "./pages/approvals/AdminApprovals";
import UserList from "./pages/UserList";
import SellerList from "./pages/SellerList";
import AdminProfile from "./pages/AdminProfile";
import AddProperty from "./pages/AddProperty";
import AdminEnquiries from "./pages/enquiries/AdminEnquiries";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} /> {/* Changed to UserList */}
        <Route path="sellers" element={<SellerList />} /> {/* Added sellers route */}
        <Route path="profile" element={<AdminProfile />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="settings" element={<>setting</>} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        {/* Settings route can be placeholder too if needed */}
      </Route>
    </Routes>
  );
};

export default AdminRoute;
