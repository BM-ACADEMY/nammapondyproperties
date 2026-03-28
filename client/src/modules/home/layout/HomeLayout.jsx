import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import LoginModal from "@/components/Auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const HomeLayout = () => {
  const { isLoginModalOpen, setLoginModalOpen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openLogin) {
      setLoginModalOpen(true);
      // Clean up state immediately
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, setLoginModalOpen, navigate]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header />
      <LoginModal
        open={isLoginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
      />
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
