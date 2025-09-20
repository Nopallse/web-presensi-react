import React from 'react';
import { cn } from '../../utils/cn';
import { useAuth, useAuthActions } from '../../store/authStore';
import { useSidebarActions } from '../../store/sidebarStore';
import { useNotifications } from '../../store/uiStore';
import Button from '../ui/Button';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const { toggle } = useSidebarActions();
  const { notifications, unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="lg:hidden p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifikasi</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            'px-4 py-3 hover:bg-gray-50 cursor-pointer',
                            !notification.read && 'bg-blue-50'
                          )}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        Tidak ada notifikasi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2"
            >
              <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role?.replace('_', ' ') || 'user'}
                    </p>
                  </div>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Pengaturan
                  </button>
                  
                  <div className="border-t border-gray-200">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;