import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer } from "antd";
import { LayoutDashboard, Building, PlusCircle, User, MessageSquare, Settings } from "lucide-react";

const { Sider } = Layout;

const SellerSidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menuItems = [
    {
      key: "/seller/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      onClick: () => navigate("/seller/dashboard"),
    },
    {
      key: "properties",
      icon: <Building size={20} />,
      label: "Properties",
      children: [
        {
          key: "/seller/my-properties",
          label: "My Properties",
          onClick: () => navigate("/seller/my-properties"),
        },
        {
          key: "/seller/add-property",
          label: "Add Property",
          onClick: () => navigate("/seller/add-property"),
        },
      ],
    },
    {
      key: "/seller/enquiries",
      icon: <MessageSquare size={20} />,
      label: "Enquiry Property",
      onClick: () => navigate("/seller/enquiries"),
    },
    {
      key: "/seller/profile",
      icon: <User size={20} />,
      label: "Profile",
      onClick: () => navigate("/seller/profile"),
    },
  ];

  const SidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 m-2 bg-white/10 rounded-lg">
        {collapsed && !isMobile ? (
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
            SP
          </div>
        ) : (
          <span className="text-white text-lg font-bold tracking-wide">
            SELLER PANEL
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

export default SellerSidebar;
