import React, { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  patientSummary: string | null;
  medicationSchedule: any[] | null;
  doctor: { id: string; name: string };
}

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'badge-blue',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
};

const URGENCY_BADGE: Record<string, string> = {
  High: 'badge-red', Medium: 'badge-orange', Low: 'badge-green',
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patient/appointments');
      setAppointments(res.data.appointments);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await api.patch(`/patient/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not cancel');
    } finally { setCancelling(null); }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', marginTop: 40 }}>Loading appointments...</p>;

  return (
    <div className="px-gutter-md md:px-margin-container max-w-[1140px] mx-auto w-full py-8 fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Track your upcoming and past visits</p>
      </div>

      {appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p>You have no appointments yet. <Link to="/patient/search" style={{ color: 'var(--orange)', fontWeight: 600 }}>Find a doctor</Link> to book one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appointments.map(appt => {
            const open = expanded === appt.id;
            const date = new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={appt.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Row header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => setExpanded(open ? null : appt.id)}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Dr. {appt.doctor.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Calendar size={13} /> {date}
                        <Clock size={13} style={{ marginLeft: 4 }} /> {appt.startTime}–{appt.endTime}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-blue'}`}>
                      {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                    </span>
                    {appt.urgencyLevel && (
                      <span className={`badge ${URGENCY_BADGE[appt.urgencyLevel] || 'badge-blue'}`}>
                        {appt.urgencyLevel} Urgency
                      </span>
                    )}
                    {appt.status === 'SCHEDULED' && (
                      <button
                        className="btn btn-danger-ghost btn-sm"
                        disabled={cancelling === appt.id}
                        onClick={e => { e.stopPropagation(); cancel(appt.id); }}
                      >
                        {cancelling === appt.id ? <span className="spinner" style={{ borderTopColor: 'var(--danger)' }} /> : <><X size={13} /> Cancel</>}
                      </button>
                    )}
                    {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Symptoms</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{appt.symptoms}</p>
                    </div>

                    {appt.chiefComplaint && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>AI Chief Complaint</div>
                        <p style={{ fontSize: '0.875rem' }}>{appt.chiefComplaint}</p>
                      </div>
                    )}

                    {appt.suggestedQuestions && appt.suggestedQuestions.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Suggested Questions for Doctor</div>
                        <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {appt.suggestedQuestions.map((q: string, i: number) => (
                            <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {appt.patientSummary && (
                      <div style={{ background: 'var(--blue-light)', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 6 }}>Post-Visit Summary</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7 }}>{appt.patientSummary}</p>
                      </div>
                    )}

                    {appt.medicationSchedule && appt.medicationSchedule.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Medication Schedule</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {appt.medicationSchedule.map((med: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: '0.875rem' }}>
                              <span style={{ fontWeight: 600 }}>{med.name || med.medication}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{med.dosage} — {med.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
