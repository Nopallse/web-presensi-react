import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../../store/authStore';
import { useSidebar, useSidebarActions } from '../../store/sidebarStore';

const { Sider } = Layout;
const { Text } = Typography;

// Menu items configuration
const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    key: 'pegawai',
    icon: <UserOutlined />,
    label: 'Pegawai',
    path: '/pegawai'
  },
  {
    key: 'skpd',
    icon: <BankOutlined />,
    label: 'SKPD',
    path: '/skpd'
  },
  {
    key: 'lokasi',
    icon: <EnvironmentOutlined />,
    label: 'Lokasi',
    path: '/lokasi'
  },
  {
    key: 'kegiatan',
    icon: <CalendarOutlined />,
    label: 'Kegiatan',
    path: '/kegiatan'
  },
  {
    key: 'presensi',
    icon: <ClockCircleOutlined />,
    label: 'Presensi',
    path: '/presensi'
  },
  {
    key: 'jam-dinas',
    icon: <FieldTimeOutlined />,
    label: 'Jam Dinas',
    path: '/jam-dinas'
  },
  {
    key: 'pengaturan',
    icon: <SettingOutlined />,
    label: 'Pengaturan',
    path: '/pengaturan'
  }
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const { toggle } = useSidebarActions();

  // Get current path for menu selection
  const currentPath = location.pathname;
  const selectedKeys = [currentPath.split('/')[1] || 'dashboard'];

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <Sider
      collapsed={isCollapsed}
      width={256}
      collapsedWidth={80}
      style={{
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        background: '#fff',
        borderRight: '1px solid #f0f0f0'
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 16px',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#0ea5e9',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}
            >
              <DashboardOutlined style={{ fontSize: '18px', color: 'white' }} />
            </div>
            <div>
              <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                Presensi
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Kota Pariaman
              </Text>
            </div>
          </div>
        )}
        
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#0ea5e9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              fontSize: '20px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <Text strong style={{ fontSize: '14px', display: 'block' }}>
            {user.name}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Text>
        </div>
      )}

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 64px - 80px)',
          paddingTop: '8px'
        }}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label
        }))}
      />
    </Sider>
  );
};

export default Sidebar;