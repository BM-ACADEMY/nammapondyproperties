import { Button, Avatar, Dropdown, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const Header = ({ collapsed, setCollapsed }) => {
  const userMenu = (
    <Menu
      items={[
        { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
        { key: 'logout', label: 'Logout', danger: true, icon: <LogoutOutlined /> },
      ]}
    />
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: 18 }}
      />

      <div style={{ fontSize: 20, fontWeight: 'bold' }}>Hp Fitness Studio</div>

      <Dropdown overlay={userMenu} placement="bottomRight">
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
          <div>
            Bmtechx <small style={{ color: '#888' }}>(Administrator)</small>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default Header;
