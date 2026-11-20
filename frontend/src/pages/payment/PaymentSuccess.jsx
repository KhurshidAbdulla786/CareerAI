import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FiCheck, FiZap, FiArrowRight, FiLoader } from 'react-icons/fi';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const { fetchUser } = useAuth();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const esewa = searchParams.get('data');
    // Detect gateway robustly: eSewa redirects with "data", Stripe with "session_id".
    // (eSewa appends its own ?data= to the success URL, so we don't pre-add ?gateway=esewa.)
    const gateway = esewa
      ? 'esewa'
      : sessionId
      ? 'stripe'
      : null;

    const verify = async () => {
      try {
        if (gateway === 'stripe' && sessionId) {
          await api.post('/payment/stripe/verify', { sessionId });
        } else if (gateway === 'esewa' && esewa) {
          await api.post('/payment/esewa/verify', { data: esewa });
        } else {
          setStatus('error');
          setMessage('Could not verify payment. Please contact support.');
          return;
        }
        // Refresh user to get updated plan
        if (fetchUser) await fetchUser();
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Please contact support.');
      }
    };

    verify();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 py-10">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FiLoader className="w-7 h-7 text-blue-700 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Verifying your payment…</h2>
            <p className="text-slate-600 text-sm">Please wait while we confirm your subscription.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            {/* Animated checkmark */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700">
                  <FiCheck className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
              </div>
              {/* sparkles */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 animate-bounce" />
              <div className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-teal-400 animate-bounce delay-150" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-800 text-sm font-medium mb-4">
                <FiZap className="w-4 h-4" /> Pro Plan Activated
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">You're all set! 🎉</h1>
              <p className="text-slate-600">
                Your CareerAI Pro subscription is now active. Enjoy unlimited access to all AI-powered career tools.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-3">
              {[
                'Unlimited CV analyses',
                'Unlimited AI chat messages',
                'Advanced interview practice',
                'Priority AI processing',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <FiCheck className="w-3 h-3 text-blue-700" />
                  </div>
                  <span className="text-slate-700 text-sm">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                Go to Dashboard <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cv-analyzer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Analyze My CV
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Verification Issue</h2>
              <p className="text-slate-600 text-sm mb-2">{message}</p>
              <p className="text-slate-500 text-xs">
                If you were charged, please email{' '}
                <a href="mailto:support@careerai.app" className="text-blue-700 hover:underline">
                  support@careerai.app
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/pricing"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 rounded-xl text-white text-sm font-medium transition-all"
              >
                Try Again
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
