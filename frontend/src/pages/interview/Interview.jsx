import { useState } from 'react';
import { interviewAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { FiMic, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiStar, FiActivity, FiTrendingUp, FiUser } from 'react-icons/fi';

const Interview = () => {
  const [role, setRole] = useState('');
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please enter a job role');
      return;
    }

    setError('');
    setLoading(true);
    setFeedback(null);
    setAnswers([]);
    setCurrentQuestion(0);

    try {
      const res = await interviewAPI.start(role);
      setSession(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await interviewAPI.submitAnswer(
        session._id,
        currentQuestion,
        answer
      );

      setAnswers((prev) => [
        ...prev,
        { question: session.questions[currentQuestion], answer },
      ]);

      if (res.data.data.completed) {
        setFeedback(res.data.data.feedback);
      } else {
        setSession((prev) => ({
          ...prev,
          questions: res.data.data.questions,
        }));
        setCurrentQuestion((prev) => prev + 1);
      }

      setAnswer('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSession(null);
    setCurrentQuestion(0);
    setAnswer('');
    setFeedback(null);
    setAnswers([]);
    setError('');
  };

  const renderScoreCard = (label, score, color) => (
    <div className="text-center p-4 bg-white/5 border border-gray-700 rounded-xl">
      <p className={`text-2xl font-bold ${color}`}>{score}{typeof score === 'number' ? '%' : ''}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <FiMic className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Interview Simulator</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Practice with AI-generated interview questions and get detailed feedback.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl mb-6">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!session ? (
        <div className="max-w-lg mx-auto">
          <div className="card text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <FiMic className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Start Interview Practice
            </h2>
            <p className="text-gray-400 mb-6">
              Enter a job role and get AI-generated questions to practice.
            </p>

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Job Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Full Stack Developer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Try: Frontend Developer, Backend Developer, Data Scientist
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Generating Questions...
                  </>
                ) : (
                  'Start Interview'
                )}
              </button>
            </form>
          </div>
        </div>
      ) : feedback ? (
        /* Feedback Section */
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FiStar className="w-6 h-6 text-purple-400" />
              Interview Feedback
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {renderScoreCard('Overall', feedback.overallScore || 0, 'text-purple-400')}
              {renderScoreCard('Technical', feedback.technicalScore || 0, 'text-green-400')}
              {renderScoreCard('Communication', feedback.communicationScore || 0, 'text-blue-400')}
              {renderScoreCard('Answered', feedback.questionsAnswered || 0, 'text-cyan-400')}
            </div>

            {feedback.summary && (
              <p className="text-gray-400 mb-4">{feedback.summary}</p>
            )}

            {feedback.strengths?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-1">
                  <FiCheckCircle className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start">
                      <span className="mr-2 text-green-400">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-1">
                  <FiTrendingUp className="w-4 h-4" /> Areas to Improve
                </h3>
                <ul className="space-y-1">
                  {feedback.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start">
                      <span className="mr-2 text-red-400">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Answers Review */}
          {answers.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-purple-400" />
                Your Answers
              </h2>
              {answers.map((item, i) => (
                <div key={i} className="mb-4 p-4 bg-white/5 rounded-xl border border-gray-700">
                  <p className="font-medium text-gray-200 mb-2">
                    Q{i + 1}: {item.question}
                  </p>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleRestart} className="btn-primary w-full">
            Try Another Interview
          </button>
        </div>
      ) : (
        /* Questions Section */
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-purple-400" />
                Question {currentQuestion + 1} of {session.questions?.length || 5}
              </h2>
              <span className="badge-primary text-xs">{role}</span>
            </div>

            <div className="bg-purple-500/10 border border-purple-800/30 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-200 font-medium">
                {session.questions?.[currentQuestion] || 'No question available'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="input-field h-32 resize-none"
                placeholder="Type your answer here..."
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Evaluating...
                </>
              ) : currentQuestion === (session.questions?.length || 5) - 1 ? (
                'Finish Interview'
              ) : (
                'Submit Answer & Next'
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Interview;