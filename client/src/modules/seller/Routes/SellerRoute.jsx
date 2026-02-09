import { Routes, Route } from "react-router-dom";
import SellerLayout from "../layout/SellerLayout";
import Dashboard from "../pages/dashboard/Dashboard";
const SellerRoute = () => {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default SellerRoute;
