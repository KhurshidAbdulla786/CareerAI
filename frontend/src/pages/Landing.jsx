import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiTarget, FiBarChart2, FiMap, FiMessageSquare, FiMic, FiUpload, FiCpu } from 'react-icons/fi';

const features = [
  {
    icon: FiFileText,
    title: 'CV Analyzer',
    desc: 'Upload your CV and get AI-powered analysis with scoring, strengths, weaknesses, and ATS compatibility feedback.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FiTarget,
    title: 'Job Matching',
    desc: 'Paste any job description and instantly see how your skills match with detailed gap analysis.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: FiBarChart2,
    title: 'Skill Gap Analysis',
    desc: 'Identify missing skills and get prioritized learning areas tailored to your career goals.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: FiMap,
    title: 'Learning Roadmaps',
    desc: 'Generate personalized month-by-month learning plans to reach your target role.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: FiMessageSquare,
    title: 'AI Career Chat',
    desc: 'Chat with an AI assistant that knows your profile and provides personalized career advice.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FiMic,
    title: 'Interview Simulator',
    desc: 'Practice with AI-generated questions, get your answers evaluated with detailed feedback.',
    color: 'from-pink-500 to-rose-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />
        </div>

        {/* Navbar for Landing */}
        <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">CareerAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-purple-500/25"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-6 inline-block">
                ✨ AI-Powered Career Assistant
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
            >
              Your AI Career Mentor
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                & CV Analyzer
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Upload your CV, analyze your skills, match with dream jobs, identify gaps,
              get personalized learning roadmaps, and ace your interviews — all powered by AI.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
              >
                Start Your Career Journey →
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-lg font-semibold text-gray-300 bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto"
            >
              {[
                { label: 'CV Analysis', value: 'AI-Powered' },
                { label: 'Job Matching', value: 'Smart' },
                { label: 'Skill Gaps', value: 'Identified' },
                { label: 'Roadmaps', value: 'Personalized' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-4"
          >
            Everything You Need to
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              {' '}Level Up Your Career
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Six powerful AI tools designed to help fresh graduates land their dream jobs
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              custom={index}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all hover:transform hover:scale-[1.02]"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-5 flex items-center justify-center`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-400"
          >
            Three simple steps to accelerate your career
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-12 relative"
        >
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transform -translate-y-1/2" />

          {[
            {
              step: '01',
              title: 'Upload Your CV',
              desc: 'Upload your PDF CV and our AI extracts all your skills, experience, and education automatically.',
              icon: FiUpload,
            },
            {
              step: '02',
              title: 'Get AI Analysis',
              desc: 'Receive detailed analysis including CV score, skill gaps, job matches, and personalized recommendations.',
              icon: FiCpu,
            },
            {
              step: '03',
              title: 'Level Up & Succeed',
              desc: 'Follow your personalized learning roadmap, practice interviews, and land your dream job.',
              icon: FiTarget,
            },
          ].map((step) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="relative text-center bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-bold text-purple-400 mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-12 text-center"
        >
          <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
          <div className="relative z-10">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-white mb-4"
            >
              Ready to Accelerate Your Career?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-purple-100 mb-8"
            >
              Join thousands of graduates who landed their dream jobs with CareerAI
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link
                to="/register"
                className="inline-block px-10 py-4 text-lg font-semibold text-purple-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Create Free Account →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-white">CareerAI</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with ❤️ for fresh graduates. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;