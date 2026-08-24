import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'PATIENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const res = await api.post(endpoint, payload);
      login(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-background min-h-screen flex text-on-surface antialiased">
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Left Side: Hero Section */}
        <div 
          className="hidden md:flex flex-col w-1/2 p-12 lg:p-24 text-on-primary relative overflow-hidden shrink-0"
          style={{
            backgroundColor: '#2563eb',
            backgroundImage: 'radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1d4ed8 0%, transparent 50%)'
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-center max-w-lg mx-auto">
            <div className="mb-16">
              <span className="font-headline-md text-headline-md font-bold tracking-tight">MediLink</span>
            </div>
            
            <h1 className="font-display-lg text-display-lg mb-6">
              Healthcare,<br/>Reimagined.
            </h1>
            
            <p className="font-body-lg text-body-lg text-on-primary/90 mb-16 max-w-md">
              Join thousands of patients and doctors experiencing seamless scheduling, AI-powered insights, and automated care management.
            </p>
            
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-white mb-1">Smart Scheduling</h3>
                  <p className="font-body-md text-body-md text-on-primary/80">No more double-bookings or waiting on hold.</p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-white mb-1">AI Pre-Visit Briefs</h3>
                  <p className="font-body-md text-body-md text-on-primary/80">Doctors get summaries before you even walk in.</p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white">security</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-white mb-1">Secure &amp; Confidential</h3>
                  <p className="font-body-md text-body-md text-on-primary/80">Your health data is protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Login Card */}
        <div className="flex-1 flex items-center justify-center p-8 bg-surface-background">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isLogin ? 'Enter your details to access your portal.' : 'Get started with your free account today.'}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wide text-xs" htmlFor="name">
                    Full Name
                  </label>
                  <input 
                    id="name"
                    type="text" 
                    required 
                    placeholder="John Doe"
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md text-body-md" 
                  />
                </div>
              )}

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wide text-xs" htmlFor="email">
                  Email Address
                </label>
                <input 
                  id="email"
                  type="email" 
                  required 
                  placeholder="you@example.com"
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md text-body-md" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-md text-label-md text-on-surface uppercase tracking-wide text-xs" htmlFor="password">
                    Password
                  </label>
                  {isLogin && (
                    <a href="#" className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant transition-colors text-sm">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required 
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md text-body-md" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 uppercase tracking-wide text-xs" htmlFor="role">
                    I am signing up as a
                  </label>
                  <select 
                    id="role"
                    value={form.role} 
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md text-body-md"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex justify-center items-center"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
