import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldAlert,
  UserCheck,
  Zap,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';

export const JuryDemoBar: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCitizenPath = location.pathname.startsWith('/citizen');

  const handleQuickLoginCitizen = async () => {
    try {
      await login({
        usernameOrEmail: 'john.citizen@example.com',
        password: 'Password@123'
      });
      navigate('/citizen');
    } catch (e) {
      console.error(e);
      navigate('/citizen');
    }
  };

  const handleQuickLoginAuthority = async () => {
    try {
      await login({
        usernameOrEmail: 'officer.raj@disasterresponse.gov',
        password: 'Password@123'
      });
      navigate('/');
    } catch (e) {
      console.error(e);
      navigate('/');
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-navy-950 to-slate-900 border-b border-navy-700/80 px-4 py-2 text-xs text-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Jury Workflow Title */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
            <Zap className="w-3 h-3 mr-1 text-amber-400" />
            Jury Demo Mode
          </span>
          <span className="hidden md:inline text-slate-400 font-medium">
            Full 10-Step Hackathon Workflow:
          </span>
        </div>

        {/* Center: Step Shortcut Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => {
              if (!user || user.role !== 'ROLE_CITIZEN') {
                handleQuickLoginCitizen();
              } else {
                navigate('/citizen');
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center transition ${
              isCitizenPath && location.pathname === '/citizen'
                ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white border border-navy-700'
            }`}
            title="Step 1: Citizen SOS Distress & Live IMD Alerts"
          >
            <span className="w-4 h-4 rounded-full bg-red-950 text-red-300 flex items-center justify-center text-[10px] mr-1.5 font-bold">1</span>
            Citizen SOS
          </button>

          <ArrowRight className="w-3 h-3 text-slate-500 hidden sm:inline" />

          <button
            onClick={() => {
              if (!user || (user.role !== 'ROLE_AUTHORITY' && user.role !== 'ROLE_ADMIN')) {
                handleQuickLoginAuthority();
              } else {
                navigate('/');
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center transition ${
              !isCitizenPath && location.pathname === '/'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white border border-navy-700'
            }`}
            title="Step 2: Authority Command Overview & Telemetry"
          >
            <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center text-[10px] mr-1.5 font-bold">2</span>
            Command Room
          </button>

          <ArrowRight className="w-3 h-3 text-slate-500 hidden sm:inline" />

          <button
            onClick={() => {
              if (!user || (user.role !== 'ROLE_AUTHORITY' && user.role !== 'ROLE_ADMIN')) {
                handleQuickLoginAuthority().then(() => navigate('/priority-plan'));
              } else {
                navigate('/priority-plan');
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center transition ${
              !isCitizenPath && location.pathname === '/priority-plan'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-navy-800 text-amber-300 hover:bg-navy-700 hover:text-white border border-amber-500/30'
            }`}
            title="Step 3: PostGIS Proximity & Priority Action Engine"
          >
            <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-300 flex items-center justify-center text-[10px] mr-1.5 font-bold">3</span>
            Priority Engine
          </button>

          <ArrowRight className="w-3 h-3 text-slate-500 hidden sm:inline" />

          <button
            onClick={() => {
              if (!user || (user.role !== 'ROLE_AUTHORITY' && user.role !== 'ROLE_ADMIN')) {
                handleQuickLoginAuthority().then(() => navigate('/emergency-cases'));
              } else {
                navigate('/emergency-cases');
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center transition ${
              !isCitizenPath && location.pathname === '/emergency-cases'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white border border-navy-700'
            }`}
            title="Step 4: Dispatch NDRF / SDRF Response Teams"
          >
            <span className="w-4 h-4 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center text-[10px] mr-1.5 font-bold">4</span>
            Team Dispatch
          </button>

          <ArrowRight className="w-3 h-3 text-slate-500 hidden sm:inline" />

          <button
            onClick={() => {
              if (!user || user.role !== 'ROLE_CITIZEN') {
                handleQuickLoginCitizen().then(() => navigate('/citizen/my-requests'));
              } else {
                navigate('/citizen/my-requests');
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center transition ${
              isCitizenPath && location.pathname === '/citizen/my-requests'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white border border-navy-700'
            }`}
            title="Step 5: Verify Live Status Resolution in Citizen App"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 flex items-center justify-center text-[10px] mr-1.5 font-bold">5</span>
            Citizen Live Tracking
          </button>
        </div>

        {/* Right: Instant Quick Logins */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickLoginCitizen}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-700 flex items-center"
            title="Login instantly as citizen John Doe"
          >
            <Users className="w-3 h-3 mr-1 text-emerald-400" />
            Citizen Login
          </button>

          <button
            onClick={handleQuickLoginAuthority}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-700 flex items-center"
            title="Login instantly as Disaster Official Officer Raj"
          >
            <ShieldAlert className="w-3 h-3 mr-1 text-blue-400" />
            Authority Login
          </button>
        </div>
      </div>
    </div>
  );
};
