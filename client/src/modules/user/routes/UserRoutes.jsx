import { Routes, Route } from "react-router-dom";
import UserLayout from "../layout/UserLayout";
import Profile from "../pages/settings/Profile";
const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* user routes here */}
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
