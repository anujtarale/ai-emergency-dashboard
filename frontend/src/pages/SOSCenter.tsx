import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';

type IncidentType = 'medical' | 'fire' | 'police' | 'accident' | 'natural' | 'suspicious';

const emergencyTypes: {
  value: IncidentType;
  label: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}[] = [
  { value: 'medical', label: 'Medical Emergency', icon: '🏥', severity: 'critical' },
  { value: 'fire', label: 'Fire Emergency', icon: '🔥', severity: 'critical' },
  { value: 'police', label: 'Police Emergency', icon: '🚔', severity: 'high' },
  { value: 'accident', label: 'Traffic Accident', icon: '🚗', severity: 'high' },
  { value: 'natural', label: 'Natural Disaster', icon: '🌪️', severity: 'critical' },
  { value: 'suspicious', label: 'Suspicious Activity', icon: '🕵️', severity: 'medium' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-600';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const SOSCenter = () => {
  const [isActive, setIsActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emergencyType, setEmergencyType] = useState<IncidentType>('medical');
  const [countdown, setCountdown] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const isActivatingRef = useRef(false); // Prevent duplicate calls
  const timerRef = useRef<any>(null); // Hold timer ID
  const { location, addNotification, addCommunityReport } = useAppStore();

  const selectedType = emergencyTypes.find(t => t.value === emergencyType);

  useEffect(() => {
    if (!showModal) return;
    setCountdown(5); // Reset countdown when modal opens

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (!isActivatingRef.current) {
            if (timerRef.current) clearInterval(timerRef.current);
            activateSOS();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showModal]);

  const activateSOS = async () => {
    if (isActivatingRef.current) return;
    isActivatingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    setShowModal(false);

    if (!location) {
      toast.error('Location not available. Please enable GPS and try again.');
      isActivatingRef.current = false;
      return;
    }

    try {
      await apiClient.createSOS({
        latitude: location.lat,
        longitude: location.lng,
        address: location.address || 'Ahmedabad, Gujarat, India',
        emergencyType,
        description: `SOS activated: ${selectedType?.label}`
      });

      setIsActive(true);
      setShowSuccess(true);

      toast(
        `Your ${selectedType?.label} emergency has been reported. Help is on the way!`,
        {
          duration: 8000,
          icon: '⚠️',
          style: {
            borderRadius: '12px',
            background: '#fff7ed',
            color: '#9a3412',
            border: '1px solid #fed7aa'
          }
        }
      );

      const reportId = Math.random().toString();
      addCommunityReport({
        id: reportId,
        title: `${selectedType?.label} Emergency`,
        description: `An emergency has been reported. Help is on the way!`,
        location: location?.address || 'Unknown location',
        timestamp: new Date(),
        type: emergencyType,
        votes: 1,
        hasVoted: true,
        verified: false,
        comments: [],
        showComments: false,
        newComment: ''
      });

      addNotification({
        id: Date.now().toString(),
        type: 'incident' as const,
        title: 'SOS Activated!',
        message: `Your ${selectedType?.label} has been reported. Services are on the way!`,
        read: false,
        timestamp: new Date()
      });

      setTimeout(() => {
        setShowSuccess(false);
        setIsActive(false);
        isActivatingRef.current = false;
      }, 5000);

    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Unknown error';
      console.error('SOS activation failed:', {
        message: errorMessage,
        response: err?.response,
        stack: err?.stack
      });

      let displayError = 'Failed to save SOS. ';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        displayError += 'You are not authenticated. Please login again.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        displayError += 'You do not have permission. Check your role.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        displayError += 'Network error. Is the backend server running?';
      } else if (errorMessage.includes('validation')) {
        displayError += `Validation error: ${errorMessage}`;
      } else {
        displayError += 'Please retry or check backend logs.';
      }

      toast.error(displayError);
      isActivatingRef.current = false;
    }
  };

  const cancelSOS = () => {
    setShowModal(false);
    setCountdown(5);
  };

  const openSOSModal = () => {
    setShowModal(true);
    setCountdown(5);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Emergency SOS Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay calm and follow the instructions below</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center w-full border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Activate SOS</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Press the button in case of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-4 flex flex-col items-center justify-center">
                  {showSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4 w-full"
                    >
                      <div className="flex items-center justify-center">
                        <CheckCircle2 className="h-24 w-24 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Report Successfully Submitted!</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Emergency services have been notified and will reach you shortly!
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Incident Type: {selectedType?.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Location: {location?.address || 'Ahmedabad, Gujarat, India'}
                      </p>
                      <Button variant="secondary" onClick={() => { setShowSuccess(false); setIsActive(false); }}>
                        OK
                      </Button>
                    </motion.div>
                  ) : !isActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openSOSModal}
                      className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl sm:text-2xl shadow-lg flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center">
                        <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 mb-1 sm:mb-2" />
                        SOS
                      </div>
                    </motion.button>
                  ) : (
                    <div className="space-y-4 w-full">
                      <div className="flex items-center justify-center">
                        <CheckCircle2 className="h-24 w-24 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">SOS Activated!</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Emergency services have been notified (SIMULATED).
                      </p>
                      <Button variant="secondary" onClick={() => { setIsActive(false); }}>
                        Cancel SOS
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Select Emergency Type</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Choose the type of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setEmergencyType(type.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        emergencyType === type.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl shrink-0">{type.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex-1 min-w-0 truncate">{type.label}</span>
                        <span className={`shrink-0 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full text-white ${getSeverityColor(type.severity)}`}>
                          {type.severity.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fullscreen SOS Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-2 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
              >
                <Card className="bg-gray-900 border-red-600">
                  <CardHeader>
                     <CardTitle className="text-xl sm:text-3xl font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <AlertTriangle className="h-6 w-6 sm:h-10 sm:w-10 text-red-500" />
                        Emergency Detected
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={cancelSOS}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-6 w-6" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Countdown */}
                    <div className="text-center">
                      <div className="text-6xl sm:text-8xl font-bold text-red-500 mb-2">{countdown}</div>
                      <p className="text-gray-400 text-lg">Auto-activating SOS in {countdown} seconds...</p>
                    </div>

                    {/* Incident Details */}
                    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-400">Incident Type</span>
                        <span className="text-white font-medium flex items-center gap-2 text-sm sm:text-base">
                          {selectedType?.icon} {selectedType?.label}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-400">Severity Level</span>
                        <span className={`font-bold px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm ${getSeverityColor(selectedType?.severity || 'medium')}`}>
                          {selectedType?.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-400">Location</span>
                        <span className="text-white font-medium text-sm sm:text-base">{location?.address || 'Ahmedabad, Gujarat, India'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        variant="destructive"
                        className="h-12 sm:h-16 text-sm sm:text-lg bg-red-600 hover:bg-red-700"
                        onClick={activateSOS}
                      >
                        <ShieldAlert className="mr-2 h-6 w-6" />
                        Send SOS Now
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-12 sm:h-16 text-sm sm:text-lg bg-gray-700 hover:bg-gray-600"
                        onClick={cancelSOS}
                      >
                        <XCircle className="mr-2 h-6 w-6" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SOSCenter;
