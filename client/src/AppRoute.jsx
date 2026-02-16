import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute"; // Import PublicRoute
import Unauthorized from "./modules/common-pages/Unauthorized";
import UserRoutes from "./modules/user/routes/UserRoutes";
import SellerRoute from "./modules/seller/Routes/SellerRoute";
import AdminRoute from "./modules/admin/AdminRoute";
import HomePageRoute from "./modules/home/routes/HomePageRoute";
import HomeLayout from "./modules/home/layout/HomeLayout";
import Login from "./components/Auth/Login"; // Import Login
import Signup from "./components/Auth/Signup";
import OtpVerify from "./components/Auth/OtpVerify";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import SellerRegister from "./modules/auth/SellerRegister";
import BecomeSeller from "./modules/user/BecomeSeller";

const FavoritesPage = lazy(() => import("./modules/home/pages/FavoritesPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-sm text-gray-500">
    Loading...
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        {/* Public Routes (Accessible only if NOT logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/seller-register" element={<SellerRegister />} />
        </Route>
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={<PrivateRoute allowedRoles={["ADMIN", "SELLER", "USER"]} />}
      >
        <Route
          path="/user/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserRoutes />
            </Suspense>
          }
        />
        <Route
          path="/seller/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <SellerRoute />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminRoute />
            </Suspense>
          }
        />
        <Route
          path="/become-seller"
          element={
            <Suspense fallback={<PageLoader />}>
              <BecomeSeller />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/unauthorized"
        element={
          <Suspense fallback={<PageLoader />}>
            <Unauthorized />
          </Suspense>
        }
      />

      {/* Home Page Route (Catch-all for public/home) */}
      <Route path="/*" element={<HomePageRoute />} />
    </Routes>
  );
};

export default AppRoutes;
