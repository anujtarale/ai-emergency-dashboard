import { useAppStore } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertTriangle, Users, Activity, TrendingDown } from 'lucide-react';

const getBarColor = (type: string) => {
  switch (type) {
    case 'medical': return 'bg-red-500';
    case 'fire': return 'bg-orange-500';
    case 'police': return 'bg-blue-500';
    case 'accident': return 'bg-yellow-500';
    case 'natural': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const Analytics = () => {
  const { analytics } = useAppStore();
  
  // Calculate total incidents for percentage
  const totalIncidents = Object.values(analytics.incidentDistribution).reduce((a, b) => a + b, 0);
  
  // Prepare incident types data
  const incidentTypes = [
    { type: 'Medical', key: 'medical' as const, count: analytics.incidentDistribution.medical },
    { type: 'Fire', key: 'fire' as const, count: analytics.incidentDistribution.fire },
    { type: 'Police', key: 'police' as const, count: analytics.incidentDistribution.police },
    { type: 'Accident', key: 'accident' as const, count: analytics.incidentDistribution.accident },
    { type: 'Natural', key: 'natural' as const, count: analytics.incidentDistribution.natural }
  ].filter(item => item.count > 0); // Only show types with incidents
  
  // Prepare weekly trend with days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyTrend = analytics.weeklyTrend.map((count, index) => ({
    day: days[index],
    count
  }));
  
  // Find max count for weekly trend height
  const maxWeeklyCount = Math.max(...analytics.weeklyTrend, 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeIncidents}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Incidents</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.resolvedIncidents}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Reports</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalReports}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgResponseTime} min</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">-15% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Types */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Incident Distribution</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Types of emergencies reported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidentTypes.map((incident, index) => {
                  const percentage = Math.round((incident.count / totalIncidents) * 100);
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{incident.type}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getBarColor(incident.key)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Weekly Trend</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Incidents per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {weeklyTrend.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                    <div
                      className="w-full bg-blue-600 rounded-t-lg"
                      style={{ height: `${(day.count / maxWeeklyCount) * 100}%`, minHeight: '8px' }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
