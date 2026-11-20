import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import CVAnalyzer from './pages/cv/CVAnalyzer';
import JobMatching from './pages/jobs/JobMatching';
import SkillGap from './pages/skills/SkillGap';
import LearningRoadmap from './pages/skills/LearningRoadmap';
import Interview from './pages/interview/Interview';
import Chat from './pages/chat/Chat';
import Pricing from './pages/pricing/Pricing';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';
import Profile from './pages/auth/Profile';
import { PageLayout } from './components/layout/PageLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
};

const ProtectedFullWidthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <PageLayout fullWidth>
      {children}
    </PageLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Payment pages — public (success/failed don't need auth for display) */}
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />

          {/* Protected app pages */}
          <Route path="/dashboard" element={<ProtectedFullWidthRoute><Dashboard /></ProtectedFullWidthRoute>} />
          <Route path="/cv-analyzer" element={<ProtectedRoute><CVAnalyzer /></ProtectedRoute>} />
          <Route path="/job-matching" element={<ProtectedRoute><JobMatching /></ProtectedRoute>} />
          <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
          <Route path="/learning-roadmap" element={<ProtectedRoute><LearningRoadmap /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
