import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute";
const HomeLayout = lazy(() => import("./modules/home/layout/HomeLayout"));
import Loader from "./components/Common/Loader";

// Lazy loaded modules
const Unauthorized = lazy(() => import("./modules/common-pages/Unauthorized"));
const NotFound = lazy(() => import("./modules/common-pages/NotFound"));
const UserRoutes = lazy(() => import("./modules/user/routes/UserRoutes"));
const SellerRoute = lazy(() => import("./modules/seller/Routes/SellerRoute"));
const AdminRoute = lazy(() => import("./modules/admin/AdminRoute"));
const HomePageRoute = lazy(() => import("./modules/home/routes/HomePageRoute"));
const BecomeSeller = lazy(() => import("./modules/user/BecomeSeller"));
const About = lazy(() => import("./modules/about/About"));
const Contact = lazy(() => import("./modules/contact/Contact"));
const TermsAndConditions = lazy(() => import("./modules/home/pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./modules/home/pages/PrivacyPolicy"));
const AddProperty = lazy(() => import("./modules/seller/pages/properties/AddProperty"));
const PostRequirementPage = lazy(() => import("./modules/home/pages/PostRequirementPage"));
const FavoritesPage = lazy(() => import("./modules/home/pages/FavoritesPage"));

const PageLoader = () => <Loader />;

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        {/* Public pages accessible to everyone */}
        <Route
          path="/about"
          element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoader />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="/terms-and-condition"
          element={
            <Suspense fallback={<PageLoader />}>
              <TermsAndConditions />
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<PageLoader />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/favorites"
          element={
            <Suspense fallback={<PageLoader />}>
              <FavoritesPage />
            </Suspense>
          }
        />
        <Route
          path="/post-requirement"
          element={
            <Suspense fallback={<PageLoader />}>
              <PostRequirementPage />
            </Suspense>
          }
        />
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
      <Route
        path="/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <HomePageRoute />
          </Suspense>
        }
      />

      {/* Global Fallback for strict unmatched routes */}
      <Route
        path="*"
        element={
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
