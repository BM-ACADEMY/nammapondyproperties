import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Drawer, Badge } from "antd";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
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
  Sliders,
  ClipboardList,
  CreditCard,
  Layers,
  Headphones,
} from "lucide-react";

import api from "@/services/api";

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const socket = useSocket();
  const { user } = useAuth();
  
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [pendingBadgeCount, setPendingBadgeCount] = useState(0);
  const [newPropertyCount, setNewPropertyCount] = useState(0);
  const [newSellerPropertyCount, setNewSellerPropertyCount] = useState(0);
  const [newEnquiryCount, setNewEnquiryCount] = useState(0);
  const [newRequirementCount, setNewRequirementCount] = useState(0);
  const [newCallRequestCount, setNewCallRequestCount] = useState(0);
  const [newContactCount, setNewContactCount] = useState(0);
  const [newExpiringPlansCount, setNewExpiringPlansCount] = useState(0);
  const [newSupportTicketCount, setNewSupportTicketCount] = useState(0);
  const [businessTypes, setBusinessTypes] = useState([]);



  // Fetch initial pending counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await api.get("/users/fetch-notification-counts");
        if (response.data.success) {
          const { counts } = response.data;
          setPendingBadgeCount(counts.badgeRequests || 0);
          setNewSellerPropertyCount(counts.sellerProperties || 0);
          setNewEnquiryCount(counts.enquiries || 0);
          setNewRequirementCount(counts.requirements || 0);
          setNewCallRequestCount(counts.callRequests || 0);
          setNewContactCount(counts.contactMessages || 0);
        }
      } catch (error) {
        console.error("Error fetching notification counts:", error);
      }
    };

    const fetchExpiringSoon = async () => {
      try {
        const response = await api.get("/subscriptions/admin/expiring-soon");
        setNewExpiringPlansCount(response.data.length || 0);
      } catch (error) {
        console.error("Error fetching expiring plans count:", error);
      }
    };

    const fetchBusinessTypes = async () => {
      try {
        const response = await api.get("/business-types");
        setBusinessTypes(response.data.filter((t) => t.status === "active"));
      } catch (error) {
        console.error("Error fetching business types:", error);
      }
    };

    fetchCounts();
    fetchExpiringSoon();
    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewBadgeRequest = (data) => {
        if (pathname !== "/admin/sellers") {
          setPendingBadgeCount((prev) => prev + 1);
        }
      };

      const handleNewProperty = (data) => {
        if (data.isSellerProperty) {
          if (pathname !== "/admin/seller-listings") {
            setNewSellerPropertyCount((prev) => prev + 1);
          }
        } else {
          if (!pathname.startsWith("/admin/properties")) {
            setNewPropertyCount((prev) => prev + 1);
          }
        }
      };

      const handleNewEnquiry = (data) => {
        if (pathname !== "/admin/enquiries") {
          setNewEnquiryCount((prev) => prev + 1);
        }
      };

      const handleNewRequirement = (data) => {
        if (pathname !== "/admin/requirements") {
          setNewRequirementCount((prev) => prev + 1);
        }
      };

      const handleNewCallRequest = (data) => {
        if (pathname !== "/admin/forms/call-requests") {
          setNewCallRequestCount((prev) => prev + 1);
        }
      };

      const handleNewContactMessage = (data) => {
        if (pathname !== "/admin/forms/contact-messages") {
          setNewContactCount((prev) => prev + 1);
        }
      };

      socket.on("badge-verification-requested", handleNewBadgeRequest);
      socket.on("new-property-listed", handleNewProperty);
      socket.on("new-enquiry", handleNewEnquiry);
      socket.on("new-requirement", handleNewRequirement);
      socket.on("new-call-request", handleNewCallRequest);
      socket.on("new-contact-message", handleNewContactMessage);

      return () => {
        socket.off("badge-verification-requested", handleNewBadgeRequest);
        socket.off("new-property-listed", handleNewProperty);
        socket.off("new-enquiry", handleNewEnquiry);
        socket.off("new-requirement", handleNewRequirement);
        socket.off("new-call-request", handleNewCallRequest);
        socket.off("new-contact-message", handleNewContactMessage);
      };
    }
  }, [socket, pathname]);

  useEffect(() => {
    if (socket) {
      const handleNewSupportMessage = (data) => {
        if (pathname !== "/admin/support") {
          setNewSupportTicketCount((prev) => prev + 1);
        }
      };
      
      socket.on("new-support-message", handleNewSupportMessage);
      socket.on("new-support-ticket", handleNewSupportMessage);

      return () => {
        socket.off("new-support-message", handleNewSupportMessage);
        socket.off("new-support-ticket", handleNewSupportMessage);
      };
    }
  }, [socket, pathname]);


  // Reset count when navigating to the marketing requests page
  useEffect(() => {
    if (pathname === "/admin/marketing-requests") {
      setNewLeadsCount(0);
    }
    if (pathname === "/admin/sellers") {
      setPendingBadgeCount(0);
    }
    if (pathname.startsWith("/admin/properties")) {
      setNewPropertyCount(0);
    }
    if (pathname === "/admin/seller-listings") {
      setNewSellerPropertyCount(0);
    }
    if (pathname === "/admin/enquiries") {
      setNewEnquiryCount(0);
    }
    if (pathname === "/admin/requirements") {
      setNewRequirementCount(0);
    }
    if (pathname === "/admin/forms/call-requests") {
      setNewCallRequestCount(0);
    }
    if (pathname === "/admin/forms/contact-messages") {
      setNewContactCount(0);
    }
    if (pathname === "/admin/support") {
      setNewSupportTicketCount(0);
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
  const allMenuItems = [
    {
      key: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => handleMenuClick("/admin/dashboard"),
    },
    {
      key: "properties-sub",
      icon: <Building size={20} />,
      label: (
        <div className="flex items-center gap-2">
          <span>Properties</span>
          {newPropertyCount > 0 && <Badge dot offset={[5, -2]} />}
        </div>
      ),
      children: [
        {
          key: "/admin/properties",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Our Properties</span>
              {newPropertyCount > 0 && (
                <Badge count={newPropertyCount} size="small" />
              )}
            </div>
          ),
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
      label: (
        <div className="flex items-center gap-2">
          <span>Seller</span>
          {(pendingBadgeCount > 0 || newSellerPropertyCount > 0) && (
            <Badge dot offset={[5, -2]} />
          )}
        </div>
      ),
      children: [
        {
          key: "/admin/seller-listings",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Seller Listings</span>
              {newSellerPropertyCount > 0 && (
                <Badge count={newSellerPropertyCount} size="small" />
              )}
            </div>
          ),
          onClick: () => handleMenuClick("/admin/seller-listings"),
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
          key: "/admin/admins",
          label: "Admin List",
          onClick: () => handleMenuClick("/admin/admins"),
        },
        {
          key: "/admin/sellers",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Seller List</span>
              {pendingBadgeCount > 0 && (
                <Badge count={pendingBadgeCount} size="small" />
              )}
            </div>
          ),
          children: [
            {
              key: "/admin/sellers",
              label: "All Sellers",
              onClick: () => handleMenuClick("/admin/sellers"),
            },
            ...businessTypes.map((type) => ({
              key: `/admin/sellers?type=${type._id}`,
              label: type.name,
              onClick: () => handleMenuClick(`/admin/sellers?type=${type._id}`),
            })),
          ],
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
      label: (
        <div className="flex justify-between items-center pr-4">
          <span>Enquiry Leads</span>
          {newEnquiryCount > 0 && <Badge count={newEnquiryCount} size="small" />}
        </div>
      ),
      onClick: () => handleMenuClick("/admin/enquiries"),
    },
    {
      key: "/admin/requirements",
      icon: <ClipboardList size={20} />,
      label: (
        <div className="flex justify-between items-center pr-4">
          <span>Posted Requirements</span>
          {newRequirementCount > 0 && (
            <Badge count={newRequirementCount} size="small" />
          )}
        </div>
      ),
      onClick: () => handleMenuClick("/admin/requirements"),
    },
    {
      key: "forms-sub",
      icon: <MessageSquare size={20} />,
      label: (
        <div className="flex items-center gap-2">
          <span>Forms Data</span>
          {(newCallRequestCount > 0 || newContactCount > 0) && (
            <Badge dot offset={[5, -2]} />
          )}
        </div>
      ),
      children: [
        {
          key: "/admin/forms/call-requests",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Call Requests</span>
              {newCallRequestCount > 0 && (
                <Badge count={newCallRequestCount} size="small" />
              )}
            </div>
          ),
          onClick: () => handleMenuClick("/admin/forms/call-requests"),
        },
        {
          key: "/admin/forms/contact-messages",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Contact Messages</span>
              {newContactCount > 0 && (
                <Badge count={newContactCount} size="small" />
              )}
            </div>
          ),
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
      key: "subscriptions-sub",
      icon: <CreditCard size={20} />,
      label: (
        <div className="flex items-center gap-2">
          <span>Subscriptions</span>
          {newExpiringPlansCount > 0 && (
            <Badge 
              count={newExpiringPlansCount} 
              size="small" 
              style={{ backgroundColor: '#ff4d4f', boxShadow: '0 0 0 1px #fff' }} 
            />
          )}
        </div>
      ),
      children: [
        {
          key: "/admin/subscription-plans",
          label: "Subscription Plans",
          onClick: () => handleMenuClick("/admin/subscription-plans"),
        },
        {
          key: "/admin/payment-history",
          label: (
            <div className="flex justify-between items-center pr-4">
              <span>Payment History</span>
              {newExpiringPlansCount > 0 && (
                <Badge count={newExpiringPlansCount} size="small" />
              )}
            </div>
          ),
          onClick: () => handleMenuClick("/admin/payment-history"),
        },
      ],
    },
    {
      key: "/admin/support",
      icon: <Headphones size={20} />,
      label: (
        <div className="flex justify-between items-center pr-4">
          <span>Support Tickets</span>
          {newSupportTicketCount > 0 && (
            <Badge count={newSupportTicketCount} size="small" />
          )}
        </div>
      ),
      onClick: () => handleMenuClick("/admin/support"),
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

  // Memoized filtered menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    if (!user) return [];
    if (user.isSuperAdmin) return allMenuItems;

    const userPermissions = user.permissions || [];
    
    const filterItems = (items) => {
      return items
        .map(item => {
          // If item has children, filter them first
          if (item.children) {
            const filteredChildren = filterItems(item.children);
            // If some children remain, show this parent item with filtered children
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          
          // Check if this item itself is permitted
          const hasPermission = userPermissions.includes(item.key);
          if (hasPermission) {
            // If it has children but they were all filtered out, 
            // we still show it as a leaf node if the parent key itself is permitted
            // (though in this sidebar structure, leaf nodes usually have keys that are routes)
            return item;
          }
          
          return null;
        })
        .filter(Boolean);
    };

    return filterItems(allMenuItems);
  }, [user, allMenuItems]);

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
              {user?.isSuperAdmin ? "AP" : "SAP"}
            </div>
          ) : (
            <span className="text-white text-lg font-bold tracking-wide group-hover:scale-105 transition-transform">
              {user?.isSuperAdmin ? "ADMIN PANEL" : "SUB ADMIN PANEL"}
            </span>
          )}
        </div>
      </Link>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname + search]}

        defaultOpenKeys={["properties-sub", "users-sub", "seller-sub"]} // Optional: Keep submenus open by default or manage state
        items={filteredMenuItems}
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
