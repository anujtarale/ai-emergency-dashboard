import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Clock, Image as ImageIcon, Mic, Square, ShieldAlert, Sparkles, X, Volume2, MessageSquare, ThumbsUp, Send, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';

const incidentTypes = [
  { value: 'medical', label: 'Medical Emergency', icon: '🏥', bg: 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
  { value: 'fire', label: 'Fire Emergency', icon: '🔥', bg: 'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { value: 'accident', label: 'Accident', icon: '🚗', bg: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  { value: 'weather', label: 'Weather Issue', icon: '🌪️', bg: 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { value: 'other', label: 'Other', icon: '📍', bg: 'bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
];

const getRelativeTime = (ts: Date): string => {
  const diffMs = Date.now() - ts.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const CommunityReports = () => {
  const { communityReports, addNotification, addCommunityReport, updateCommunityReport } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showForm]);

  const handleUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !incidentType) {
      alert('Please fill out all fields');
      return;
    }

    const newReport = {
      id: Math.random().toString(),
      title,
      description,
      location,
      timestamp: new Date(),
      type: incidentType,
      image: image || undefined,
      audio: audio || undefined,
      votes: 1,
      hasVoted: true,
      verified: false,
      comments: [],
      showComments: false,
      newComment: ''
    };

    // Show toast notification FIRST!
    toast.success(
      'Your incident report has been shared with the community.',
      {
        duration: 5000,
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0'
        }
      }
    );

    // Add notification and report right away!
    addNotification({
      id: Date.now().toString(),
      type: 'report',
      title: 'New Community Report',
      message: `A new incident report: "${title}" has been submitted in ${location}`,
      read: false,
      timestamp: new Date()
    });

    addCommunityReport(newReport);
    
    setShowForm(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setIncidentType('');
    setImage(null);
    setAudio(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVote = (id: string) => {
    const report = communityReports.find(r => r.id === id);
    if (report) {
      updateCommunityReport(id, {
        votes: report.hasVoted ? report.votes - 1 : report.votes + 1,
        hasVoted: !report.hasVoted
      });
    }
  };

  const toggleComments = (id: string) => {
    const report = communityReports.find(r => r.id === id);
    if (report) {
      updateCommunityReport(id, {
        showComments: !report.showComments
      });
    }
  };

  const handleCommentChange = (id: string, text: string) => {
    updateCommunityReport(id, {
      newComment: text
    });
  };

  const submitComment = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const report = communityReports.find(r => r.id === id);
    if (report && report.newComment.trim()) {
      const newComment = {
        id: Math.random().toString(),
        author: 'You',
        text: report.newComment,
        timestamp: new Date()
      };
      updateCommunityReport(id, {
        comments: [...report.comments, newComment],
        newComment: ''
      });
    }
  };

  const getTypeConfig = (type: string) => {
    return incidentTypes.find(t => t.value === type) || incidentTypes[4];
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            Community Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Help neighbors stay alert by sharing real-time local hazards
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {showForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Report Incident
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800/40 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  Report an Incident
                </CardTitle>
                <CardDescription className="text-xs">
                  Fill in details below to inform nearby community members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Incident Type
                      </label>
                      <select
                        value={incidentType}
                        onChange={(e) => setIncidentType(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        required
                      >
                        <option value="">Select type...</option>
                        {incidentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Incident Title
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Tree blocked on route 2"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Detailed Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Give a precise description..."
                      rows={3}
                      className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Near Star Bazaar, Nikol"
                      className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col items-center justify-center min-h-[120px]">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {!image ? (
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                          <span className="text-xs font-medium">Attach Photo Evidence</span>
                        </button>
                      ) : (
                        <div className="relative w-full max-h-36 overflow-hidden rounded-lg">
                          <img src={image} alt="Preview" className="w-full h-auto object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col items-center justify-center min-h-[120px]">
                      {!audio ? (
                        <div className="flex flex-col items-center gap-2">
                          {isRecording ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="flex flex-col items-center gap-1 text-red-500 animate-pulse"
                            >
                              <Square className="h-6 w-6 fill-red-500" />
                              <span className="text-xs font-bold">Stop Recording...</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Mic className="h-6 w-6 text-gray-400" />
                              <span className="text-xs font-medium">Record Voice Note</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <audio src={audio} controls className="w-full h-8" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setAudio(null)}
                            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white py-5">
                      Submit Incident Report
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 rounded-xl py-5"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Active Community Feeds
          </p>
          <span className="text-xs text-blue-500 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Live Updates
          </span>
        </div>

        <AnimatePresence initial={false}>
          {communityReports.map((report, idx) => {
            const cfg = getTypeConfig(report.type);
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800">
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl shrink-0">{cfg.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">
                              {report.title}
                            </h3>
                            {report.verified && (
                              <span className="flex items-center text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                            )}
                            {!report.verified && (
                              <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                                <AlertCircle className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} uppercase tracking-wider`}>
                          {report.type}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(report.timestamp)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {report.description}
                    </p>

                    {(report.image || report.audio) && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {report.image && (
                          <div className="max-w-xs max-h-48 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                            <img
                              src={report.image}
                              alt="Incident Evidence"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {report.audio && (
                          <div className="w-full max-w-sm flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700">
                            <Volume2 className="h-4 w-4 text-blue-500 shrink-0" />
                            <audio src={report.audio} controls className="w-full h-7" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-gray-700 mt-3">
                      <button
                        onClick={() => toggleVote(report.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          report.hasVoted ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                        } hover:text-blue-600 dark:hover:text-blue-400`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${report.hasVoted ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                        {report.votes}
                      </button>
                      <button
                        onClick={() => toggleComments(report.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {report.comments.length} Comments
                      </button>
                    </div>

                    <AnimatePresence>
                      {report.showComments && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                            {report.comments.map(comment => (
                              <div key={comment.id} className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                      {comment.author}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {getRelativeTime(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <form
                              onSubmit={(e) => submitComment(e, report.id)}
                              className="flex items-center gap-2 mt-2"
                            >
                              <Input
                                value={report.newComment}
                                onChange={(e) => handleCommentChange(report.id, e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 text-xs rounded-xl border-gray-200 dark:border-gray-700"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityReports;
