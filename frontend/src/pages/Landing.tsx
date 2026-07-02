import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  MessageSquare,
  MapPin,
  PhoneCall,
  Users,
  Bell,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';

const features = [
  {
    icon: ShieldAlert,
    title: 'Emergency SOS',
    description: 'One-tap emergency activation with immediate location sharing and 3-second abort window.',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Get instant emergency guidance from our AI-powered chatbot available 24/7.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    icon: MapPin,
    title: 'Live Map',
    description: 'Real-time interactive map with pinned emergency services, route planning, and geolocation.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  },
  {
    icon: PhoneCall,
    title: 'Nearby Services',
    description: 'Find closest hospitals, police stations, fire brigades and shelters in seconds.',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    icon: Users,
    title: 'Community Reports',
    description: 'Report and browse real-time incidents in your neighborhood with photo evidence.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
  },
  {
    icon: Bell,
    title: 'Safety Alerts',
    description: 'Stay ahead with real-time flood, fire, weather, and road safety alerts.',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
];

const stats = [
  { number: '50K+', label: 'Active Users', icon: Users },
  { number: '10K+', label: 'Emergencies Handled', icon: ShieldAlert },
  { number: '500+', label: 'Partnered Services', icon: PhoneCall },
  { number: '24/7', label: 'AI Support', icon: Clock },
];

const trustBadges = [
  { icon: Zap, label: 'Instant Response' },
  { icon: Shield, label: 'Secure & Private' },
  { icon: Clock, label: '24/7 Available' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Hero ── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background blob */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-br from-red-500/20 via-orange-400/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-blue-500/10 to-transparent blur-2xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live Emergency Platform — Active Now
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          >
            Your Personal{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Emergency
            </span>
            <br />
            Assistant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered emergency response, real-time maps, and instant access to help — exactly when you need it most.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 text-base font-bold rounded-xl shadow-lg shadow-red-500/30 gap-2 transition-all duration-200 hover:shadow-red-500/50"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Sign in to your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <badge.icon className="h-4 w-4 text-red-400" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 mb-3">
                  <stat.icon className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{stat.number}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Comprehensive Emergency Features
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to stay safe — from the first alert to the last step of recovery.
              </p>
            </motion.div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
                className={`group relative p-6 rounded-2xl border ${feature.border} ${feature.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-5 shadow-md`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-red-600 via-red-700 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/10 blur-2xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Ready to Stay Safe?
            </h2>
            <p className="mt-4 text-lg text-red-100">
              Join thousands of users who trust Emergency AI for their personal safety.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-red-700 hover:bg-red-50 font-bold px-8 py-4 text-base rounded-xl shadow-lg gap-2 transition-all duration-200"
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-4 text-base rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
