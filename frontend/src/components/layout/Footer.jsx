import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const footerLinks = [
  { path: '/cv-analyzer', label: 'CV Analyzer' },
  { path: '/job-matching', label: 'Job Matching' },
  { path: '/skill-gap', label: 'Skill Gap' },
  { path: '/learning-roadmap', label: 'Learning Roadmap' },
  { path: '/interview', label: 'Interview Practice' },
  { path: '/chat', label: 'AI Career Chat' },
];

const Footer = () => {
  return (
    <footer className="bg-white/95 backdrop-blur-xl border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/dashboard" className="inline-flex items-center">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                CareerAI
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              AI-powered career assistant for CV analysis, job matching, skill gap
              identification, and interview preparation.
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <a
                href="mailto:support@careerai.app"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-500/30 transition-all"
                aria-label="Email"
              >
                <FiMail className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-500/30 transition-all"
                aria-label="GitHub"
              >
                <FiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-500/30 transition-all"
                aria-label="Twitter"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-500/30 transition-all"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-600 hover:text-blue-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-slate-600 hover:text-blue-800 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-slate-600 hover:text-blue-800 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-slate-600 hover:text-blue-800 transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built with <span className="text-blue-700">Express</span>,{' '}
            <span className="text-teal-700">React</span> &{' '}
            <span className="text-green-700">Groq AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
