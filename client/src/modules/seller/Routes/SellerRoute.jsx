import { Routes, Route } from "react-router-dom";
import SellerLayout from "../layout/SellerLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import AddProperty from "../pages/properties/AddProperty";
import MyProperties from "../pages/properties/MyProperties";
import Profile from "../pages/profile/Profile";
import SellerEnquiries from "../pages/enquiries/SellerEnquiries";
import RequestLimit from "../pages/properties/RequestLimit";
import AddAttributes from "../pages/properties/AddAttributes";
import UpgradePlan from "../pages/UpgradePlan";
import SellerPaymentHistory from "../pages/payments/SellerPaymentHistory";
import LeadsOverview from "../pages/enquiries/LeadsOverview";

const SellerRoute = () => {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-properties" element={<MyProperties />} />
        <Route path="add-property" element={<AddProperty />} />
        <Route path="add-attributes" element={<AddAttributes />} />
        <Route path="request-limit" element={<RequestLimit />} />
        <Route path="profile" element={<Profile />} />
        <Route path="enquiries" element={<SellerEnquiries />} />
        <Route path="upgrade-plan" element={<UpgradePlan />} />
        <Route path="payment-history" element={<SellerPaymentHistory />} />
        <Route path="leads-overview" element={<LeadsOverview />} />
      </Route>
    </Routes>
  );
};

export default SellerRoute;
