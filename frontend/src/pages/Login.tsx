import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { ShieldCheck, BrainCircuit, CalendarCheck, Eye, EyeOff } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left Side - Marketing/Branding (Hidden on mobile) */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
        color: 'white',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="login-hero">
        
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '-20%', width: '600px', height: '600px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>MediLink</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: 'auto 0' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Healthcare, <br />Reimagined.
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '40px' }}>
            Join thousands of patients and doctors experiencing seamless scheduling, AI-powered insights, and automated care management.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}><CalendarCheck size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Smart Scheduling</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>No more double-bookings or waiting on hold.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}><BrainCircuit size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>AI Pre-Visit Briefs</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Doctors get summaries before you even walk in.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}><ShieldCheck size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Secure & Confidential</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Your health data is protected with enterprise-grade security.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
        <div className="fade-in" style={{ width: '100%', maxWidth: 440 }}>
          
          {/* Mobile Logo */}
          <div className="mobile-logo" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--blue)', letterSpacing: '-0.5px' }}>MediLink</span>
          </div>

          <div className="card" style={{ padding: '40px 32px', boxShadow: 'var(--shadow-md)', borderRadius: '16px', border: 'none' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: 32 }}>
              {isLogin ? 'Enter your details to access your portal.' : 'Get started with your free account today.'}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-control" type="text" required placeholder="John Doe"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              )}
              
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-control" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Password</label>
                  {isLogin && <a href="#" style={{ fontSize: '0.8rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-sub)', display: 'flex', alignItems: 'center', padding: 0
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="form-group">
                  <label>I am signing up as a</label>
                  <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 12, fontSize: '1rem' }} disabled={loading}>
                {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="divider" style={{ margin: '28px 0' }} />
            
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ border: 'none', background: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
