import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="bg-surface-background text-on-surface font-body-md min-h-screen flex flex-col pt-16">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter-md h-16 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-8">
          <Link to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor' : '/patient'} className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary">
            MediLink
          </Link>
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) => 
                  `text-label-md font-label-md rounded-lg px-2 py-1 transition-all ${
                    isActive 
                      ? 'text-primary dark:text-inverse-primary border-b-2 border-primary dark:border-inverse-primary pb-1 bg-surface-container dark:bg-on-surface-variant/10 opacity-80 scale-95'
                      : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-surface-container dark:hover:bg-on-surface-variant/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-caption font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-label-md font-label-md">{user?.name?.split(' ')[0]}</span>
            <span className="text-caption bg-surface text-primary px-2 py-0.5 rounded-full capitalize">{user?.role?.toLowerCase()}</span>
          </div>
          {user?.role === 'PATIENT' && (
            <button className="hidden md:block text-label-md font-label-md px-4 py-2 text-primary border border-primary rounded-lg hover:bg-surface-container transition-colors">
              Patient Portal
            </button>
          )}
          <button onClick={logout} className="text-label-md font-label-md px-4 py-2 bg-primary text-on-primary rounded-lg hover:brightness-90 transition-all">
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-gutter-md flex flex-col md:flex-row justify-between items-center gap-8 bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline mt-auto">
        <div className="text-headline-sm font-headline-sm font-bold text-primary">MediLink</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="#">Privacy Policy</a>
          <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="#">Terms of Service</a>
          <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="#">Contact Support</a>
          <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:underline decoration-primary" href="#">Clinic Locations</a>
        </div>
        <div className="text-body-md font-body-md text-on-surface-variant dark:text-surface-variant text-center md:text-right">
          © 2024 MediLink Healthcare Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
