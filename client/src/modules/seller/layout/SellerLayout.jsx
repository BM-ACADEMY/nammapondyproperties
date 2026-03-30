import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, User, LogOut } from "lucide-react";
import { Layout, Button, Avatar, Dropdown, Breadcrumb, theme } from "antd";
import { useAuth } from "../../../context/AuthContext";
import SellerSidebar from "./SellerSidebar";
import { getImageUrl } from "../../../utils/imageUrl";

const { Header, Content } = Layout;

const SellerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Responsive Width Settings
  const SIDEBAR_WIDTH = 250;
  const COLLAPSED_WIDTH = 80;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setCollapsed(mobile); // Auto-collapse on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userMenuParts = [
    {
      key: "1",
      label: (
        <div className="px-1 py-1">
          <p className="font-semibold text-gray-800 m-0">
            {user?.name || "Seller User"}
          </p>
          <p className="text-xs text-gray-500 m-0">
            {user?.email || "seller@example.com"}
          </p>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "2",
      label: "My Profile",
      icon: <User size={16} />,
      onClick: () => navigate("/seller/profile"),
    },
    {
      key: "3",
      label: "Logout",
      icon: <LogOut size={16} className="text-red-500" />,
      danger: true,
      onClick: logout,
    },
  ];

  const getBreadcrumbItems = () => {
    const pathSnippets = pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
      { title: <Link to="/seller/dashboard">Home</Link> },
    ];

    pathSnippets.forEach((snippet, index) => {
      if (snippet === "seller") return;
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title =
        snippet.charAt(0).toUpperCase() + snippet.slice(1).replace(/-/g, " ");
      const isLast = index === pathSnippets.length - 1;

      breadcrumbItems.push({
        title: isLast ? (
          <span className="text-blue-600 font-medium">{title}</span>
        ) : (
          <Link to={url}>{title}</Link>
        ),
      });
    });

    return breadcrumbItems;
  };

  return (
    <Layout className="min-h-screen">
      <SellerSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />

      <Layout
        style={{
          marginLeft: isMobile
            ? 0
            : collapsed
              ? COLLAPSED_WIDTH
              : SIDEBAR_WIDTH,
          transition: "margin-left 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
            height: 64,
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-100 flex items-center justify-center"
              style={{ width: 40, height: 40 }}
            />
            <Breadcrumb
              items={getBreadcrumbItems()}
              className="hidden md:flex"
            />
          </div>

          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuParts }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 px-3 rounded-full transition-all border border-transparent hover:border-gray-100">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-bold text-gray-700">
                    {user?.name || "Seller"}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">
                    Verified Account
                  </div>
                </div>
                <Avatar
                  size="large"
                  src={getImageUrl(user?.profile_image)}
                  className="bg-linear-to-tr from-blue-600 to-indigo-600 shadow-sm"
                >
                  {!user?.profile_image &&
                    (user?.name?.charAt(0).toUpperCase() || "S")}
                </Avatar>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: isMobile ? "16px" : "24px",
            minHeight: "calc(100vh - 112px)", // Adjust for header and margin
          }}
        >
          <div
            className="seller-content-wrapper"
            style={{
              padding: isMobile ? 16 : 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "100%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SellerLayout;
