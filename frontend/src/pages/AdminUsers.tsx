import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, RefreshCw, Search, Shield, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  loginAttempts: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.adminGetUsers();
      setUsers(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingRole(userId);
    try {
      await apiClient.adminUpdateUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View, search, and manage user roles. Total: <strong>{users.length}</strong> registered users.
          </p>
        </div>
        <Button onClick={loadUsers} size="sm" className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-700 py-3 px-5">
          <CardTitle className="text-base">All Registered Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                  <tr>
                    {['Name', 'Email', 'Role', 'Email Verified', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((user, idx) => (
                    <motion.tr key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          user.isEmailVerified
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {user.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                          onClick={() => handleRoleChange(user._id, user.role)}
                          disabled={updatingRole === user._id}
                          className="text-xs"
                        >
                          {updatingRole === user._id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'
                          }
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
