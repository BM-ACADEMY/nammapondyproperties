import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import LoginModal from "@/components/Auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
const HomeLayout = () => {
  const { isLoginModalOpen, setLoginModalOpen } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <LoginModal
        open={isLoginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
      />
      <main id="main-content" className="flex-grow">
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
