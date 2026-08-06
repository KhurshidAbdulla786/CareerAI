import { useState, useEffect, useCallback } from 'react';
import { cvAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiFileText, FiUpload, FiTrash2, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiTarget, FiBarChart2, FiBookOpen, FiBriefcase, FiStar, FiZap } from 'react-icons/fi';

const CVAnalyzer = () => {
  const { user } = useAuth();
  const [cvs, setCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fetchCVs = useCallback(async () => {
    try {
      const res = await cvAPI.getAll();
      setCvs(res.data.data || []);
    } catch (err) {
      console.error('Fetch CVs error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await cvAPI.upload(formData);
      setCvs((prev) => [res.data.data, ...prev]);
      setSelectedCv(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;
    try {
      await cvAPI.delete(id);
      setCvs((prev) => prev.filter((cv) => cv._id !== id));
      if (selectedCv?._id === id) setSelectedCv(null);
    } catch (err) {
      setError('Failed to delete CV');
    }
  };

  const renderScoreCircle = (score) => {
    const color = score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
    const borderColor = score >= 70 ? 'border-green-400' : score >= 50 ? 'border-yellow-400' : 'border-red-400';
    return (
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${borderColor} bg-white/5`}>
        <span className={`text-2xl font-bold ${color}`}>{score}%</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <FiFileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CV Analyzer</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Upload your CV (PDF) and get AI-powered analysis with detailed feedback.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl mb-6">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & CV List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Area */}
          <div
            className={`card border-2 border-dashed text-center ${
              dragOver ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload CV</h3>
            <p className="text-sm text-gray-400 mb-4">Drag & drop your PDF here</p>
            <label className="btn-secondary cursor-pointer inline-block">
              Browse Files
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="spinner"></div>
                <span className="text-sm text-gray-400">Analyzing your CV...</span>
              </div>
            )}
          </div>

          {/* CV List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Your CVs</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : cvs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No CVs uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div
                    key={cv._id}
                    className={`card-hover flex items-center justify-between p-4 ${
                      selectedCv?._id === cv._id ? 'border-purple-500/50 bg-purple-500/5' : ''
                    }`}
                    onClick={() => setSelectedCv(cv)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[150px]">
                          {cv.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(cv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(cv._id); }}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2">
          {!selectedCv ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No CV Selected
              </h3>
              <p className="text-gray-400">
                Upload a CV to see the AI analysis results here.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Score Overview */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {selectedCv.fileName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Analyzed on {new Date(selectedCv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedCv.analysisResult?.overallScore && (
                    renderScoreCircle(selectedCv.analysisResult.overallScore)
                  )}
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <FiZap className="w-4 h-4 text-purple-400" />
                    Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCv.parsedData?.skills || []).map((skill, i) => (
                      <span key={i} className="badge-primary">{skill}</span>
                    ))}
                    {(!selectedCv.parsedData?.skills || selectedCv.parsedData.skills.length === 0) && (
                      <span className="text-gray-500 text-sm">No skills detected</span>
                    )}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                {selectedCv.analysisResult && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/5 border border-green-800/30 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4" />
                        Strengths
                      </h3>
                      <ul className="space-y-1">
                        {(selectedCv.analysisResult.strengths || []).map((s, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start">
                            <span className="mr-2 text-green-400">•</span> {s}
                          </li>
                        ))}
                        {(!selectedCv.analysisResult.strengths || selectedCv.analysisResult.strengths.length === 0) && (
                          <li className="text-sm text-gray-500">No strengths analyzed</li>
                        )}
                      </ul>
                    </div>
                    <div className="bg-red-500/5 border border-red-800/30 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <FiAlertCircle className="w-4 h-4" />
                        Weaknesses
                      </h3>
                      <ul className="space-y-1">
                        {(selectedCv.analysisResult.weaknesses || []).map((w, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start">
                            <span className="mr-2 text-red-400">•</span> {w}
                          </li>
                        ))}
                        {(!selectedCv.analysisResult.weaknesses || selectedCv.analysisResult.weaknesses.length === 0) && (
                          <li className="text-sm text-gray-500">No weaknesses identified</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* ATS Compatibility */}
              {selectedCv.analysisResult?.atsCompatibility && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5 text-purple-400" />
                    ATS Compatibility
                  </h2>
                  <div className="flex items-center space-x-4 mb-4">
                    {renderScoreCircle(selectedCv.analysisResult.atsCompatibility.score)}
                    <div>
                      <p className="text-sm text-gray-400">
                        {selectedCv.analysisResult.atsCompatibility.score >= 70
                          ? 'Your CV is well optimized for ATS systems.'
                          : 'Your CV could be improved for better ATS compatibility.'}
                      </p>
                    </div>
                  </div>
                  {selectedCv.analysisResult.atsCompatibility.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">
                        Recommendations
                      </h3>
                      <ul className="space-y-1">
                        {selectedCv.analysisResult.atsCompatibility.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start">
                            <span className="mr-2 text-purple-400">→</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {selectedCv.analysisResult?.suggestions?.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-purple-400" />
                    Improvement Suggestions
                  </h2>
                  <ul className="space-y-3">
                    {selectedCv.analysisResult.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 
                                     flex items-center justify-center text-xs font-bold border border-purple-500/20">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-400">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Feedback */}
              {selectedCv.analysisResult?.detailedFeedback && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-purple-400" />
                    Detailed Analysis
                  </h2>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {selectedCv.analysisResult.detailedFeedback}
                  </p>
                </div>
              )}

              {/* Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCv.parsedData?.education?.length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <FiBookOpen className="w-5 h-5 text-purple-400" />
                      Education
                    </h2>
                    {selectedCv.parsedData.education.map((edu, i) => (
                      <div key={i} className="mb-3 last:mb-0 p-3 bg-white/5 rounded-lg">
                        <p className="font-medium text-white">{edu.degree}</p>
                        <p className="text-sm text-gray-400">{edu.institution}</p>
                        {edu.year && <p className="text-xs text-gray-500">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {selectedCv.parsedData?.experience?.length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <FiBriefcase className="w-5 h-5 text-purple-400" />
                      Experience
                    </h2>
                    {selectedCv.parsedData.experience.map((exp, i) => (
                      <div key={i} className="mb-3 last:mb-0 p-3 bg-white/5 rounded-lg">
                        <p className="font-medium text-white">{exp.role}</p>
                        <p className="text-sm text-gray-400">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              {selectedCv.analysisResult?.missingSkills?.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiTarget className="w-5 h-5 text-purple-400" />
                    Skills to Develop
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedCv.analysisResult.missingSkills.map((skill, i) => (
                      <span key={i} className="badge-warning">{skill}</span>
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

export default CVAnalyzer;