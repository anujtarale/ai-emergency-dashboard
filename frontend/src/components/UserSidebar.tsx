import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, MessageSquare, MapPin, PhoneCall, Bell, User,
  ShieldAlert, BarChart3, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';
import { usePWA } from '../hooks/usePWA';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  featureKey?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/sos', label: 'Emergency SOS', icon: ShieldAlert, featureKey: 'sos' },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquare, featureKey: 'ai-assistant' },
  { to: '/map', label: 'Live Map', icon: MapPin, featureKey: 'live-map' },
  { to: '/services', label: 'Nearby Services', icon: PhoneCall, featureKey: 'nearby-services' },
  { to: '/alerts', label: 'Safety Alerts', icon: Bell, featureKey: 'safety-alerts' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, featureKey: 'analytics' },
  { to: '/profile', label: 'Profile & Settings', icon: User },
];

const UserSidebar = () => {
  const { isAuthenticated, user, features } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isInstallable, installApp } = usePWA();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) return null;

  const visibleItems = navItems.filter(item => {
    if (item.featureKey && features[item.featureKey] === false) return false;
    return true;
  });

  return (
    <aside className={cn(
      'hidden md:flex md:flex-col fixed top-16 left-0 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30',
      collapsed ? 'md:w-[68px]' : 'md:w-64'
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all z-40 hover:scale-110"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center rounded-lg transition-all duration-150 group relative',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3',
              location.pathname === item.to
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        {isInstallable && (
          <button
            onClick={installApp}
            className={cn(
              'flex items-center rounded-lg transition-all duration-150 group relative w-full text-left mt-2 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3',
              'text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-950/30'
            )}
          >
            <Download className={cn('shrink-0 text-blue-600 dark:text-blue-400', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            {!collapsed && <span className="text-sm font-semibold">Install App</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-blue-600 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg font-medium">
                Install App
              </span>
            )}
          </button>
        )}
      </nav>

      {!collapsed && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                👤 User Portal
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default UserSidebar;
