import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SOSCenter from './pages/SOSCenter';
import AIAssistant from './pages/AIAssistant';
import LiveMap from './pages/LiveMap';
import NearbyServices from './pages/NearbyServices';
import CommunityReports from './pages/CommunityReports';
import SafetyAlerts from './pages/SafetyAlerts';
import ProfileSettings from './pages/ProfileSettings';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import AdminFeatures from './pages/AdminFeatures';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminServices from './pages/AdminServices';
import AdminAlerts from './pages/AdminAlerts';
import AdminSOS from './pages/AdminSOS';
import AdminReports from './pages/AdminReports';
import AdminAIConfig from './pages/AdminAIConfig';
import MaintenancePage from './pages/MaintenancePage';
import { useSocket } from './hooks/useSocket';
import { useEffect } from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import { ReloadPrompt } from './components/ReloadPrompt';

const queryClient = new QueryClient();

/** Route only accessible to authenticated users with role 'user'.
 *  Admins attempting to access are logged out and redirected to /login.
 */
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAppStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'admin') {
    toast.error('Access Denied — Admin accounts use the Admin Portal.');
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/** Route only accessible to authenticated admins.
 *  Regular users attempting to access are logged out and redirected to /login.
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAppStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== 'admin') {
    toast.error('Access Denied — This section requires administrator privileges.');
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/** Feature-gate: Redirects to /dashboard if the specified feature flag is disabled */
const FeatureRoute = ({ featureKey, children }: { featureKey: string; children: React.ReactNode }) => {
  const { features } = useAppStore();
  if (features[featureKey] === false) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, isAuthChecked, checkAuth, user, maintenanceMode, fetchMaintenanceMode } = useAppStore();

  // Persistent socket connection for all authenticated users
  useSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    fetchMaintenanceMode();
  }, [fetchMaintenanceMode]);

  // Periodic polling fallback for users without socket (unauthenticated)
  useEffect(() => {
    if (!isAuthChecked) return;
    const interval = setInterval(() => {
      fetchMaintenanceMode();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthChecked, fetchMaintenanceMode]);

  const shouldBlock = maintenanceMode && isAuthChecked && user?.role !== 'admin';

  if (!isAuthChecked) {
    if (maintenanceMode) {
      return <MaintenancePage />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Emergency AI...</p>
        </div>
      </div>
    );
  }

  // Smart redirect for already-authenticated users visiting auth pages
  const getAuthRedirect = () => {
    if (!isAuthenticated) return null;
    return user?.role === 'admin' ? '/admin' : '/dashboard';
  };
  const authRedirect = getAuthRedirect();

  if (shouldBlock) {
    return <MaintenancePage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          containerStyle={{ bottom: '80px' }}
          toastOptions={{
            duration: 5000,
            style: { borderRadius: '12px', padding: '14px 16px', fontSize: '14px', maxWidth: '90vw' },
          }}
        />
        <Routes>
          {/* ─── Public Routes ─── */}
          <Route path="/" element={authRedirect ? <Navigate to={authRedirect} replace /> : <Landing />} />
          <Route path="/login" element={authRedirect ? <Navigate to={authRedirect} replace /> : <Login />} />
          <Route path="/register" element={authRedirect ? <Navigate to={authRedirect} replace /> : <Register />} />
          <Route path="/forgot-password" element={authRedirect ? <Navigate to={authRedirect} replace /> : <ForgotPassword />} />

          {/* ─── User Portal Routes ─── */}
          <Route path="/dashboard" element={
            <UserRoute><UserLayout><Dashboard /></UserLayout></UserRoute>
          } />
          <Route path="/sos" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="sos"><SOSCenter /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/assistant" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="ai-assistant"><AIAssistant /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/map" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="live-map"><LiveMap /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/services" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="nearby-services"><NearbyServices /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/reports" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="community-reports"><CommunityReports /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/alerts" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="safety-alerts"><SafetyAlerts /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/analytics" element={
            <UserRoute><UserLayout><FeatureRoute featureKey="analytics"><Analytics /></FeatureRoute></UserLayout></UserRoute>
          } />
          <Route path="/profile" element={
            <UserRoute><UserLayout><ProfileSettings /></UserLayout></UserRoute>
          } />

          {/* ─── Admin Portal Routes ─── */}
          <Route path="/admin" element={
            <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/services" element={
            <AdminRoute><AdminLayout><AdminServices /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/features" element={
            <AdminRoute><AdminLayout><AdminFeatures /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/alerts" element={
            <AdminRoute><AdminLayout><AdminAlerts /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/sos" element={
            <AdminRoute><AdminLayout><AdminSOS /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/ai-config" element={
            <AdminRoute><AdminLayout><AdminAIConfig /></AdminLayout></AdminRoute>
          } />

          {/* ─── Catch-All: role-aware redirect ─── */}
          <Route path="*" element={
            <Navigate to={
              isAuthenticated
                ? (user?.role === 'admin' ? '/admin' : '/dashboard')
                : '/'
            } replace />
          } />
        </Routes>
        <InstallPrompt />
        <ReloadPrompt />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
