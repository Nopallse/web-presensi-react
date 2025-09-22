import React from 'react';
import { Layout, Dropdown, Button, Avatar, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth, useAuthActions } from '../../store/authStore';

const { Header } = Layout;
const { Text } = Typography;

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil Saya'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Pengaturan'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      onClick: handleLogout
    }
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}
    >
      {/* Left side - could add breadcrumbs or page title here */}
      <div>
        <Text strong style={{ fontSize: '16px', color: '#262626' }}>
          Sistem Presensi Pegawai
        </Text>
      </div>

      {/* Right side - user actions */}
      <Space size="middle">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />

        {user && (
          <Dropdown 
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button
              type="text"
              style={{
                height: '40px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Avatar
                size={32}
                style={{ 
                  backgroundColor: '#0ea5e9',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                icon={!user.name && <UserOutlined />}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ textAlign: 'left' }}>
                <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: 0.5 }}>
                  {user.name}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px', lineHeight:  0.5 }}>
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Text>
              </div>
            </Button>
          </Dropdown>
        )}
      </Space>
    </Header>
  );
};

export default Navbar;