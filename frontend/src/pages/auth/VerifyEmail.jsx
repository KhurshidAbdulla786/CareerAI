import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const devVerifyUrlParam = searchParams.get('devVerifyUrl');
  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(emailParam || '');
  const [devVerifyUrl, setDevVerifyUrl] = useState(devVerifyUrlParam || '');
  const { resendVerification } = useAuth();
  const navigate = useNavigate();

  const verifyToken = useCallback(async (tokenValue) => {
    setVerifying(true);
    try {
      await authAPI.verifyEmail(tokenValue);
      setVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (token) verifyToken(token);
  }, [token, verifyToken]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setSending(true);
    try {
      const result = await resendVerification(email);
      if (result && result.devVerifyUrl) {
        setDevVerifyUrl(result.devVerifyUrl);
      }
      toast.success(result && result.devVerifyUrl ? 'Development verification link ready below.' : 'Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center mb-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
            CareerAI
          </span>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          {verifying && <VerifyingState />}
          {!verifying && verified && <VerifiedState navigate={navigate} />}
          {!verifying && !verified && (
            <ResendState
              email={email}
              setEmail={setEmail}
              sending={sending}
              handleResend={handleResend}
              devVerifyUrl={devVerifyUrl}
              setDevVerifyUrl={setDevVerifyUrl}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

const VerifyingState = () => (
  <div className="py-8">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
    <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
    <p className="text-gray-400">Please wait a moment</p>
  </div>
);

const VerifiedState = ({ navigate }) => (
  <div>
    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
    <p className="text-gray-400 mb-8">Your account is now active. You can log in.</p>
    <button
      onClick={() => navigate('/login')}
      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-600 focus:outline-none transition-all"
    >
      Go to Login
    </button>
  </div>
);

const ResendState = ({ email, setEmail, sending, handleResend, devVerifyUrl, setDevVerifyUrl }) => (
  <div>
    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
    <p className="text-gray-400 mb-6">
      We've sent a verification link to your inbox. Please check your email and click the link to activate your account.
    </p>
    {devVerifyUrl && (
      <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-left">
        <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
          ⚡ Development mode — SMTP not configured
        </p>
        <a
          href={devVerifyUrl}
          className="block w-full py-3 px-4 text-center bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-600 transition-all"
        >
          Click here to verify your email
        </a>
        <p className="text-xs text-gray-400 mt-2 break-all">{devVerifyUrl}</p>
      </div>
    )}
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-4 py-3 mb-4 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
      placeholder="Enter your email to resend"
    />
    <button
      onClick={handleResend}
      disabled={sending}
      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-600 focus:outline-none disabled:opacity-50 transition-all"
    >
      {sending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Sending...
        </span>
      ) : (
        'Resend Verification Email'
      )}
    </button>
    <p className="mt-8 text-center text-gray-400">
      Already verified?{' '}
      <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
        Sign in
      </Link>
    </p>
  </div>
);

export default VerifyEmail;
