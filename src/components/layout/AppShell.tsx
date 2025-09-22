import React from 'react';
import { Layout } from 'antd';
import { useAuth } from '../../store/authStore';
import { useSidebar } from '../../store/sidebarStore';
import Sidebar from './Sidebar';

const { Content } = Layout;

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();

  if (!isAuthenticated) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content>{children}</Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout 
        style={{
          marginLeft: isCollapsed ? 80 : 256,
          transition: 'margin-left 0.2s ease'
        }}
      >
        <Content 
          style={{ 
            background: '#f5f5f5',
            minHeight: '100vh'
          }}
        >
          <div className={className}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;