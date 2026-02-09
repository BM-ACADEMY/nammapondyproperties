import { Menu } from 'antd';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Images,
  MessageSquare,
} from 'lucide-react';

const Sidebar = ({ collapsed }) => {
  const menuItems = [
    {
      key: 'overview',
      icon: <LayoutDashboard size={20} />,
      label: 'Overviews',
    },
    {
      key: 'users',
      icon: <Users size={20} />,
      label: 'All Users',
    },
    {
      key: 'subscription',
      icon: <CreditCard size={20} />,
      label: 'Subscription',
    },
    {
      key: 'gallery',
      icon: <Images size={20} />,
      label: 'Gallery',
    },
    {
      key: 'testimonials',
      icon: <MessageSquare size={20} />,
      label: 'Testimonials',
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['users']}
      items={menuItems}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default Sidebar;
