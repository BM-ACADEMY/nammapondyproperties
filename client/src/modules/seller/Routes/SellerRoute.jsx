import { Routes, Route } from "react-router-dom";
import SellerLayout from "../layout/SellerLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import AddProperty from "../pages/properties/AddProperty";
import MyProperties from "../pages/properties/MyProperties";
import Profile from "../pages/profile/Profile";

const SellerRoute = () => {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-properties" element={<MyProperties />} />
        <Route path="add-property" element={<AddProperty />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default SellerRoute;
