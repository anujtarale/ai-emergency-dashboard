import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Users, Bell, Moon, Sun, Plus, PhoneCall, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

const ProfileSettings = () => {
  const { user, theme, setTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    relation: '',
    phone: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'contacts', label: 'Emergency Contacts', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme', icon: theme === 'dark' ? Moon : Sun },
  ];

  const fetchContacts = () => {
    apiClient.getContacts()
      .then(result => {
        if (result.success) {
          setContacts(result.data.map((c: any) => ({
            id: c._id,
            name: c.name,
            relation: c.relation || '',
            phone: c.phone
          })));
        }
      })
      .catch(() => toast.error('Failed to load contacts'));
  };

  useEffect(() => {
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab]);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      const result = await apiClient.addContact(newContact);
      if (result.success) {
        const created = result.data;
        setContacts([...contacts, { id: created._id, name: created.name, relation: created.relation || '', phone: created.phone }]);
        toast.success('Contact added successfully');
        setNewContact({ name: '', relation: '', phone: '' });
        setIsAddingContact(false);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add contact');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    setNewContact({ name: contact.name, relation: contact.relation, phone: contact.phone });
  };

  const handleSaveEdit = async () => {
    if (!editingContactId || !newContact.name || !newContact.phone) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      const result = await apiClient.updateContact(editingContactId, newContact);
      if (result.success) {
        const updated = result.data;
        setContacts(contacts.map(c => c.id === editingContactId ? { id: updated._id, name: updated.name, relation: updated.relation || '', phone: updated.phone } : c));
        toast.success('Contact updated successfully');
        setEditingContactId(null);
        setNewContact({ name: '', relation: '', phone: '' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await apiClient.deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Profile Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <Input value={user?.name || ''} className="bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <Input value={user?.email || ''} className="bg-white dark:bg-gray-800" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Emergency Contacts</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">People to notify in case of emergency</CardDescription>
              </div>
              <Button onClick={() => setIsAddingContact(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingContact && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">Add New Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <Input
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Enter name"
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Relation</label>
                      <Input
                        value={newContact.relation}
                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        placeholder="e.g. Spouse, Parent"
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <Input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddContact}>Save</Button>
                      <Button variant="secondary" onClick={() => { setIsAddingContact(false); setNewContact({ name: '', relation: '', phone: '' }); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {editingContactId === contact.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Relation</label>
                        <Input
                          value={newContact.relation}
                          onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          className="bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit}>Save</Button>
                        <Button variant="secondary" onClick={() => { setEditingContactId(null); setNewContact({ name: '', relation: '', phone: '' }); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.relation}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <PhoneCall className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEditContact(contact)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Notification Settings</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Choose what alerts you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Emergency Alerts', desc: 'Get notified about nearby emergencies' },
              { label: 'Weather Warnings', desc: 'Severe weather alerts for your area' },
              { label: 'Community Reports', desc: 'Updates from your neighborhood' },
              { label: 'Safety Tips', desc: 'Useful safety information and tips' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'theme' && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Theme Settings</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Choose your preferred appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <Sun className="h-8 w-8 mx-auto mb-2 text-gray-900 dark:text-white" />
                <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <Moon className="h-8 w-8 mx-auto mb-2 text-gray-900 dark:text-white" />
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSettings;
