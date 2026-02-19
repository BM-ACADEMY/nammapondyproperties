import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  LayoutDashboard,
  Building,
  User,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";


const { Sider } = Layout;

const SellerSidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth(); // Get logout function

  const handleMenuClick = (path) => {
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
      label: "Enquiry Property",
      onClick: () => handleMenuClick("/seller/enquiries"),
    },
    {
      key: "/seller/profile",
      icon: <User size={20} />,
      label: "Profile",
      onClick: () => handleMenuClick("/seller/profile"),
    },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <Link to="/">
      <div className="flex items-center justify-center h-16 m-2 rounded-lg shrink-0">
        {collapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold bg-blue-600">
            SP
          </div>
        ) : (
          <span className="text-white text-lg font-bold tracking-wide">
            SELLER PANEL
          </span>
        )}
      </div>
      </Link>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="px-2 border-none"
          style={{ background: "transparent" }}
        />
      </div>

      <div className="p-4 border-t border-gray-700 shrink-0">
        <Button
          type="primary"
          danger
          block={!collapsed}
          icon={<LogOut size={18} />}
          onClick={logout}
          className="flex items-center justify-center gap-2"
          style={collapsed && !isMobile ? { padding: "0 8px" } : {}}
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

export default SellerSidebar;
