import { useEffect } from 'react';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';
import { useAppStore } from '../store';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, maintenanceMode } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-950 overflow-x-hidden text-gray-900 dark:text-gray-100 transition-colors duration-250">
      {maintenanceMode && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-3">
          <span>⚠ Maintenance mode is ACTIVE — users cannot access the system</span>
          <a href="/admin/settings" className="underline font-semibold hover:text-orange-100">
            Go to Settings
          </a>
        </div>
      )}
      <Navbar />
      <div className={`flex w-full ${maintenanceMode ? 'pt-20' : 'pt-16'}`}>
        <AdminSidebar />
        <main className="flex-1 min-w-0 min-h-[calc(100vh-64px)] pb-6 md:ml-[68px] xl:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
