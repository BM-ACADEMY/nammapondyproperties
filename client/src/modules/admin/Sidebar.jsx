import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Drawer, Badge } from "antd";
import { useSocket } from "@/context/SocketContext";
import {
  LayoutDashboard,
  Users,
  Building,
  FileCheck,
  Settings,
  MessageSquare,
  LibraryBig,
  Megaphone,
  Briefcase,
  BarChart3,
  Image,
  Sliders
} from "lucide-react";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const socket = useSocket();
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    if (socket) {
      const handleNewRequest = (data) => {
        // Only increment if we're not already on the marketing requests page
        if (pathname !== "/admin/marketing-requests") {
          setNewLeadsCount((prev) => prev + 1);
        }
      };

      socket.on("new-marketing-request", handleNewRequest);

      return () => {
        socket.off("new-marketing-request", handleNewRequest);
      };
    }
  }, [socket, pathname]);

  // Reset count when navigating to the marketing requests page
  useEffect(() => {
    if (pathname === "/admin/marketing-requests") {
      setNewLeadsCount(0);
    }
  }, [pathname]);

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
      key: "properties-sub",
      icon: <Building size={20} />,
      label: "Properties",
      children: [
        {
          key: "/admin/properties",
          label: "Our Properties",
          onClick: () => handleMenuClick("/admin/properties"),
        },
        {
          key: "/admin/properties/add",
          label: "Add Property",
          onClick: () => handleMenuClick("/admin/properties/add"),
        },
      ],
    },
    {
      key: "seller-sub",
      icon: <Briefcase size={20} />,
      label: "Seller",
      children: [
        {
          key: "/admin/seller-listings",
          label: "Seller Listings",
          onClick: () => handleMenuClick("/admin/seller-listings"),
        },
        {
          key: "/admin/seller-requests",
          label: "Seller Requests",
          onClick: () => handleMenuClick("/admin/seller-requests"),
        },
      ],
    },
    {
      key: "analytics-sub",
      icon: <BarChart3 size={20} />,
      label: "Analytics / Manager",
      children: [
        {
          key: "/admin/view-count-manager",
          label: "View Count Manager",
          onClick: () => handleMenuClick("/admin/view-count-manager"),
        },
      ],
    },
    {
      key: "marketing-sub",
      icon: <Megaphone size={20} />,
      label: (
        <div className="flex items-center gap-2">
          <span>Marketing</span>
          {newLeadsCount > 0 && <Badge dot offset={[5, -2]} />}
        </div>
      ),
      children: [
        {
          key: "/admin/marketing-plans",
          label: "Marketing Plans",
          onClick: () => handleMenuClick("/admin/marketing-plans"),
        },
        {
          key: "/admin/marketing-requests",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Marketing Leads</span>
              {newLeadsCount > 0 && (
                <Badge count={newLeadsCount} size="small" />
              )}
            </div>
          ),
          onClick: () => handleMenuClick("/admin/marketing-requests"),
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
        {
          key: "/admin/failed-registrations",
          label: "Failed Registrations",
          onClick: () => handleMenuClick("/admin/failed-registrations"),
        },
      ],
    },
    {
      key: "/admin/enquiries",
      icon: <LibraryBig size={20} />,
      label: "Enquiry Leads",
      onClick: () => handleMenuClick("/admin/enquiries"),
    },
    {
      key: "forms-sub",
      icon: <MessageSquare size={20} />,
      label: "Forms Data",
      children: [
        {
          key: "/admin/forms/call-requests",
          label: "Call Requests",
          onClick: () => handleMenuClick("/admin/forms/call-requests"),
        },
        {
          key: "/admin/forms/contact-messages",
          label: "Contact Messages",
          onClick: () => handleMenuClick("/admin/forms/contact-messages"),
        },
      ],
    },
     {
      key: "/admin/banner-ads",
      icon: <Image size={20} />,
      label: "Banner Ads",
      onClick: () => handleMenuClick("/admin/banner-ads"),
    },
    {
      key: "property-settings-sub",
      icon: <Sliders size={20} />,
      label: "Property Settings",
      children: [
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
     {
      key: "settings-sub",
      icon: <Settings size={20} />,
      label: "Settings",
      children: [
        {
          key: "/admin/profile",
          label: "Profile",
          onClick: () => handleMenuClick("/admin/profile"),
        },
        {
          key: "/admin/testimonials",
          label: "Testimonials",
          onClick: () => handleMenuClick("/admin/testimonials"),
        },
        {
          key: "/admin/social-media",
          label: "Social Media",
          onClick: () => handleMenuClick("/admin/social-media"),
        },
      ],
    },
   
  ];

  const SidebarContent = (
    <>
      <Link
        to="/"
        onClick={() => {
          // If they navigate home, ensure it scrolls to top
          window.scrollTo({ top: 0, behavior: "smooth" });
          const mainContent = document.getElementById("main-content");
          if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <div className="flex items-center justify-center h-16 m-2 bg-white/10 rounded-lg group hover:bg-white/20 transition-all duration-300">
          {collapsed && !isMobile ? (
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
              AP
            </div>
          ) : (
            <span className="text-white text-lg font-bold tracking-wide group-hover:scale-105 transition-transform">
              ADMIN PANEL
            </span>
          )}
        </div>
      </Link>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={["properties-sub", "users-sub", "seller-sub"]} // Optional: Keep submenus open by default or manage state
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
