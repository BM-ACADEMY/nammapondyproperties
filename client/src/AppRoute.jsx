import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute";
import Unauthorized from "./modules/common-pages/Unauthorized";
import NotFound from "./modules/common-pages/NotFound";
import UserRoutes from "./modules/user/routes/UserRoutes";
import SellerRoute from "./modules/seller/Routes/SellerRoute";
import AdminRoute from "./modules/admin/AdminRoute";
import HomePageRoute from "./modules/home/routes/HomePageRoute";
import HomeLayout from "./modules/home/layout/HomeLayout";
import BecomeSeller from "./modules/user/BecomeSeller";
import About from "./modules/about/About";
import Contact from "./modules/contact/Contact";
import TermsAndConditions from "./modules/home/pages/TermsAndConditions";
import PrivacyPolicy from "./modules/home/pages/PrivacyPolicy";
import Loader from "./components/Common/Loader";
import AddProperty from "./modules/seller/pages/properties/AddProperty";
import PostRequirementPage from "./modules/home/pages/PostRequirementPage";

const FavoritesPage = lazy(() => import("./modules/home/pages/FavoritesPage"));
const PageLoader = () => <Loader />;

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        {/* Public pages accessible to everyone */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms-and-condition" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/post-requirement" element={<PostRequirementPage />} />
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

      <Route element={<PrivateRoute allowedRoles={["USER", "SELLER"]} />}>
        <Route element={<HomeLayout />}>
          <Route
            path="/add-property"
            element={
              <Suspense fallback={<PageLoader />}>
                <AddProperty />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Seller Routes - Strictly for Sellers and Admins */}
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
