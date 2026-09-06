import { useState } from 'react';
import { skillsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiAlertCircle, FiTarget, FiStar, FiBookOpen, FiTrendingUp, FiZap } from 'react-icons/fi';

const SkillGap = () => {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!targetRole || !currentSkills) {
      setError('Please provide both target role and current skills');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const skills = currentSkills.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await skillsAPI.analyzeGap(targetRole, skills);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze skill gap');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400 border-green-400';
    if (score >= 50) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <FiBarChart2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Skill Gap Analysis</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Identify missing skills for your target role and prioritize your learning.
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
              Your Details
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
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
                  Try: Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, DevOps Engineer
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
                  placeholder="e.g., React, Node.js, MongoDB, JavaScript"
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
                    Analyzing...
                  </>
                ) : (
                  'Analyze Skill Gap'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <FiBarChart2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Analysis Yet
              </h3>
              <p className="text-gray-400">
                Enter your target role and current skills to analyze gaps.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{result.targetRole}</h2>
                    <p className="text-sm text-gray-400 mt-1">{result.summary}</p>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 bg-white/5 ${getScoreColor(result.matchPercentage)}`}>
                      <span className={`text-xl font-bold ${getScoreColor(result.matchPercentage).split(' ')[0]}`}>
                        {result.matchPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Match</p>
                  </div>
                </div>

                {/* Skills Comparison */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      Current Skills ({result.currentSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.currentSkills || []).map((skill, i) => (
                        <span key={i} className="badge-success">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4 text-purple-400" />
                      Required Skills ({result.requiredSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.requiredSkills || []).map((skill, i) => (
                        <span key={i} className="badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {result.missingSkills?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <FiAlertCircle className="w-4 h-4" />
                        Missing Skills ({result.missingSkills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((skill, i) => (
                          <span key={i} className="badge-danger">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Learning Areas */}
              {result.priorityAreas?.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-purple-400" />
                    Priority Learning Areas
                  </h2>
                  <div className="space-y-4">
                    {result.priorityAreas.map((area, i) => (
                      <div key={i} className="border border-gray-700 rounded-xl p-4 hover:border-purple-500/30 transition-colors bg-white/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 
                                         flex items-center justify-center text-xs font-bold border border-purple-500/20">
                              {area.rank}
                            </span>
                            <h3 className="font-medium text-white">{area.skill}</h3>
                          </div>
                          <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded border border-gray-700">
                            {area.estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{area.reason}</p>
                        {area.resources?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                              <FiZap className="w-3 h-3" />
                              Resources:
                            </p>
                            <ul className="space-y-1">
                              {area.resources.map((resource, j) => (
                                <li key={j} className="text-xs text-purple-400 flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SkillGap;