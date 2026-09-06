import { useState } from 'react';
import { jobAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { FiTarget, FiBriefcase, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiStar, FiClock, FiList } from 'react-icons/fi';

const JobMatching = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please provide both job title and description');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const skills = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      const res = await jobAPI.match({ title, description, requiredSkills: skills });
      setResult(res.data.data);
      setHistory((prev) => [res.data.data, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze job match');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await jobAPI.getHistory();
      setHistory(res.data.data || []);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBorder = (score) => {
    if (score >= 80) return 'border-green-400';
    if (score >= 60) return 'border-yellow-400';
    if (score >= 40) return 'border-orange-400';
    return 'border-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FiTarget className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Job Matching</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Paste a job description and get AI-powered match analysis based on your skills.
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
              <FiBriefcase className="w-5 h-5 text-purple-400" />
              Job Details
            </h2>
            <form onSubmit={handleMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Full Stack Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field h-48 resize-none"
                  placeholder="Paste the job description here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Skills <span className="text-gray-500">(optional, comma separated)</span>
                </label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="input-field"
                  placeholder="e.g., React, Node.js, MongoDB"
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
                  'Analyze Match'
                )}
              </button>
            </form>
          </div>

          <button
            onClick={loadHistory}
            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
          >
            <FiClock className="w-4 h-4" />
            View Match History
          </button>

          {showHistory && history.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="card-hover p-3 cursor-pointer"
                  onClick={() => setResult(item)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-white">{item.title}</span>
                    {item.matchResult?.matchPercentage && (
                      <span className={`text-sm font-bold ${getScoreColor(item.matchResult.matchPercentage)}`}>
                        {item.matchResult.matchPercentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <FiTarget className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Analysis Yet
              </h3>
              <p className="text-gray-400">
                Enter job details to see the match analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Match Score */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{result.title}</h2>
                    <p className="text-sm text-gray-500">
                      Analyzed on {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {result.matchResult?.matchPercentage && (
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreBorder(result.matchResult.matchPercentage)} bg-white/5`}>
                      <span className={`text-2xl font-bold ${getScoreColor(result.matchResult.matchPercentage)}`}>
                        {result.matchResult.matchPercentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {result.matchResult?.explanation && (
                  <p className="text-gray-400 mb-4">{result.matchResult.explanation}</p>
                )}

                {/* Matching Skills */}
                {result.matchResult?.matchingSkills?.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4" />
                      Matching Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchResult.matchingSkills.map((skill, i) => (
                        <span key={i} className="badge-success">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {result.matchResult?.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchResult.missingSkills.map((skill, i) => (
                        <span key={i} className="badge-danger">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {result.matchResult?.suggestions?.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-purple-400" />
                    Improvement Suggestions
                  </h2>
                  <ul className="space-y-2">
                    {result.matchResult.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                        <span className="text-purple-400 mt-0.5">→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Analysis */}
              {result.matchResult?.detailedAnalysis && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-purple-400" />
                    Detailed Analysis
                  </h2>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {result.matchResult.detailedAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobMatching;