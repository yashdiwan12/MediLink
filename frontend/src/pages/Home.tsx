import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BrainCircuit, FileText, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
        borderRadius: '16px',
        padding: '60px 40px',
        color: 'white',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Healthcare, Smarter.
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6, opacity: 0.9, marginBottom: '32px' }}>
          MediLink seamlessly connects you with top specialists. Our advanced AI prepares your doctor before your visit and provides clear, personalized summaries afterward.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/patient/search" className="btn" style={{ background: 'var(--orange)', color: 'white', padding: '12px 24px', fontSize: '1rem' }}>
            Book an Appointment <ArrowRight size={18} />
          </Link>
          <Link to="/patient/appointments" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 24px', fontSize: '1rem' }}>
            View My Schedule
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>How MediLink Works</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          {/* Feature 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>1. AI-Driven Triage</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              Just describe your symptoms. Our AI instantly deduces the right medical specialization for you and automatically assigns an available specialist.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--orange-light)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>2. AI Symptom Analysis</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              Describe your symptoms. Our AI instantly prepares a chief complaint and urgency brief for your doctor.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>3. Post-Visit Summaries</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              Get a patient-friendly summary of the doctor's clinical notes, plus automated medication reminders via email.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>4. Calendar Sync</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              Appointments are automatically synced to your Google Calendar, keeping you organized without extra effort.
            </p>
          </div>

        </div>
      </div>

      {/* Trust Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <ShieldCheck size={18} /> Secure, confidential, and built for your well-being.
      </div>
    </div>
  );
};

export default Home;
