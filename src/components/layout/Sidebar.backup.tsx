import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore';
import { useSidebar, useSidebarActions } from '../../store/sidebarStore';
import {
  LayoutDashboard,
  Users,
  Building,
  MapPin,
  Calendar,
  Clock,
  Timer,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Users,
  Building,
  MapPin,
  Calendar,
  Clock,
  Timer,
  Settings
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isOpen, isCollapsed } = useSidebar();
  const { toggle, setCollapsed, getMenuItems } = useSidebarActions();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  const menuItems = user ? getMenuItems(user.role) : [];

  const toggleSubmenu = (menuLabel: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuLabel) 
        ? prev.filter(item => item !== menuLabel)
        : [...prev, menuLabel]
    );
  };

  const isActiveLink = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  const renderMenuItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.label);
    const isActive = isActiveLink(item.path);

    if (hasChildren) {
      return (
        <li key={item.label}>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'hover:bg-gray-100 hover:text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              isActive ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
            )}
          >
            <div className="flex items-center">
              {renderIcon(item.icon)}
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </div>
            {!isCollapsed && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {!isCollapsed && isExpanded && (
            <ul className="ml-6 mt-1 space-y-1">
              {item.children.map((child: any) => (
                <li key={child.label}>
                  <Link
                    to={child.path}
                    className={cn(
                      'block px-4 py-2 text-sm rounded-lg transition-colors',
                      'hover:bg-gray-100 hover:text-gray-900',
                      isActiveLink(child.path) 
                        ? 'bg-primary-100 text-primary-900 font-medium' 
                        : 'text-gray-600'
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.label}>
        <Link
          to={item.path}
          className={cn(
            'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            'hover:bg-gray-100 hover:text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            isActive ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
          )}
        >
          {renderIcon(item.icon)}
          {!isCollapsed && <span className="ml-3">{item.label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Presensi
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!isCollapsed)}
              className="hidden lg:block p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Mobile close button */}
            <button
              onClick={toggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map(renderMenuItem)}
          </ul>
        </nav>

        {/* User info */}
        {!isCollapsed && user && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'user'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;