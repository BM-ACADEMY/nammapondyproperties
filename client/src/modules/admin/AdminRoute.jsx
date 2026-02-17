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
import BusinessTypeManager from "./pages/BusinessTypeManager";
import PropertyTypeManager from "./pages/PropertyTypeManager";
import ApprovalTypeManager from "./pages/ApprovalTypeManager";
import TestimonialManager from "./pages/TestimonialManager";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SellerRequests from "./pages/SellerRequests";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />{" "}
        {/* Changed to UserList */}
        <Route path="sellers" element={<SellerList />} />{" "}
        {/* Added sellers route */}
        <Route path="profile" element={<AdminProfile />} />
        <Route path="properties" element={<AdminProperties mode="admin" />} />
        <Route
          path="seller-listings"
          element={<AdminProperties mode="seller" />}
        />
        <Route path="seller-requests" element={<SellerRequests />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="business-types" element={<BusinessTypeManager />} />
        <Route path="property-types" element={<PropertyTypeManager />} />
        <Route path="approval-types" element={<ApprovalTypeManager />} />
        <Route path="testimonials" element={<TestimonialManager />} />
        {/* Settings route can be placeholder too if needed */}
      </Route>
    </Routes>
  );
};

export default AdminRoute;
