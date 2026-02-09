import { Routes, Route } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import HomePage from "../pages/HomePage";


const HomePageRoute=()=> {
  return (
    <Routes>
      <Route path="/*" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />

      </Route>
    </Routes>
  );
}

export default HomePageRoute;
