import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer } from "antd";
import {
  LayoutDashboard,
  Users,
  Building,
  FileCheck,
  Settings,
  MessageSquare,
  LibraryBig,
  Megaphone,
} from "lucide-react";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Handle menu click for mobile responsive closing
  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // Menu items configuration
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => handleMenuClick("/admin/dashboard"),
    },
    {
      key: "properties-sub", // Unique key for submenu
      icon: <Building size={20} />,
      label: "Properties",
      children: [
        {
          key: "/admin/properties",
          label: "Our Properties",
          onClick: () => handleMenuClick("/admin/properties"),
        },
        {
          key: "/admin/seller-listings", // New route for Seller Listings
          label: "Seller Listings",
          onClick: () => handleMenuClick("/admin/seller-listings"),
        },
        {
          key: "/admin/seller-requests",
          label: "Seller Requests",
          onClick: () => handleMenuClick("/admin/seller-requests"),
        },
        {
          key: "/admin/properties/add",
          label: "Add Property",
          onClick: () => handleMenuClick("/admin/properties/add"),
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
          label: "User List",
          onClick: () => handleMenuClick("/admin/users"),
        },
        {
          key: "/admin/sellers",
          label: "Seller List",
          onClick: () => handleMenuClick("/admin/sellers"),
        },
      ],
    },
    {
      key: "/admin/enquiries",
      icon: <LibraryBig size={20} />,
      label: "Enquiries Properties",
      onClick: () => handleMenuClick("/admin/enquiries"),
    },
    {
      key: "/admin/advertisements",
      icon: <Megaphone size={20} />,
      label: "Advertisements",
      onClick: () => handleMenuClick("/admin/advertisements"),
    },
    {
      key: "/admin/testimonials",
      icon: <MessageSquare size={20} />,
      label: "Testimonials",
      onClick: () => handleMenuClick("/admin/testimonials"),
    },
    {
      key: "settings-sub",
      icon: <Settings size={20} />,
      label: "Settings",
      children: [
        {
          key: "/admin/profile",
          label: "My Profile",
          onClick: () => handleMenuClick("/admin/profile"),
        },
        {
          key: "/admin/social-media",
          label: "Social Media",
          onClick: () => handleMenuClick("/admin/social-media"),
        },
        {
          key: "/admin/business-types",
          label: "Business Types",
          onClick: () => handleMenuClick("/admin/business-types"),
        },
        {
          key: "/admin/property-types",
          label: "Property Types",
          onClick: () => handleMenuClick("/admin/property-types"),
        },
        {
          key: "/admin/approval-types",
          label: "Approval Types",
          onClick: () => handleMenuClick("/admin/approval-types"),
        },
      ],
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
        styles={{ body: { padding: 0, background: "#001529" } }}
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
