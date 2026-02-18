import { Routes, Route } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import HomePage from "../pages/HomePage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertyDetails from "../pages/PropertyDetails";
import NotFound from "../../common-pages/NotFound";


const HomePageRoute = () => {
  return (
    <Routes>
      <Route path="/*" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        {/* Catch-all for invalid paths within Home Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default HomePageRoute;
