import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authAPI.getProfile().then((res) => {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }).catch(() => {
          logout();
        });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      // Registration no longer returns a token - email verification required first
      return {
        user: res.data.data.user,
        devVerifyUrl: res.data.data.devVerifyUrl || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      const wrapped = new Error(message);
      wrapped.original = err;
      throw wrapped;
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    setError(null);
    try {
      const res = await authAPI.googleLogin(credential);
      const { user: userData, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed';
      setError(message);
      const wrapped = new Error(message);
      wrapped.original = err;
      throw wrapped;
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    setError(null);
    try {
      const res = await authAPI.resendVerification(email);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend verification email';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    setError(null);
    try {
      const res = await authAPI.updateProfile(data);
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    googleLogin,
    resendVerification,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;