import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  FileCheck,
  Settings,
  LogOut,
  Menu as MenuIcon,
  Bell,
  Search,
  User,
  ChevronDown,
} from "lucide-react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Breadcrumb,
  theme,
} from "antd";
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Get theme tokens for dynamic styling
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu items configuration
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "/admin/users",
      icon: <Users size={20} />,
      label: "Users",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "/admin/properties",
      icon: <Building size={20} />,
      label: "Properties",
      onClick: () => navigate("/admin/properties"),
    },
    {
      key: "/admin/approvals",
      icon: <FileCheck size={20} />,
      label: "Approvals",
      onClick: () => navigate("/admin/approvals"),
    },
    {
      key: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Settings",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  // User dropdown menu
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
      onClick: () => navigate("/admin/settings"),
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
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        breakpoint="lg"
        collapsedWidth="80"
        className="shadow-xl z-20"
        style={{
          background: "#001529",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center justify-center h-16 m-2 bg-white/10 rounded-lg">
          {collapsed ? (
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              NP
            </div>
          ) : (
            <span className="text-white text-lg font-bold tracking-wide">
              ADMIN PANEL
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="px-2 border-none"
          style={{ background: "transparent" }}
        />
      </Sider>

      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
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
              icon={collapsed ? <MenuIcon size={20} /> : <MenuIcon size={20} />}
              onClick={() => setCollapsed(!collapsed)}
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
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all"
              />
            </div>

            <Badge count={5} size="small" offset={[-2, 2]}>
              <Button type="text" shape="circle" icon={<Bell size={20} />} />
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
