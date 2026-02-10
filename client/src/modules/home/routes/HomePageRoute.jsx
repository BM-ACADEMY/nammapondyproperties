import { Routes, Route } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import HomePage from "../pages/HomePage";
import PropertiesPage from "../pages/PropertiesPage";


const HomePageRoute = () => {
  return (
    <Routes>
      <Route path="/*" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="properties" element={<PropertiesPage />} />
      </Route>
    </Routes>
  );
}

export default HomePageRoute;
