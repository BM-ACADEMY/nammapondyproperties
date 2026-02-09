import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
const UserLayout = () => {
  return (
    <div className="admin-layout">
      <Header />
      <div className="content">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
