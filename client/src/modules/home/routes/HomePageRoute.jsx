import { Routes, Route } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import HomePage from "../pages/HomePage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertyDetails from "../pages/PropertyDetails";
import NotFound from "../../common-pages/NotFound";
import UserPropertiesPage from "../pages/UserPropertiesPage";
import PostPropertyLanding from "../pages/PostPropertyLanding";

const HomePageRoute = () => {
  return (
    <Routes>
      <Route path="/*" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:slug" element={<PropertyDetails />} />
        <Route path="post-property" element={<PostPropertyLanding />} />

        {/* Dynamic Routes for User Properties */}
        <Route
          path="properties/user/:userId"
          element={<UserPropertiesPage />}
        />

        {/* Catch-all for invalid paths within Home Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default HomePageRoute;
