import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, UserCog, Shield, Settings, BarChart3,
  PhoneCall, Bell, ShieldAlert, FileText, Cpu, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';
import { usePWA } from '../hooks/usePWA';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: UserCog },
  { to: '/admin/services', label: 'Emergency Services', icon: PhoneCall },
  { to: '/admin/features', label: 'Feature Flags', icon: Shield },
  { to: '/admin/alerts', label: 'Alert Management', icon: Bell },
  { to: '/admin/sos', label: 'SOS Monitoring', icon: ShieldAlert },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
  { to: '/admin/analytics', label: 'Admin Analytics', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports Management', icon: FileText },
  { to: '/admin/ai-config', label: 'AI Configuration', icon: Cpu },
];

const AdminSidebar = () => {
  const { isAuthenticated, user } = useAppStore();
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

  return (
    <aside className={cn(
      'hidden md:flex md:flex-col fixed top-16 left-0 h-[calc(100vh-64px)] bg-gray-900 border-r border-gray-800 text-gray-400 transition-all duration-300 z-30',
      collapsed ? 'md:w-[68px]' : 'md:w-64'
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-gray-800 border border-gray-750 flex items-center justify-center shadow-md text-gray-400 hover:text-white transition-all z-40 hover:scale-110"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        <div className={cn('pb-2 text-center', collapsed ? 'px-1' : 'px-3 text-left')}>
          {!collapsed ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Command Center</p>
          ) : (
            <div className="h-px bg-gray-850" />
          )}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={cn(
              'flex items-center rounded-lg transition-all duration-150 group relative',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3',
              location.pathname === item.to
                ? 'bg-purple-900/40 text-purple-300 border-l-2 border-purple-500 rounded-l-none'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-950 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        {isInstallable && (
          <button
            onClick={installApp}
            className={cn(
              'flex items-center rounded-lg transition-all duration-150 group relative w-full text-left mt-2 border border-purple-900/50 bg-purple-950/20',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 gap-3',
              'text-purple-400 hover:bg-purple-900/40 hover:text-purple-300'
            )}
          >
            <Download className={cn('shrink-0 text-purple-400 group-hover:text-purple-300', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            {!collapsed && <span className="text-sm font-semibold">Install App</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-purple-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg font-medium">
                Install App
              </span>
            )}
          </button>
        )}
      </nav>

      {!collapsed && (
        <div className="border-t border-gray-800 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-purple-400">
                🛡️ System Admin
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
