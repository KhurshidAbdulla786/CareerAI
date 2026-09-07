import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiUser, FiZap, FiAlertCircle } from 'react-icons/fi';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      setMessages(res.data.data?.messages || []);
    } catch (err) {
      console.error('Failed to load chat history');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await chatAPI.sendMessage(input.trim());
      const aiResponse = { role: 'assistant', content: res.data.data.response };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get response');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What jobs suit my profile?',
    'What should I learn next?',
    'How can I improve my CV?',
    'What skills are in demand?',
    'How to prepare for interviews?',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <FiMessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Career Chat</h1>
        </div>
        <p className="text-gray-400 ml-13">
          Ask career-related questions and get personalized AI advice.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Chat Container */}
        <div className="card h-[600px] flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FiZap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Career AI Assistant
                </h3>
                <p className="text-gray-400 mb-6">
                  Ask me anything about your career, CV, or job search!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        handleSend({ preventDefault: () => {} });
                      }}
                      className="badge-primary cursor-pointer hover:bg-purple-500/20 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                        : 'bg-white/5 border border-gray-700 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'user' ? (
                        <FiUser className="w-3.5 h-3.5 opacity-70" />
                      ) : (
                        <FiZap className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p className={`text-xs mt-1 opacity-50`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="spinner w-4 h-4"></div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-800/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSend} className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-field flex-1"
                placeholder="Ask a career question..."
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-6 flex items-center"
              >
                {loading ? (
                  <div className="spinner w-5 h-5"></div>
                ) : (
                  <>
                    <FiSend className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;