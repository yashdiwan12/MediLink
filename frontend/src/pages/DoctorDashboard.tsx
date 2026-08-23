import React, { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, Clock, User as UserIcon, ChevronDown, ChevronUp, Send } from 'lucide-react';

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  symptoms: string;
  urgencyLevel: string | null;
  chiefComplaint: string | null;
  suggestedQuestions: string[] | null;
  clinicalNotes: string | null;
  patient: { id: string; name: string; email: string };
}

const URGENCY_BADGE: Record<string, string> = {
  High: 'badge-red', Medium: 'badge-orange', Low: 'badge-green',
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red',
};

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notesForm, setNotesForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, { text: string; type: string }>>({});

  useEffect(() => {
    api.get('/doctor/appointments')
      .then(r => setAppointments(r.data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submitNotes = async (apptId: string) => {
    const notes = notesForm[apptId];
    if (!notes?.trim()) return;
    setSubmitting(apptId);
    setMsg(prev => ({ ...prev, [apptId]: { text: '', type: '' } }));
    try {
      await api.post(`/doctor/appointments/${apptId}/post-visit`, { clinicalNotes: notes });
      setMsg(prev => ({ ...prev, [apptId]: { text: 'Notes submitted. AI summary sent to patient via email.', type: 'success' } }));
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'COMPLETED', clinicalNotes: notes } : a));
    } catch (err: any) {
      setMsg(prev => ({ ...prev, [apptId]: { text: err.response?.data?.error || 'Submission failed', type: 'error' } }));
    } finally { setSubmitting(null); }
  };

  const scheduled = appointments.filter(a => a.status === 'SCHEDULED');
  const past = appointments.filter(a => a.status !== 'SCHEDULED');

  if (loading) return <p style={{ color: 'var(--text-muted)', marginTop: 40 }}>Loading schedule...</p>;

  const AppointmentRow = ({ appt }: { appt: Appointment }) => {
    const open = expanded === appt.id;
    const date = new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}
          onClick={() => setExpanded(open ? null : appt.id)}
        >
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
            {appt.patient.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{appt.patient.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Calendar size={13} /> {date}
              <Clock size={13} style={{ marginLeft: 4 }} /> {appt.startTime}–{appt.endTime}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-blue'}`}>
              {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
            </span>
            {appt.urgencyLevel && (
              <span className={`badge ${URGENCY_BADGE[appt.urgencyLevel] || 'badge-blue'}`}>
                {appt.urgencyLevel}
              </span>
            )}
            {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
          </div>
        </div>

        {open && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Patient symptoms */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Patient Symptoms</div>
              <p style={{ fontSize: '0.875rem' }}>{appt.symptoms}</p>
            </div>

            {/* AI pre-visit summary */}
            {appt.chiefComplaint && (
              <div style={{ background: 'var(--orange-light)', border: '1px solid #FED7AA', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 8 }}>AI Pre-Visit Summary</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)' }}>Chief Complaint:</span>
                  <span style={{ fontSize: '0.875rem' }}>{appt.chiefComplaint}</span>
                </div>
                {appt.suggestedQuestions && appt.suggestedQuestions.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: 4 }}>Suggested Questions:</div>
                    <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {appt.suggestedQuestions.map((q: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{q}</li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            )}

            {/* Post-visit notes form */}
            {appt.status === 'SCHEDULED' && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Submit Post-Visit Notes</div>
                {msg[appt.id]?.text && (
                  <div className={`alert alert-${msg[appt.id].type}`} style={{ marginBottom: 10 }}>{msg[appt.id].text}</div>
                )}
                <textarea
                  className="form-control"
                  rows={4}
                  style={{ resize: 'none', marginBottom: 10 }}
                  placeholder="Enter clinical notes, diagnosis, and prescription..."
                  value={notesForm[appt.id] || ''}
                  onChange={e => setNotesForm(prev => ({ ...prev, [appt.id]: e.target.value }))}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => submitNotes(appt.id)}
                  disabled={submitting === appt.id || !notesForm[appt.id]?.trim()}
                >
                  {submitting === appt.id ? <span className="spinner" /> : <><Send size={13} /> Submit & Generate Summary</>}
                </button>
              </div>
            )}

            {appt.clinicalNotes && appt.status === 'COMPLETED' && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Clinical Notes Submitted</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>{appt.clinicalNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">My Schedule</h1>
        <p className="page-subtitle">View patient appointments and submit post-visit notes</p>
      </div>

      {/* Upcoming */}
      <div className="section-head"><h2>Upcoming ({scheduled.length})</h2></div>
      {scheduled.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 28 }}>
          <p style={{ color: 'var(--text-muted)' }}>No upcoming appointments.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {scheduled.map(a => <AppointmentRow key={a.id} appt={a} />)}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div className="section-head"><h2>Past ({past.length})</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {past.map(a => <AppointmentRow key={a.id} appt={a} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
