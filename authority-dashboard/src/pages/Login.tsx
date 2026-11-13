import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Database,
  HeartHandshake,
  CheckCircle2,
  Mail,
  Phone,
  Radio,
  Zap,
  Sparkles
} from 'lucide-react';
import { useLiveConnection } from '../contexts/LiveConnectionContext';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AUTHORITY' | 'CITIZEN' | 'REGISTER'>('CITIZEN');

  // Login form state
  const [username, setUsername] = useState('john.citizen@example.com');
  const [password, setPassword] = useState('Password@123');

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('Password@123');
  const [regContactName, setRegContactName] = useState('');
  const [regContactPhone, setRegContactPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, quickEnterDemo } = useAuth();
  const { isDemoMode, toggleDemoMode } = useLiveConnection();
  const navigate = useNavigate();

  const handleDirectDemoEntry = async (role: 'CITIZEN' | 'AUTHORITY') => {
    setLoading(true);
    setError(null);
    try {
      await quickEnterDemo(role);
      if (role === 'CITIZEN') {
        navigate('/citizen');
      } else {
        navigate('/');
      }
    } catch {
      if (role === 'CITIZEN') {
        navigate('/citizen');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ usernameOrEmail: username, password });
      if (res.role === 'ROLE_CITIZEN' || res.role === 'ROLE_CAREGIVER' || res.role === 'ROLE_VOLUNTEER') {
        navigate('/citizen');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please verify credentials or switch to Demo Mode.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiService.registerCitizen({
        fullName: regFullName,
        email: regEmail,
        phoneNumber: regPhone,
        password: regPassword,
        emergencyContactName: regContactName,
        emergencyContactPhone: regContactPhone,
      });

      setSuccess('Citizen registered successfully! Logging you in...');
      setTimeout(async () => {
        try {
          await login({ usernameOrEmail: regEmail, password: regPassword });
          navigate('/citizen');
        } catch {
          setActiveTab('CITIZEN');
          setUsername(regEmail);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreFill = (userStr: string, pass = 'Password@123', tab: 'AUTHORITY' | 'CITIZEN' = 'AUTHORITY') => {
    setActiveTab(tab);
    setUsername(userStr);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Graphic Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg bg-navy-900 rounded-3xl shadow-2xl border border-navy-800 overflow-hidden">
        {/* Card Header */}
        <div className="bg-navy-850 p-6 text-center border-b border-navy-800">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-rose-600 flex items-center justify-center text-white mb-3 shadow-lg ring-2 ring-red-500/30 font-black text-xl">
            VX
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            VULNEX LOGIN & ACCESS PORTAL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extreme Weather Vulnerability Identification & Emergency Response System
          </p>
        </div>

        {/* Portal Mode Tabs */}
        <div className="grid grid-cols-3 bg-navy-950 p-1.5 border-b border-navy-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CITIZEN');
              handlePreFill('john.citizen@example.com', 'Password@123', 'CITIZEN');
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'CITIZEN'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Citizen Login
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('AUTHORITY');
              handlePreFill('officer.raj@disasterresponse.gov', 'Password@123', 'AUTHORITY');
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'AUTHORITY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Authority Login
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGISTER')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Register
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* QUICK DEMO MODE (JURY EVALUATION) */}
          <div className="mb-6 p-4 bg-gradient-to-br from-amber-950/70 via-navy-950 to-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-amber-500/30">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Quick Demo Mode (Instant Jury Access)
                  </h3>
                  <p className="text-[10px] text-amber-200/80">
                    Direct passwordless entry • Sandboxed demo identities
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                1-Click Direct
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDirectDemoEntry('CITIZEN')}
                disabled={loading}
                className="p-3 bg-navy-900/90 border border-red-500/50 hover:border-red-400 hover:bg-red-950/40 rounded-xl text-left transition group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-300 uppercase tracking-wide flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-red-400" />
                    Enter Citizen Portal
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-300 mt-1">
                  Identity: <strong className="text-white">John Doe (Citizen)</strong>. Tap to test SOS distress & IMD alerts.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDirectDemoEntry('AUTHORITY')}
                disabled={loading}
                className="p-3 bg-navy-900/90 border border-blue-500/50 hover:border-blue-400 hover:bg-blue-950/40 rounded-xl text-left transition group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Enter Authority Dashboard
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-300 mt-1">
                  Identity: <strong className="text-white">Rajesh Sharma (Authority)</strong>. Triage SOS, assign NDRF teams.
                </p>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-navy-800"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Or Use Standard Login
            </span>
            <div className="flex-grow border-t border-navy-800"></div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab !== 'REGISTER' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {activeTab === 'CITIZEN' ? 'Citizen Email / Username' : 'Official Authority Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="email or username"
                    className="w-full bg-navy-950 text-white pl-9 pr-3 py-2.5 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-navy-950 text-white pl-9 pr-3 py-2.5 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-3 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  activeTab === 'CITIZEN'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${activeTab === 'CITIZEN' ? 'Citizen' : 'Disaster Authority'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Create Password *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={regContactName}
                    onChange={(e) => setRegContactName(e.target.value)}
                    placeholder="Guardian / Family"
                    className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={regContactPhone}
                    onChange={(e) => setRegContactPhone(e.target.value)}
                    placeholder="+91-9876543211"
                    className="w-full bg-navy-950 text-white px-3 py-2 text-xs border border-navy-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Registering...' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-navy-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              1-Click Instant Demo Accounts (For Jury)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePreFill('john.citizen@example.com', 'Password@123', 'CITIZEN')}
                className="p-2 bg-navy-950 border border-navy-800 hover:border-red-500/50 rounded-xl text-left transition"
              >
                <div className="font-bold text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                  Citizen
                </div>
                <div className="text-[10px] text-slate-400 truncate">john.citizen@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('officer.raj@disasterresponse.gov', 'Password@123', 'AUTHORITY')}
                className="p-2 bg-navy-950 border border-navy-800 hover:border-blue-500/50 rounded-xl text-left transition"
              >
                <div className="font-bold text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
                  Authority
                </div>
                <div className="text-[10px] text-slate-400 truncate">officer.raj@disaster...</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('mary.caregiver@example.com', 'Password@123', 'CITIZEN')}
                className="p-2 bg-navy-950 border border-navy-800 hover:border-amber-500/50 rounded-xl text-left transition"
              >
                <div className="font-bold text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                  Caregiver
                </div>
                <div className="text-[10px] text-slate-400 truncate">mary.caregiver@...</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('admin@disasterresponse.gov', 'Password@123', 'AUTHORITY')}
                className="p-2 bg-navy-950 border border-navy-800 hover:border-purple-500/50 rounded-xl text-left transition"
              >
                <div className="font-bold text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5" />
                  Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@disaster...</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
              Password: Password@123
            </p>
          </div>
        </div>

        {/* Footer Demo Mode Switch */}
        <div className="bg-navy-950 px-6 py-3 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mode: {isDemoMode ? 'Demo Simulator' : 'Live Spring Boot'}</span>
          </span>
          <button
            onClick={() => toggleDemoMode(!isDemoMode)}
            className="text-cyan-400 font-semibold hover:underline"
          >
            {isDemoMode ? 'Switch to Live API' : 'Switch to Demo Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
