import React, { useState } from 'react';
import api from '../api';
import { Info, Calendar as CalendarIcon, Clock } from 'lucide-react';

const PatientDashboard = () => {
  const [form, setForm] = useState({ 
    date: '', time: '', symptoms: '',
    patientName: '', patientAge: '', patientGender: '', patientPhone: ''
  });
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setBooking(true);
    setMsg({ text: '', type: '' });
    
    try {
      const [h, m] = form.time.split(':').map(Number);
      // Assuming a default 30-minute slot duration since we don't know the exact doctor yet
      const endMin = h * 60 + m + 30;
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
      
      const res = await api.post('/patient/appointments', {
        appointmentDate: form.date,
        startTime: form.time,
        endTime,
        symptoms: form.symptoms,
        patientName: form.patientName,
        patientAge: form.patientAge,
        patientGender: form.patientGender,
        patientPhone: form.patientPhone
      });
      
      const assignedDoctorName = res.data.appointment?.doctor?.name || 'an available specialist';
      const aiSpecialization = res.data.specialization || 'specialist';
      
      setMsg({ text: `Success! Our AI analyzed your symptoms, categorized you under ${aiSpecialization}, and booked you with Dr. ${assignedDoctorName}.`, type: 'success' });
      setForm({ date: '', time: '', symptoms: '', patientName: '', patientAge: '', patientGender: '', patientPhone: '' });
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Booking failed. Please try again.', type: 'error' });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Describe your symptoms, and our AI will automatically assign you the right specialist.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleBook}>
          {/* Basic Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Legal Name</label>
              <input className="form-control" type="text" required
                value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Active Phone Number</label>
              <input className="form-control" type="tel" required
                pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" maxLength={10}
                value={form.patientPhone} onChange={e => setForm({ ...form, patientPhone: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Age</label>
              <input className="form-control" type="number" required min="0" max="150"
                value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Gender</label>
              <select className="form-control" required
                value={form.patientGender} onChange={e => setForm({ ...form, patientGender: e.target.value })}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Appointment Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={16} /> Date
              </label>
              <input className="form-control" type="date" required
                min={new Date().toISOString().split('T')[0]}
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Time
              </label>
              <input className="form-control" type="time" required
                value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Describe your symptoms</label>
            <textarea className="form-control" required rows={5} style={{ resize: 'none' }}
              placeholder="E.g. I have had a persistent headache and slight fever for 3 days..."
              value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
          </div>

          <div className="alert alert-info" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 24 }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.9rem' }}>
              <strong>How this works:</strong> Just describe your symptoms and pick a time. Our AI will deduce the correct medical specialization for you, and securely assign you to the first available doctor in that field!
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem' }} disabled={booking}>
            {booking ? <><span className="spinner" /> Analyzing symptoms & booking...</> : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientDashboard;
