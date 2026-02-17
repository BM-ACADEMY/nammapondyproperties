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
          label: "Our Properties",
          onClick: () => navigate("/admin/properties"), // Will need to handle mode via state or query param logic in component
        },
        {
          key: "/admin/seller-listings", // New route for Seller Listings
          label: "Seller Listings",
          onClick: () => navigate("/admin/seller-listings"),
        },
        {
          key: "/admin/seller-requests",
          label: "Seller Requests",
          onClick: () => navigate("/admin/seller-requests"),
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
          label: "User List",
          onClick: () => navigate("/admin/users"),
        },
        {
          key: "/admin/sellers",
          label: "Seller List",
          onClick: () => navigate("/admin/sellers"),
        },
      ],
    },
    // {
    //   key: "/admin/approvals",
    //   icon: <FileCheck size={20} />,
    //   label: "Approvals",
    //   onClick: () => navigate("/admin/approvals"),
    // },
    {
      key: "/admin/enquiries",
      icon: <LibraryBig size={20} />,
      label: "Enquiries Properties",
      onClick: () => navigate("/admin/enquiries"),
    },
    {
      key: "/admin/advertisements",
      icon: <Megaphone size={20} />,
      label: "Advertisements",
      onClick: () => navigate("/admin/advertisements"),
    },
    {
      key: "/admin/testimonials",
      icon: <MessageSquare size={20} />, // Reusing icon or using a new one like Star if available
      label: "Testimonials",
      onClick: () => navigate("/admin/testimonials"),
    },
    {
      key: "settings-sub",
      icon: <Settings size={20} />,
      label: "Settings",
      children: [
        {
          key: "/admin/profile",
          label: "My Profile",
          onClick: () => navigate("/admin/profile"),
        },
        {
          key: "/admin/business-types",
          label: "Business Types",
          onClick: () => navigate("/admin/business-types"),
        },
        {
          key: "/admin/property-types",
          label: "Property Types",
          onClick: () => navigate("/admin/property-types"),
        },
        {
          key: "/admin/approval-types",
          label: "Approval Types",
          onClick: () => navigate("/admin/approval-types"),
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
