import React from 'react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore';
import { useSidebar } from '../../store/sidebarStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          // On mobile (< lg): no left margin, sidebar uses overlay
          // On desktop (>= lg): left margin based on sidebar state
          'lg:ml-16', // Default collapsed size on desktop
          !isCollapsed && 'lg:ml-64' // Expanded size when not collapsed
        )}
      >
        <Navbar />
        <main 
          className={cn(
            'py-6 px-4 sm:px-6 lg:px-8',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;