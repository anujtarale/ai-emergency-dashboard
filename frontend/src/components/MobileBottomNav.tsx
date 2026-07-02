import { NavLink } from 'react-router-dom';
import {
  Home,
  ShieldAlert,
  Users,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';

interface BottomNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  featureKey?: string;
}

const bottomNavItems: BottomNavItem[] = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/sos', label: 'SOS', icon: ShieldAlert, featureKey: 'sos' },
  { to: '/assistant', label: 'AI', icon: MessageSquare, featureKey: 'ai-assistant' },
  { to: '/reports', label: 'Reports', icon: Users, featureKey: 'community-reports' },
  { to: '/alerts', label: 'Alerts', icon: Bell, featureKey: 'safety-alerts' },
];

const MobileBottomNav = () => {
  const { isAuthenticated, features } = useAppStore();
  if (!isAuthenticated) return null;

  const visibleItems = bottomNavItems.filter(item => {
    if (item.featureKey && features[item.featureKey] === false) return false;
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors min-w-0',
                isActive
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
