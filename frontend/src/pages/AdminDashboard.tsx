import React, { useEffect, useState } from 'react';
import api from '../api';
import { X, Plus, Stethoscope } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  doctorProfile: {
    id: string;
    specialization: string;
    slotDuration: number;
    workingHours: any;
    leaves: { id: string; date: string; reason: string | null }[];
  } | null;
}

const DEFAULT_HOURS = {
  monday: '09:00-17:00', tuesday: '09:00-17:00', wednesday: '09:00-17:00',
  thursday: '09:00-17:00', friday: '09:00-17:00',
};

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profileModal, setProfileModal] = useState<Doctor | null>(null);
  const [profileForm, setProfileForm] = useState({ specialization: '', slotDuration: 30 });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Leave form
  const [leaveModal, setLeaveModal] = useState<Doctor | null>(null);
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: '' });
  const [savingLeave, setSavingLeave] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    api.get('/admin/doctors')
      .then(r => setDoctors(r.data.doctors))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openProfile = (doc: Doctor) => {
    setProfileModal(doc);
    setProfileMsg({ text: '', type: '' });
    setProfileForm({
      specialization: doc.doctorProfile?.specialization || '',
      slotDuration: doc.doctorProfile?.slotDuration || 30,
    });
  };

  const saveProfile = async () => {
    if (!profileModal) return;
    setSavingProfile(true);
    try {
      await api.post(`/admin/doctors/${profileModal.id}/profile`, {
        specialization: profileForm.specialization,
        slotDuration: Number(profileForm.slotDuration),
        workingHours: DEFAULT_HOURS,
      });
      setProfileMsg({ text: 'Profile saved successfully.', type: 'success' });
      const res = await api.get('/admin/doctors');
      setDoctors(res.data.doctors);
    } catch (err: any) {
      setProfileMsg({ text: err.response?.data?.error || 'Failed to save', type: 'error' });
    } finally { setSavingProfile(false); }
  };

  const openLeave = (doc: Doctor) => {
    setLeaveModal(doc);
    setLeaveMsg({ text: '', type: '' });
    setLeaveForm({ date: '', reason: '' });
  };

  const saveLeave = async () => {
    if (!leaveModal?.doctorProfile) return alert('Doctor has no profile yet. Set profile first.');
    setSavingLeave(true);
    try {
      const res = await api.post(`/admin/doctors/${leaveModal.doctorProfile.id}/leaves`, leaveForm);
      const cancelled = res.data.cancelledAppointmentsCount;
      setLeaveMsg({
        text: `Leave added.${cancelled > 0 ? ` ${cancelled} existing appointment(s) cancelled and patients notified.` : ''}`,
        type: 'success',
      });
      const refresh = await api.get('/admin/doctors');
      setDoctors(refresh.data.doctors);
    } catch (err: any) {
      setLeaveMsg({ text: err.response?.data?.error || 'Failed to add leave', type: 'error' });
    } finally { setSavingLeave(false); }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', marginTop: 40 }}>Loading doctors...</p>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage doctor profiles, working hours, and leave days</p>
      </div>

      <div className="section-head"><h2>Doctors ({doctors.length})</h2></div>

      {doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No doctor accounts found. Ask doctors to sign up with the Doctor role.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {doctors.map(doc => (
            <div key={doc.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {doc.name[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>Dr. {doc.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.email}</div>
                {doc.doctorProfile ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">{doc.doctorProfile.specialization}</span>
                    <span className="badge badge-orange">{doc.doctorProfile.slotDuration} min slots</span>
                    <span className="badge badge-green">{doc.doctorProfile.leaves.length} leave day(s)</span>
                  </div>
                ) : (
                  <span className="badge badge-red" style={{ marginTop: 4 }}>No profile set</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openProfile(doc)}>
                  <Stethoscope size={13} /> Set Profile
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => openLeave(doc)}>
                  <Plus size={13} /> Add Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && (
        <div className="modal-bg">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 2 }}>Set Doctor Profile</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Dr. {profileModal.name}</p>
              </div>
              <button onClick={() => setProfileModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {profileMsg.text && <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>}

            <div className="form-group">
              <label>Specialization</label>
              <input className="form-control" placeholder="e.g. Cardiology" value={profileForm.specialization}
                onChange={e => setProfileForm(p => ({ ...p, specialization: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Slot Duration (minutes)</label>
              <select className="form-control" value={profileForm.slotDuration}
                onChange={e => setProfileForm(p => ({ ...p, slotDuration: Number(e.target.value) }))}>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Working hours will be set to Mon–Fri, 9 AM–5 PM by default.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <span className="spinner" /> : 'Save Profile'}
              </button>
              <button className="btn btn-ghost" onClick={() => setProfileModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {leaveModal && (
        <div className="modal-bg">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 2 }}>Add Leave Day</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Dr. {leaveModal.name}</p>
              </div>
              <button onClick={() => setLeaveModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {leaveMsg.text && <div className={`alert alert-${leaveMsg.type}`}>{leaveMsg.text}</div>}

            <div className="alert alert-info" style={{ marginBottom: 16, fontSize: '0.8rem' }}>
              Existing appointments on the selected date will be automatically cancelled and patients notified.
            </div>

            <div className="form-group">
              <label>Leave Date</label>
              <input className="form-control" type="date" min={new Date().toISOString().split('T')[0]}
                value={leaveForm.date} onChange={e => setLeaveForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input className="form-control" placeholder="e.g. Medical conference"
                value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveLeave} disabled={savingLeave || !leaveForm.date}>
                {savingLeave ? <span className="spinner" /> : 'Add Leave'}
              </button>
              <button className="btn btn-ghost" onClick={() => setLeaveModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
