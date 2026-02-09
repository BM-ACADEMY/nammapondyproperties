import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./guard/PrivateRoute";
import Unauthorized from "./modules/common-pages/Unauthorized";
import UserRoutes from "./modules/user/routes/UserRoutes";
import SellerRoute from "./modules/seller/Routes/SellerRoute";
import AdminRoute from "./modules/admin/AdminRoute";
import HomePageRoute from "./modules/home/routes/HomePageRoute";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-sm text-gray-500">
    Loading...
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <PrivateRoute
            allowedRoles={[
              "ADMIN",
              "SELLER",
              "USER",
            ]}
          />
        }
      >
        <Route
          path="/user/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserRoutes/>
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
      </Route>
      <Route
        path="/unauthorized"
        element={
          <Suspense fallback={<PageLoader />}>
            <Unauthorized />
          </Suspense>
        }
      />
      <Route path="/*" element={<UserRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
