import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
const HomeLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header />
      <main
        id="main-content"
        className="flex-grow overflow-y-auto scroll-smooth"
      >
        <div className="min-h-full flex flex-col">
          <div className="flex-grow">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default HomeLayout;
