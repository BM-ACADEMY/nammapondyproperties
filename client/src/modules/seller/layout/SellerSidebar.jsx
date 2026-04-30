import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Drawer, Button, message } from "antd";
import {
  LayoutDashboard,
  Building,
  User,
  MessageSquare,
  Megaphone,
  LogOut,
  Lock,
  CreditCard,
  ClipboardList,
  Headphones,
  Star
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../../../services/api";

const { Sider } = Layout;

const SellerSidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  // Set "Properties" menu to be open by default
  const defaultOpenKeys = ["properties"];

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const [subRes, historyRes] = await Promise.all([
          api.get("/subscriptions/my-subscription"),
          api.get("/subscriptions/my-history")
        ]);
        setHasActivePlan(!!subRes.data);
        setHasHistory(historyRes.data?.length > 0);
      } catch (error) {
        console.error("Sidebar sub check error:", error);
      }
    };
    checkSubscription();
  }, [pathname]);

  const handleMenuClick = (path, isLocked = false) => {
    if (isLocked) return;
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const menuItems = [
    {
      key: "/seller/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => handleMenuClick("/seller/dashboard"),
    },
    {
      key: "properties",
      icon: <Building size={20} />,
      label: "Properties",
      children: [
        {
          key: "/seller/my-properties",
          label: "My Properties",
          onClick: () => handleMenuClick("/seller/my-properties"),
        },
        {
          key: "/seller/add-property",
          label: "Add Property",
          onClick: () => handleMenuClick("/seller/add-property"),
        },
      ],
    },
    {
      key: "/seller/enquiries",
      icon: <MessageSquare size={20} />,
      label: (
        <div className="flex items-center justify-between gap-2">
          <span>Enquiry Property</span>
          {!hasActivePlan && <Lock size={12} className="text-white" />}
        </div>
      ),
      onClick: () => handleMenuClick("/seller/enquiries"),
    },
    {
      key: "/seller/leads-overview",
      icon: <ClipboardList size={20} />,
      label: (
        <div className={`flex items-center justify-between gap-2 ${!hasActivePlan ? "cursor-not-allowed" : ""}`}>
          <span>Leads Overview</span>
          {!hasActivePlan && <Lock size={12} className="text-white" />}
        </div>
      ),
      onClick: () => {
        if (!hasActivePlan) {
          navigate("/seller/upgrade-plan");
        } else {
          handleMenuClick("/seller/leads-overview");
        }
      },
      className: !hasActivePlan ? "!cursor-not-allowed" : "",
    },
    {
      key: "/seller/payment-history",
      icon: <CreditCard size={20} />,
      label: (
        <div className={`flex items-center justify-between gap-2 ${!hasHistory ? "cursor-not-allowed" : ""}`}>
          <span>Payment History</span>
          {!hasHistory && <Lock size={12} className="text-white" />}
        </div>
      ),
      onClick: () => {
        if (!hasHistory) {
          message.warning("Please upgrade your plan to access payment history");
        } else {
          handleMenuClick("/seller/payment-history");
        }
      },
      className: !hasHistory ? "!cursor-not-allowed" : "",
    },
    {
      key: "/seller/support",
      icon: <Headphones size={20} />,
      label: "Support Team",
      onClick: () => handleMenuClick("/seller/support"),
    },
    {
      key: "/seller/reviews",
      icon: <Star size={20} />,
      label: "My Reviews",
      onClick: () => handleMenuClick("/seller/reviews"),
    },
    {
      key: "/seller/profile",
      icon: <User size={20} />,
      label: "Profile",
      onClick: () => handleMenuClick("/seller/profile"),
    },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#001529]">
      {/* Brand Logo Area */}
      <Link to="/">
        <div className="flex items-center justify-center h-16 m-4 rounded-lg bg-blue-600/10 border border-blue-500/20 shrink-0">
          {collapsed && !isMobile ? (
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold bg-blue-600">
              SP
            </div>
          ) : (
            <span className="text-white text-lg font-bold tracking-widest">
              SELLER PANEL
            </span>
          )}
        </div>
      </Link>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto pt-2">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          className="px-2 border-none"
          style={{ background: "transparent" }}
        />
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-gray-800 shrink-0">
        <Button
          type="primary"
          danger
          block={!collapsed || isMobile}
          icon={<LogOut size={18} />}
          onClick={logout}
          className="flex items-center justify-center gap-2"
          style={collapsed && !isMobile ? { width: 48, margin: "0 auto" } : {}}
        >
          {(!collapsed || isMobile) && "Logout"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        styles={{ body: { padding: 0, background: "#001529" } }}
        size={250}
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
      collapsedWidth={80}
      className="shadow-xl z-20"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: "#001529",
      }}
    >
      {SidebarContent}
    </Sider>
  );
};

export default SellerSidebar;
