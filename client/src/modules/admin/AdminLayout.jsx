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
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import api from "@/services/api";

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Get theme tokens for dynamic styling
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch pending approvals count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await api.get("/properties/admin-stats");
        setPendingCount(response.data.pendingApprovals || 0);
      } catch (error) {
        console.error("Error fetching pending approvals count:", error);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    // Refresh count every minute
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true); // Default collapsed on mobile (drawer closed)
      } else {
        setCollapsed(false); // Default expanded on desktop
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ... menu parts ...

  // ... breadcrumb items ...

  // User dropdown menu & breadcrumb logic remain same, just skipping lines for brevity in instruction if possible, but replace tool needs context.
  // I will just replace the beginning of the component up to the return.

  // ... (re-implementing the function body to ensure I don't miss anything) ...

  const userMenuParts = [
    {
      key: "1",
      label: (
        <div className="px-1 py-1">
          <p className="font-semibold text-gray-800">
            {user?.name || "Admin User"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.email || "admin@example.com"}
          </p>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Profile Settings",
      icon: <User size={16} />,
      onClick: () => navigate("/admin/profile"),
    },
    {
      key: "3",
      label: "Logout",
      icon: <LogOut size={16} className="text-red-500" />,
      danger: true,
      onClick: logout,
    },
  ];

  // Generate breadcrumb items based on path
  const getBreadcrumbItems = () => {
    const pathSnippets = pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
      { title: <Link to="/admin/dashboard">Admin</Link> },
    ];

    pathSnippets.forEach((snippet, index) => {
      if (snippet === "admin") return;

      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title = snippet.charAt(0).toUpperCase() + snippet.slice(1);

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
      <Sidebar
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
              className="lg:hidden" // Hide on large screens
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
            

            <Badge count={pendingCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<Bell size={20} />}
                onClick={() => navigate("/admin/properties")}
                title="Pending approvals"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuParts }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pl-3 rounded-full transition-colors border border-transparent hover:border-gray-100">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-semibold text-gray-700">
                    {user?.name || "Admin"}
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <Avatar
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold"
                >
                  {user?.name?.charAt(0).toUpperCase() || "A"}
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

export default AdminLayout;
