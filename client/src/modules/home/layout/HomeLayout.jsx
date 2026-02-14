import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";


const HomeLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainElement = document.getElementById("main-content");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

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
