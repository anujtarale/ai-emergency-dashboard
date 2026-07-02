import { useEffect } from 'react';
import Navbar from './Navbar';
import UserSidebar from './UserSidebar';
import MobileBottomNav from './MobileBottomNav';
import { useAppStore } from '../store';

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, maintenanceMode } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-x-hidden text-gray-900 dark:text-gray-100 transition-colors duration-250">
      {maintenanceMode && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
          System is under maintenance — some features may be unavailable
        </div>
      )}
      <Navbar />
      <div className={`flex w-full ${maintenanceMode ? 'pt-20' : 'pt-16'}`}>
        <UserSidebar />
        <main className="flex-1 min-w-0 min-h-[calc(100vh-64px)] pb-20 md:pb-0 md:ml-[68px] xl:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default UserLayout;
