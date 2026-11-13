import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { JuryDemoBar } from '../components/common/JuryDemoBar';
import { useAuth } from '../contexts/AuthContext';
import { useLiveConnection } from '../contexts/LiveConnectionContext';
import {
  ShieldAlert,
  AlertTriangle,
  HeartHandshake,
  Home,
  BookOpen,
  LifeBuoy,
  User,
  LogOut,
  Radio,
  MapPin,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { status } = useLiveConnection();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/citizen', label: 'Emergency Hub', icon: Home, end: true },
    { to: '/citizen/register-vulnerable', label: 'Register Vulnerability', icon: HeartHandshake },
    { to: '/citizen/my-requests', label: 'Track My SOS', icon: LifeBuoy },
    { to: '/citizen/shelters', label: 'Relief Shelters', icon: MapPin },
    { to: '/citizen/safety', label: 'Safety Guidelines', icon: BookOpen },
    { to: '/citizen/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Jury Demo Workflow Bar */}
      <JuryDemoBar />

      {/* 2. Citizen Portal Main Header */}
      <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Branding & Tagline */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-xl shadow-md ring-2 ring-red-500/30">
                VX
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black tracking-tight text-white">VULNEX</span>
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-wider">
                    CITIZEN SAFETY
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Extreme Weather Vulnerability Identification & Emergency Response
                </p>
              </div>
            </div>

            {/* Middle: Live Connection Status */}
            <div className="hidden md:flex items-center space-x-3 bg-navy-800/80 px-3 py-1.5 rounded-full border border-navy-700">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>STATE DISASTER NETWORK CONNECTED</span>
              </div>
            </div>

            {/* Right: Switch to Authority & User Menu */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="bg-navy-800 hover:bg-navy-700 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-cyan-500/30 flex items-center shadow-sm transition"
                title="Switch to Disaster Management Command Centre"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                <span className="hidden sm:inline">Authority</span> Command Centre
                <ChevronRight className="w-3 h-3 ml-1 text-slate-400" />
              </button>

              {user ? (
                <div className="flex items-center space-x-2 border-l border-navy-700 pl-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.fullName || user.username}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">Citizen Registered</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Citizen Login
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 border-t border-navy-800 scrollbar-none">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center whitespace-nowrap transition ${
                      isActive
                        ? 'bg-red-600/20 text-red-300 border border-red-500/40 font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 3. Main Outlet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* 4. Citizen Emergency Footer */}
      <footer className="bg-navy-950 border-t border-navy-900 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">VULNEX India</span>
            <span>&bull;</span>
            <span>Official IMD Meteorological Grounding</span>
            <span>&bull;</span>
            <span className="text-emerald-400">PostGIS Spatial Engine</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-amber-400 font-semibold flex items-center">
              <PhoneCall className="w-3 h-3 mr-1" />
              National Emergency: 112 / Disaster: 1078
            </span>
            <span>24/7 Monitored Dispatch</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
