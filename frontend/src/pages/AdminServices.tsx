import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  PhoneCall, MapPin, Plus, Trash2, Edit2, Loader2,
  HeartPulse, ShieldAlert, Flame, Pill, Home, Search, RefreshCw
} from 'lucide-react';
import { apiClient, type EmergencyService } from '../lib/api';
import toast from 'react-hot-toast';

const serviceIcons = {
  hospital: HeartPulse,
  police: ShieldAlert,
  fire: Flame,
  pharmacy: Pill,
  shelter: Home
};

const serviceColors = {
  hospital: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  police: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  fire: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  pharmacy: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  shelter: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
};

const AdminServices = () => {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'hospital' | 'police' | 'fire' | 'pharmacy' | 'shelter'>('hospital');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('23.0225');
  const [lng, setLng] = useState('72.5714');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.adminGetServices();
      setServices(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load emergency services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setName('');
    setType('hospital');
    setPhone('');
    setAddress('');
    setLat('23.0225');
    setLng('72.5714');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (service: EmergencyService) => {
    setEditingId(service._id);
    setName(service.name);
    setType(service.type);
    setPhone(service.phone);
    setAddress(service.address);
    setLat(service.location.coordinates[1].toString());
    setLng(service.location.coordinates[0].toString());
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !lat || !lng) {
      toast.error('All fields are required');
      return;
    }

    const coordinates: [number, number] = [parseFloat(lng), parseFloat(lat)];
    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      toast.error('Latitude and Longitude must be valid numbers');
      return;
    }

    const payload = {
      name,
      type,
      phone,
      address,
      location: {
        type: 'Point' as const,
        coordinates
      }
    };

    try {
      if (editingId) {
        await apiClient.adminUpdateService(editingId, payload);
        toast.success('Service updated successfully');
      } else {
        await apiClient.adminCreateService(payload);
        toast.success('Service created successfully');
      }
      resetForm();
      fetchServices();
    } catch (e: any) {
      toast.error(e.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this emergency service?')) return;
    try {
      await apiClient.adminDeleteService(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || service.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Emergency Services Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure physical emergency dispatcher bases and service centers.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {isFormOpen ? 'Close Form' : 'Add Emergency Service'}
        </Button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Emergency Service' : 'Add New Emergency Service'}</CardTitle>
              <CardDescription>Enter details of the responder headquarters or hospital.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Central Municipal Hospital" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full flex h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="hospital">Hospital / Medical</option>
                    <option value="police">Police Station</option>
                    <option value="fire">Fire Department</option>
                    <option value="pharmacy">24/7 Pharmacy</option>
                    <option value="shelter">Crisis Shelter</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hotline Number</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 99999 88888" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Physical Address</label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Emergency Way, Ring Road" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input value={lat} onChange={e => setLat(e.target.value)} placeholder="23.0225" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input value={lng} onChange={e => setLng(e.target.value)} placeholder="72.5714" required />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Save Changes' : 'Create Service'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'hospital', 'police', 'fire', 'pharmacy', 'shelter'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filterType === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
          <Button variant="ghost" size="icon" onClick={fetchServices} title="Reload services">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : (
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Address</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Coordinates</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredServices.map(service => {
                  const Icon = serviceIcons[service.type] || HeartPulse;
                  const colorClass = serviceColors[service.type] || '';
                  return (
                    <tr key={service._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{service.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{service.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-mono text-xs">
                        <span className="flex items-center gap-1.5">
                          <PhoneCall className="h-3 w-3 text-gray-400" />
                          {service.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{service.address}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {service.location?.coordinates[1]?.toFixed(4)}, {service.location?.coordinates[0]?.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-700">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No emergency services found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminServices;
