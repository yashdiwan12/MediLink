import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const patientLinks = [
    { label: 'Home', to: '/patient' },
    { label: 'My Appointments', to: '/patient/appointments' },
    { label: 'Book Appointment', to: '/patient/search' },
  ];

  const doctorLinks = [
    { label: 'My Schedule', to: '/doctor' },
  ];

  const adminLinks = [
    { label: 'Manage Doctors', to: '/admin' },
  ];

  const navLinks =
    user?.role === 'ADMIN' ? adminLinks :
    user?.role === 'DOCTOR' ? doctorLinks :
    patientLinks;

  return (
    <div className="page-wrap">
      {/* Top Navigation */}
      <nav className="topnav">
        <div className="container topnav-inner">
          {/* Logo */}
          <Link to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor' : '/patient'} className="topnav-logo">
            MediLink
          </Link>

          {/* Nav Links with dropdowns */}
          <div className="topnav-links">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Role-based dropdown example */}
            {user?.role === 'PATIENT' && (
              <div className="nav-item">
                <button className="nav-btn">
                  More <ChevronDown size={14} />
                </button>
                <div className="nav-dropdown">
                  <a href="#">Health Records</a>
                  <a href="#">Prescription History</a>
                  <a href="#">Medication Reminders</a>
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="topnav-right">
            <div className="topnav-user">
              <div className="topnav-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', background: 'var(--blue-light)', color: 'var(--blue)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                {user?.role?.toLowerCase()}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
