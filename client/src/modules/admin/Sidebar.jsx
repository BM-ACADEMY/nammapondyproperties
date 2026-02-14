import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer } from "antd";
import {
  LayoutDashboard,
  Users,
  Building,
  FileCheck,
  Settings,
} from "lucide-react";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Menu items configuration
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "properties-sub", // Unique key for submenu
      icon: <Building size={20} />,
      label: "Properties",
      children: [
        {
          key: "/admin/properties",
          label: "All Properties",
          onClick: () => navigate("/admin/properties"),
        },
        {
          key: "/admin/properties/add",
          label: "Add Property",
          onClick: () => navigate("/admin/properties/add"), // Assuming this route exists or will exist
        },
      ],
    },
    {
      key: "users-sub",
      icon: <Users size={20} />,
      label: "Users",
      children: [
        {
          key: "/admin/users",
          label: "All Users",
          onClick: () => navigate("/admin/users"),
        },
        // Add more user sub-items if needed
      ],
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

  const SidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 m-2 bg-white/10 rounded-lg">
        {collapsed && !isMobile ? (
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
        defaultOpenKeys={["properties-sub", "users-sub"]} // Optional: Keep submenus open by default or manage state
        items={menuItems}
        className="px-2 border-none"
        style={{ background: "transparent" }}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        bodyStyle={{ padding: 0, background: "#001529" }}
        width={250}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      breakpoint="lg"
      collapsedWidth="80"
      onBreakpoint={(broken) => {
        if (broken) {
          setCollapsed(true);
        }
      }}
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
      {SidebarContent}
    </Sider>
  );
};

export default Sidebar;
