import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import MyAppointments from './pages/MyAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

const Spinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ border: '3px solid var(--border)', borderTop: '3px solid var(--blue)', borderRadius: '50%', width: 30, height: 30, animation: 'spin 0.7s linear infinite' }} />
  </div>
);

// Guard-only wrapper — renders <Outlet> so nested routes work with DashboardLayout
const RequireRole = ({ roles }: { roles: string[] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Patient Portal */}
      <Route path="/patient" element={<RequireRole roles={['PATIENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="search" element={<PatientDashboard />} />
        </Route>
      </Route>

      {/* Doctor Portal */}
      <Route element={<RequireRole roles={['DOCTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<RequireRole roles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
