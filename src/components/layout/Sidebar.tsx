import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  ApartmentOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MobileOutlined,
  LogoutOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth, useAuthActions } from '../../store/authStore';
import { useSidebar, useSidebarActions } from '../../store/sidebarStore';
import { roleGuard } from '../../utils/roleGuard';
import type { MenuProps } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

// Menu items configuration with icons
const getMenuIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'LayoutDashboard': <DashboardOutlined />,
    'Users': <UserOutlined />,
    'Building': <BankOutlined />,
    'Sitemap': <ApartmentOutlined />,
    'MapPin': <EnvironmentOutlined />,
    'Calendar': <CalendarOutlined />,
    'Clock': <ClockCircleOutlined />,
    'Timer': <FieldTimeOutlined />,
    'Settings': <SettingOutlined />,
    'Mobile': <MobileOutlined />,
    'FileText': <FileTextOutlined />
  };
  return icons[iconName] || <DashboardOutlined />;
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const { isCollapsed } = useSidebar();
  const { toggle } = useSidebarActions();

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'admin-opd': return 'Admin OPD';
      case 'admin-upt': return 'Admin UPT';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return '#722ed1';
      case 'admin': return '#1890ff';
      case 'admin-opd': return '#52c41a';
      case 'admin-upt': return '#fa8c16';
      default: return '#8c8c8c';
    }
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
      onClick: handleLogout,
      danger: true
    }
  ];

  // Get menu items based on user role
  const menuItems = user ? roleGuard.getMenuForRole(user.role) : [];

  // Get current path for menu selection
  const currentPath = location.pathname;
  const selectedKeys = [currentPath.split('/')[1] || 'dashboard'];

  const handleMenuClick = ({ key }: { key: string }) => {
    // For submenu items, the key is the full path
    if (key.startsWith('/')) {
      navigate(key);
      return;
    }
    
    // For regular menu items, find by path segment
    const item = menuItems.find(item => {
      if (item.path) {
        return item.path.split('/')[1] === key;
      }
      return false;
    });
    if (item?.path) {
      navigate(item.path);
    }
  };

  const handleToggle = () => {
    toggle();
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
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column'
      }}

      
    >

      {/* Toggle Button */}
      <div style={{ 
        padding: isCollapsed ? '12px 0' : '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: isCollapsed ? 'center' : 'flex-end'
      }}>
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggle}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {/* User Profile Section - Top */}
      {user && (
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          {!isCollapsed ? (
            // Expanded User Section
            <div style={{ padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar
                  size={48}
                  style={{ 
                    backgroundColor: getRoleColor(user.role),
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                  icon={!user.name && <UserOutlined />}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ 
                    fontSize: '16px', 
                    display: 'block',
                    color: '#262626',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px'
                  }}>
                    {user.name}
                  </Text>
                  <Text style={{ 
                    fontSize: '13px', 
                    color: getRoleColor(user.role),
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {getRoleDisplayName(user.role)}
                  </Text>
                  
                  {/* Show admin_opd information if available */}
                  {user.admin_opd && (
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>
                      {user.admin_opd.id_skpd && (
                        <div>SKPD: {user.admin_opd.id_skpd}</div>
                      )}
                      {user.admin_opd.id_satker && (
                        <div>Satker: {user.admin_opd.id_satker}</div>
                      )}
                      {user.admin_opd.id_bidang && (
                        <div>Bidang: {user.admin_opd.id_bidang}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
           
            </div>
          ) : (
            // Collapsed User Section
            <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
              <Dropdown 
                menu={{ items: userMenuItems.slice(0, -2) }} // Exclude divider and logout
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar
                  size={40}
                  style={{ 
                    backgroundColor: getRoleColor(user.role),
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  icon={!user.name && <UserOutlined />}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Dropdown>
            </div>
          )}
        </div>
      )}

      
      {/* Navigation Menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            paddingTop: '8px',
            background: 'transparent'
          }}
          theme="light"
          items={menuItems.map((item, index) => {
            if ('children' in item && item.children) {
              // Handle submenu items
              return {
                key: `submenu-${item.label.toLowerCase().replace(/\s+/g, '-')}`,
                icon: getMenuIcon(item.icon || ''),
                label: <span style={{ color: '#262626' }}>{item.label}</span>,
                children: item.children.map((child, childIndex) => ({
                  key: child.path || `child-${index}-${childIndex}`,
                  label: <span style={{ color: '#262626' }}>{child.label}</span>
                }))
              };
            } else {
              // Handle regular menu items
              return {
                key: item.path?.split('/')[1] || item.label.toLowerCase().replace(/\s+/g, '-'),
                icon: getMenuIcon(item.icon || ''),
                label: <span style={{ color: '#262626' }}>{item.label}</span>
              };
            }
          })}
        />
      </div>

      {/* Logout Button - Bottom */}
      {user && (
        <div style={{ 
          borderTop: '1px solid #f0f0f0',
          padding: isCollapsed ? '16px 0' : '16px'
        }}>
          {!isCollapsed ? (
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                width: '100%',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Keluar
            </Button>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
          )}
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;