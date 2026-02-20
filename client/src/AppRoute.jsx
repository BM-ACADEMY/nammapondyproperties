import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute"; // Import PublicRoute
import Unauthorized from "./modules/common-pages/Unauthorized";
import NotFound from "./modules/common-pages/NotFound";
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
import About from "./modules/about/About";
import Contact from "./modules/contact/Contact";

const FavoritesPage = lazy(() => import("./modules/home/pages/FavoritesPage"));

import Loader from "./components/Common/Loader";

const PageLoader = () => <Loader />;

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
        {/* Public pages accessible to everyone */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>

      {/* User Routes */}
      <Route element={<PrivateRoute allowedRoles={["USER"]} />}>
        <Route
          path="/user/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserRoutes />
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

      {/* Seller Routes */}
      <Route element={<PrivateRoute allowedRoles={["SELLER"]} />}>
        <Route
          path="/seller/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <SellerRoute />
            </Suspense>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminRoute />
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

      {/* Global Fallback for strict unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
