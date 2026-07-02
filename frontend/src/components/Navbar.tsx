import { Link, useNavigate, NavLink } from 'react-router-dom';
import {
  ShieldAlert, Bell, Menu, Moon, Sun, X, LogOut,
  Home, MessageSquare, MapPin, PhoneCall, Users, Bell as BellIcon,
  User, BarChart3, Shield, Settings, UserCog, LayoutDashboard
} from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '../store';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  featureKey?: string;
}

const allNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/sos', label: 'Emergency SOS', icon: ShieldAlert, featureKey: 'sos' },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquare, featureKey: 'ai-assistant' },
  { to: '/map', label: 'Live Map', icon: MapPin, featureKey: 'live-map' },
  { to: '/services', label: 'Nearby Services', icon: PhoneCall, featureKey: 'nearby-services' },
  { to: '/reports', label: 'Community Reports', icon: Users, featureKey: 'community-reports' },
  { to: '/alerts', label: 'Safety Alerts', icon: BellIcon, featureKey: 'safety-alerts' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, featureKey: 'analytics' },
  { to: '/profile', label: 'Profile & Settings', icon: User },
  { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/admin/users', label: 'User Management', icon: UserCog, adminOnly: true },
  { to: '/admin/features', label: 'Feature Management', icon: Shield, adminOnly: true },
  { to: '/admin/settings', label: 'System Settings', icon: Settings, adminOnly: true },
  { to: '/admin/analytics', label: 'Admin Analytics', icon: BarChart3, adminOnly: true },
];

const Navbar = () => {
  const { isAuthenticated, user, theme, setTheme, logout, notifications, markNotificationRead, clearNotifications, features } = useAppStore();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } else {
      navigate('/');
    }
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdmin = user?.role === 'admin';

  const visibleItems = allNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.featureKey && features[item.featureKey] === false) return false;
    return true;
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const notificationElement = document.querySelector('[data-notification-menu]');
      const bellButton = (e.target as HTMLElement).closest('[data-notification-button]');
      if (
        notificationElement && 
        !notificationElement.contains(e.target as Node) && 
        !bellButton
      ) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await logout();
    navigate('/');
  };

  const getRelativeTime = (date: Date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident': return '🚨';
      case 'report': return '📢';
      case 'safety': return '⚠️';
      case 'system': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <button onClick={handleLogoClick} className="flex items-center space-x-2 shrink-0 cursor-pointer">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Emergency AI</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-700 dark:text-gray-300">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef} style={{ position: 'relative' }}>
                  <Button data-notification-button variant="ghost" size="icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="text-gray-700 dark:text-gray-300">
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Button>

                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        data-notification-menu
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        className="fixed inset-x-4 top-16 md:fixed md:inset-x-auto md:right-4 md:left-auto md:top-16 md:mt-0 w-auto md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 border-gray-200 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={clearNotifications} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-[50vh] md:max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => markNotificationRead(notification.id)}
                                className={`px-4 py-3 border-b dark:border-gray-700 border-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{notification.title}</h4>
                                      {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-2" />}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">{getRelativeTime(notification.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop user info + logout */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                      <p className={cn('text-[10px] font-medium leading-tight', user?.role === 'admin' ? 'text-purple-500' : 'text-gray-400')}>
                        {user?.role === 'admin' ? '🛡️ Admin' : 'User'}
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </Button>
                </div>

                {/* Mobile hamburger */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-700 dark:text-gray-300"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-2xl flex flex-col md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                    <p className={cn('text-xs font-medium', user?.role === 'admin' ? 'text-purple-500' : 'text-gray-400')}>
                      {user?.role === 'admin' ? '🛡️ Administrator' : '👤 User'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {/* User items */}
                {visibleItems.filter(i => !i.adminOnly).map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}

                {/* Admin section */}
                {isAdmin && visibleItems.filter(i => i.adminOnly).length > 0 && (
                  <>
                    <div className="px-2 pt-4 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Admin</p>
                    </div>
                    {visibleItems.filter(i => i.adminOnly).map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) => cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                          isActive
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
                <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-2 text-gray-700 dark:text-gray-300">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
