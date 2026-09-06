import { useState } from 'react';
import { skillsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { FiBookOpen, FiTarget, FiZap, FiTrendingUp, FiCalendar, FiClock, FiAlertCircle, FiStar } from 'react-icons/fi';

const LearningRoadmap = () => {
  const [careerGoal, setCareerGoal] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!careerGoal || !currentSkills || !targetRole) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    setRoadmap(null);

    const skills = currentSkills.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await skillsAPI.generateRoadmap(careerGoal, skills, targetRole);
      setRoadmap(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <FiBookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Learning Roadmap</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Generate a personalized learning plan based on your career goals and current skills.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl mb-6">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-purple-400" />
              Your Goals
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Career Goal
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Become a Senior Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Full Stack Developer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Try: Frontend Developer, Backend Developer, Full Stack Developer
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Skills <span className="text-gray-500">(comma separated)</span>
                </label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  className="input-field h-32 resize-none"
                  placeholder="e.g., HTML, CSS, JavaScript"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Generating Your Roadmap...
                  </>
                ) : (
                  'Generate Roadmap'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div>
          {!roadmap ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <FiBookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Roadmap Yet
              </h3>
              <p className="text-gray-400">
                Fill in your goals and skills to generate a personalized learning roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {roadmap.targetRole} Roadmap
                </h2>
                <p className="text-sm text-gray-400 mb-3">{roadmap.summary}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    Total Duration: {roadmap.totalDuration}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    Weekly: {roadmap.weeklyHours}
                  </span>
                </div>
                {roadmap.currentSkills?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Starting skills: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {roadmap.currentSkills.map((skill, i) => (
                        <span key={i} className="badge-primary text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Roadmap Timeline */}
              {roadmap.roadmap?.map((phase, index) => (
                <div key={index} className="card border-l-4 border-purple-500/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 
                                     flex items-center justify-center text-sm font-bold border border-purple-500/20">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-white">{phase.phase}</h3>
                      </div>
                      <p className="text-sm text-purple-400 font-medium mt-1">
                        {phase.duration}
                      </p>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-200 mb-2">{phase.title}</h4>

                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FiZap className="w-3 h-3" />
                      Topics to Cover
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(phase.topics || []).map((topic, j) => (
                        <span key={j} className="badge-primary text-xs">{topic}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <FiStar className="w-3 h-3" />
                      Deliverable
                    </h5>
                    <p className="text-sm text-gray-400">{phase.deliverables}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LearningRoadmap;