import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiFileText, FiTarget, FiBarChart2, FiMap, FiMic, FiMessageSquare, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';

const quickActions = [
  {
    title: 'Upload CV',
    desc: 'Get AI Analysis',
    icon: FiFileText,
    path: '/cv-analyzer',
    color: 'from-blue-500 to-cyan-500',
    stats: 'Analyze your CV',
  },
  {
    title: 'Match Jobs',
    desc: 'Find Your Fit',
    icon: FiTarget,
    path: '/job-matching',
    color: 'from-purple-500 to-pink-500',
    stats: 'Compare with jobs',
  },
  {
    title: 'Skill Gap',
    desc: 'Identify Needs',
    icon: FiBarChart2,
    path: '/skill-gap',
    color: 'from-orange-500 to-red-500',
    stats: 'Discover gaps',
  },
  {
    title: 'Learning Path',
    desc: 'Plan Growth',
    icon: FiMap,
    path: '/learning-roadmap',
    color: 'from-green-500 to-teal-500',
    stats: 'Get roadmap',
  },
  {
    title: 'AI Interview',
    desc: 'Practice Now',
    icon: FiMic,
    path: '/interview',
    color: 'from-pink-500 to-rose-500',
    stats: 'Simulate interview',
  },
  {
    title: 'Career Chat',
    desc: 'Ask AI',
    icon: FiMessageSquare,
    path: '/chat',
    color: 'from-indigo-500 to-purple-500',
    stats: 'Get advice',
  },
];

const tips = [
  { icon: FiZap, text: 'Upload your CV first to get personalized recommendations' },
  { icon: FiTarget, text: 'Use Job Matching to see how you stack up against real roles' },
  { icon: FiTrendingUp, text: 'Check Skill Gap analysis to plan your learning journey' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-8">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-purple-100 text-lg max-w-2xl">
            Your AI career mentor is ready. Upload your CV, explore job matches, and accelerate your career journey.
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CV Analysis', value: 'Ready', icon: FiFileText, color: 'from-blue-500/20 to-cyan-500/20' },
          { label: 'Job Matches', value: 'Available', icon: FiTarget, color: 'from-purple-500/20 to-pink-500/20' },
          { label: 'Skill Gaps', value: 'Detectable', icon: FiBarChart2, color: 'from-orange-500/20 to-red-500/20' },
          { label: 'Interviews', value: 'Practice', icon: FiMic, color: 'from-pink-500/20 to-rose-500/20' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group relative p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all hover:transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                  {action.stats}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-400">{action.desc}</p>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <FiAward className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Tips to Get Started</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
              <tip.icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;