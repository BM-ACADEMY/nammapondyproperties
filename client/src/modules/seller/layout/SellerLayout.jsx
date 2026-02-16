import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Bell, Search, User, LogOut } from "lucide-react";
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Breadcrumb,
  theme,
} from "antd";
import { useAuth } from "../../../context/AuthContext";
import SellerSidebar from "./SellerSidebar";

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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
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
          <p className="font-semibold text-gray-800">
            {user?.name || "Seller User"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email || "seller@example.com"}
          </p>
        </div>
      ),
    },
    {
      type: "divider",
    },
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
      { title: <Link to="/seller/dashboard">Seller</Link> },
    ];

    pathSnippets.forEach((snippet, index) => {
      if (snippet === "seller") return;

      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title =
        snippet.charAt(0).toUpperCase() + snippet.slice(1).replace("-", " ");

      breadcrumbItems.push({
        title:
          index === pathSnippets.length - 1 ? (
            title
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
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
          transition: "all 0.2s",
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden"
              style={{
                fontSize: "16px",
                width: 40,
                height: 40,
              }}
            />
            <Breadcrumb
              items={getBreadcrumbItems()}
              className="hidden md:flex"
            />
          </div>

          <div className="flex items-center gap-6">
            <Dropdown
              menu={{ items: userMenuParts }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pl-3 rounded-full transition-colors border border-transparent hover:border-gray-100">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-semibold text-gray-700">
                    {user?.name || "Seller"}
                  </div>
                  <div className="text-xs text-gray-500">Seller Account</div>
                </div>
                <Avatar
                  size="large"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold"
                >
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </Avatar>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#f5f7fa",
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SellerLayout;
