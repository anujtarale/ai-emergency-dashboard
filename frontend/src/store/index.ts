import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, type EmergencyReport } from '../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

type Alert = {
  id: string;
  type: 'disaster' | 'weather' | 'traffic' | 'security';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
};

type Notification = {
  id: string;
  type: 'incident' | 'report' | 'safety' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
};

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type AnalyticsData = {
  activeIncidents: number;
  resolvedIncidents: number;
  totalReports: number;
  avgResponseTime: number;
  incidentDistribution: {
    medical: number;
    fire: number;
    police: number;
    accident: number;
    natural: number;
    other: number;
  };
  weeklyTrend: number[];
};

type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
};

type CommunityReport = {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  type: string;
  image?: string;
  audio?: string;
  votes: number;
  hasVoted: boolean;
  verified: boolean;
  comments: Comment[];
  showComments: boolean;
  newComment: string;
  backendReport?: EmergencyReport;
};

interface AppState {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  user: User | null;
  theme: 'light' | 'dark';
  location: Location | null;
  alerts: Alert[];
  notifications: Notification[];
  communityReports: CommunityReport[];
  backendReports: EmergencyReport[];
  analytics: AnalyticsData;
  isLoading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setLocation: (location: Location) => void;
  addAlert: (alert: Alert) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  clearError: () => void;
  incrementAnalytics: (incidentType: string) => void;
  addCommunityReport: (report: CommunityReport) => Promise<void>;
  updateCommunityReport: (id: string, updates: Partial<CommunityReport>) => void;
  fetchReports: () => Promise<void>;
  features: Record<string, boolean>;
  fetchFeatures: () => Promise<void>;
  maintenanceMode: boolean;
  setMaintenanceMode: (mode: boolean) => void;
  fetchMaintenanceMode: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const initialState = {
        isAuthenticated: false,
        isAuthChecked: false,
        user: null,
        theme: 'light' as const,
        location: {
          lat: 23.0225,
          lng: 72.5714,
          address: 'Ahmedabad, Gujarat, India'
        },
        alerts: [],
        notifications: [
          {
            id: '1',
            type: 'incident' as const,
            title: 'New Incident Reported',
            message: 'A medical emergency has been reported near Maninagar',
            read: false,
            timestamp: new Date(Date.now() - 180000)
          },
          {
            id: '2',
            type: 'safety' as const,
            title: 'Safety Alert',
            message: 'Heavy traffic reported on SG Highway, avoid the area',
            read: false,
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: '3',
            type: 'system' as const,
            title: 'Welcome to EmergencyAI',
            message: 'Thanks for signing up! Explore our emergency features.',
            read: true,
            timestamp: new Date(Date.now() - 86400000)
          }
        ],
        communityReports: [
          {
            id: '1',
            type: 'accident',
            title: 'Car Accident on Main St',
            description: 'Minor collision, no injuries reported',
            image: '',
            location: 'Main St & 5th Ave',
            timestamp: new Date(Date.now() - 3600000),
            votes: 5 + Math.floor(Math.random() * 50),
            hasVoted: false,
            verified: Math.random() > 0.5,
            comments: [
              { id: Math.random().toString(), author: 'Neighbor123', text: 'Hope everyone is safe!', timestamp: new Date(Date.now() - Math.random() * 3600000) },
              { id: Math.random().toString(), author: 'LocalResident', text: 'Thanks for reporting!', timestamp: new Date(Date.now() - Math.random() * 3600000) },
            ],
            showComments: false,
            newComment: ''
          },
          {
            id: '2',
            type: 'fire',
            title: 'Small Fire in Park',
            description: 'Fire department on scene, under control',
            image: '',
            location: 'Central Park',
            timestamp: new Date(Date.now() - 7200000),
            votes: 5 + Math.floor(Math.random() * 50),
            hasVoted: false,
            verified: Math.random() > 0.5,
            comments: [
              { id: Math.random().toString(), author: 'Neighbor123', text: 'Hope everyone is safe!', timestamp: new Date(Date.now() - Math.random() * 3600000) },
              { id: Math.random().toString(), author: 'LocalResident', text: 'Thanks for reporting!', timestamp: new Date(Date.now() - Math.random() * 3600000) },
            ],
            showComments: false,
            newComment: ''
          },
        ],
        backendReports: [],
        analytics: {
          activeIncidents: 12,
          resolvedIncidents: 345,
          totalReports: 187,
          avgResponseTime: 2.4,
          incidentDistribution: {
            medical: 35,
            fire: 13,
            police: 17,
            accident: 23,
            natural: 12,
            other: 0
          },
          weeklyTrend: [5, 8, 3, 7, 12, 6, 9]
        },
        features: {
          'sos': true,
          'ai-assistant': true,
          'live-map': true,
          'nearby-services': true,
          'community-reports': true,
          'safety-alerts': true,
          'analytics': true
        } as Record<string, boolean>,
        isLoading: false,
        error: null,
        maintenanceMode: false,
      };

