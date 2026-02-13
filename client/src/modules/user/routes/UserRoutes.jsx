import { Routes, Route } from "react-router-dom";
import UserLayout from "../layout/UserLayout";
import Profile from "../pages/settings/Profile";
import Reviews from "../pages/reviews/Reviews";
import Dashboard from "../pages/dashboard/Dashboard";
const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* user routes here */}
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
