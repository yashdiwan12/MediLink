import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="px-gutter-md md:px-margin-container max-w-[1140px] mx-auto w-full py-8 space-y-section-gap">
      {/* Hero Banner */}
      <section className="w-full bg-primary text-on-primary rounded-xl overflow-hidden relative p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {/* Glassmorphic accent background (subtle) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-display-lg font-display-lg">Healthcare, Smarter.</h1>
          <p className="text-body-lg font-body-lg text-primary-fixed-dim">
            MediLink seamlessly connects you with top specialists. Our advanced AI prepares your doctor before your visit and provides clear, personalized summaries afterward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/patient/search" className="bg-urgency-medium hover:brightness-110 text-white text-label-md font-label-md py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md">
              Book an Appointment
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
            <Link to="/patient/appointments" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-label-md font-label-md py-3 px-6 rounded-lg transition-all">
              View My Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <h2 className="text-headline-lg font-headline-lg text-center text-on-surface">How MediLink Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined">search</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface">1. AI-Driven Triage</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Just describe your symptoms. Our AI instantly deduces the right medical specialization for your clear issue.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-urgency-medium/10 flex items-center justify-center text-urgency-medium mb-2">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface">2. AI Symptom Analysis</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Describe your symptoms. Our AI instantly prepares a chief complaint and urgency brief for your doctor.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-urgency-low/10 flex items-center justify-center text-urgency-low mb-2">
              <span className="material-symbols-outlined">description</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface">3. Post-Visit Summaries</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Get a patient-friendly summary of the doctor's clinical notes, plus automated medication reminders.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface">4. Calendar Sync</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Appointments are automatically synced to your Google Calendar, keeping you organized without extra effort.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