      return {
        ...initialState,

        login: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const result = await apiClient.login(data);
            if (result.accessToken) {
              localStorage.setItem('accessToken', result.accessToken);
            }
            set({
              isAuthenticated: true,
              user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                avatar: result.user.avatar,
                role: result.user.role,
              },
              isLoading: false,
            });
            await get().fetchFeatures();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            set({ error: errorMessage, isLoading: false });
          }
        },

        register: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const result = await apiClient.register(data);
            if (result.accessToken) {
              localStorage.setItem('accessToken', result.accessToken);
            }
            set({
              isAuthenticated: true,
              user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                avatar: result.user.avatar,
                role: result.user.role,
              },
              isLoading: false,
            });
            await get().fetchFeatures();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            set({ error: errorMessage, isLoading: false });
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null });
          try {
            await apiClient.logout();
            localStorage.removeItem('accessToken');
            set({ 
              isAuthenticated: false, 
              user: null, 
              isLoading: false,
              isAuthChecked: true 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            set({ error: errorMessage, isLoading: false });
          }
        },

        checkAuth: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await apiClient.getMe();
            set({
              isAuthenticated: true,
              user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                avatar: result.user.avatar,
                role: result.user.role,
              },
              isLoading: false,
              isAuthChecked: true
            });
            await get().fetchFeatures();
            await get().fetchReports();
            await get().fetchMaintenanceMode();
          } catch {
            localStorage.removeItem('accessToken');
            set({ 
              isAuthenticated: false, 
              user: null, 
              isLoading: false, 
              isAuthChecked: true 
            });
          }
        },

        setTheme: (theme) => set({ theme }),
        setLocation: (location) => set({ location }),
        addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
        addNotification: (notification) => set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        })),
        clearNotifications: () => set({ notifications: [] }),
        clearError: () => set({ error: null }),
        
        incrementAnalytics: (incidentType) => set((state) => {
          // Normalize incident type to match our analytics keys
          const normalizedType: keyof typeof state.analytics.incidentDistribution = 
            incidentType === 'suspicious' || incidentType === 'weather' || incidentType === 'other' 
              ? 'other' 
              : (incidentType as keyof typeof state.analytics.incidentDistribution);
          
          // Create a copy of the current state
          const newAnalytics = { ...state.analytics };
          
          // Increment relevant counters
          newAnalytics.activeIncidents += 1;
          newAnalytics.totalReports += 1;
          newAnalytics.incidentDistribution = {
            ...newAnalytics.incidentDistribution,
            [normalizedType]: (newAnalytics.incidentDistribution[normalizedType] || 0) + 1
          };
          
          // Update weekly trend - increment today's count (last element)
          const newWeeklyTrend = [...newAnalytics.weeklyTrend];
          newWeeklyTrend[newWeeklyTrend.length - 1] += 1;
          newAnalytics.weeklyTrend = newWeeklyTrend;
          
          return { analytics: newAnalytics };
        }),

        addCommunityReport: async (report) => {
          const state = get();
          const location = state.location;
          
          const normalizedType: keyof typeof state.analytics.incidentDistribution =
            report.type === 'suspicious' || report.type === 'weather' || report.type === 'other'
              ? 'other'
              : (report.type as keyof typeof state.analytics.incidentDistribution);
          
          const newAnalytics = {
            ...state.analytics,
            activeIncidents: state.analytics.activeIncidents + 1,
            totalReports: state.analytics.totalReports + 1,
            incidentDistribution: {
              ...state.analytics.incidentDistribution,
              [normalizedType]: (state.analytics.incidentDistribution[normalizedType] || 0) + 1
            },
            weeklyTrend: [
              ...state.analytics.weeklyTrend.slice(0, -1),
              state.analytics.weeklyTrend[state.analytics.weeklyTrend.length - 1] + 1
            ]
          };
          
          const newCommunityReports = [report, ...state.communityReports];
          set({
            communityReports: newCommunityReports,
            analytics: newAnalytics
          });
          
          try {
            if (location) {
              const result = await apiClient.createReport({
                type: report.type,
                title: report.title,
                description: report.description,
                latitude: location.lat,
                longitude: location.lng,
                address: report.location,
                severity: 'medium',
              });
              
              set((prev) => ({
                communityReports: prev.communityReports.map(r => 
                  r.id === report.id ? { ...r, backendReport: result.data, id: result.data._id } : r
                ),
                backendReports: [result.data, ...prev.backendReports]
              }));
            }
          } catch {
            // Backend save failed; local state preserved
          }
        },

        updateCommunityReport: (id, updates) => set((state) => ({
          communityReports: state.communityReports.map(r => r.id === id ? { ...r, ...updates } : r),
        })),

        fetchReports: async () => {
          try {
            const result = await apiClient.getAllReports();
            const state = get();
            
            // Map backend reports to community reports structure
            const mappedReports: CommunityReport[] = result.data.map((r: any) => ({
              id: r._id,
              title: r.title,
              description: r.description,
              location: r.address || 'Unknown location',
              timestamp: new Date(r.createdAt),
              type: r.type || 'other',
              image: r.images && r.images.length > 0 ? r.images[0] : '',
              votes: 1,
              hasVoted: false,
              verified: r.status === 'resolved',
              comments: [],
              showComments: false,
              newComment: '',
              backendReport: r
            }));

            // Merge backend reports with existing local reports, avoid duplicates by id
            const existingIds = new Set(state.communityReports.map(r => r.id));
            const newBackendReports = mappedReports.filter(r => !existingIds.has(r.id));
            const communityReports = [...newBackendReports, ...state.communityReports].sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            
            // Calculate analytics from all reports dynamically
            const activeReports = communityReports.filter(r => !r.verified);
            const resolvedReports = communityReports.filter(r => r.verified);
            
            const incidentDistribution = {
              medical: 0,
              fire: 0,
              police: 0,
              accident: 0,
              natural: 0,
              other: 0
            };
            
            const weeklyTrend = [0, 0, 0, 0, 0, 0, 0];
            
            communityReports.forEach(r => {
              const t = r.type === 'suspicious' || r.type === 'weather' || r.type === 'other' ? 'other' : r.type as keyof typeof incidentDistribution;
              if (incidentDistribution[t] !== undefined) {
                incidentDistribution[t]++;
              } else {
                incidentDistribution.other++;
              }
              
              const day = new Date(r.timestamp).getDay();
              const index = day === 0 ? 6 : day - 1; // Map Sunday (0) to index 6, Monday (1) to index 0, etc.
              weeklyTrend[index]++;
            });
            
            set({
              backendReports: result.data,
              communityReports,
              analytics: {
                activeIncidents: activeReports.length > 0 ? activeReports.length : 12,
                resolvedIncidents: resolvedReports.length > 0 ? resolvedReports.length : 345,
                totalReports: communityReports.length > 0 ? communityReports.length : 187,
                avgResponseTime: 2.4,
                incidentDistribution: communityReports.length > 0 ? incidentDistribution : {
                  medical: 35,
                  fire: 13,
                  police: 17,
                  accident: 23,
                  natural: 12,
                  other: 0
                },
                weeklyTrend: communityReports.length > 0 ? weeklyTrend : [5, 8, 3, 7, 12, 6, 9]
              }
            });
            } catch {
          }
        },

        fetchFeatures: async () => {
          try {
            const result = await apiClient.getFeatures();
            const mappedFeatures: Record<string, boolean> = {};
            result.data.forEach((f: any) => {
              mappedFeatures[f.name] = f.isEnabled;
            });
            set({ features: mappedFeatures });
          } catch {
          }
        },

        setMaintenanceMode: (mode) => set({ maintenanceMode: mode }),

        fetchMaintenanceMode: async () => {
          try {
            const result = await apiClient.getSystemSettings();
            set({ maintenanceMode: result.maintenanceMode });
          } catch (err) {
            console.warn('[Maintenance] Fetch failed:', err);
          }
        }
      };
    },
    {
      name: 'emergency-assistant-storage',
      partialize: (state) => ({
        theme: state.theme,
        location: state.location,
        alerts: state.alerts,
        notifications: state.notifications,
        communityReports: state.communityReports,
        analytics: state.analytics,
        features: state.features
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.location) {
            state.location = {
              lat: 23.0225,
              lng: 72.5714,
              address: 'Ahmedabad, Gujarat, India'
            };
          }
          if (!state.features) {
            state.features = {
              'sos': true,
              'ai-assistant': true,
              'live-map': true,
              'nearby-services': true,
              'community-reports': true,
              'safety-alerts': true,
              'analytics': true
            };
          }
          // Convert ISO strings back to Date objects
          state.alerts = state.alerts.map((alert: any) => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
          }));
          state.notifications = state.notifications.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp)
          }));
          state.communityReports = state.communityReports.map((report: any) => ({
            ...report,
            timestamp: new Date(report.timestamp),
            comments: report.comments.map((comment: any) => ({
              ...comment,
              timestamp: new Date(comment.timestamp)
            }))
          }));
        }
      }
    }
  )
);
