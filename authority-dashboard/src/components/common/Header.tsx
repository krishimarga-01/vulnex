import React, { useState, useEffect } from 'react';
import {
  Bell,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Database,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveConnection } from '../../contexts/LiveConnectionContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { status, isDemoMode, toggleDemoMode, lastSyncTime, reconnect } = useLiveConnection();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Live second ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="h-16 bg-navy-900 text-white border-b border-navy-800 px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-md">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-sm">
            VX
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight flex items-center gap-2">
              VULNEX COMMAND CENTRE
              <span className="bg-blue-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                DISASTER AUTHORITY
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Extreme Weather Vulnerability Identification & Emergency Response
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Live Connection & Data Source Pill */}
      <div className="hidden lg:flex items-center space-x-3 bg-navy-800/80 px-3 py-1.5 rounded-full border border-navy-700">
        {/* Status Indicator */}
        {status === 'LIVE' && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>LIVE BACKEND</span>
          </div>
        )}

        {status === 'RECONNECTING' && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold tracking-wide">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>RECONNECTING...</span>
          </div>
        )}

        {status === 'OFFLINE' && (
          <div className="flex items-center space-x-1.5 text-xs text-red-400 font-semibold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>BACKEND OFFLINE</span>
            <button
              onClick={reconnect}
              className="text-[10px] underline ml-1 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {status === 'DEMO' && (
          <div className="flex items-center space-x-1.5 text-xs text-cyan-300 font-semibold tracking-wide">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEMO MODE (SIMULATED DATA)</span>
          </div>
        )}

        <div className="h-3 w-px bg-navy-700" />

        {/* Demo Mode Toggle */}
        <button
          onClick={() => toggleDemoMode(!isDemoMode)}
          className={`text-[11px] font-medium px-2 py-0.5 rounded transition ${
            isDemoMode
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle between live Spring Boot backend and offline demonstration mode"
        >
          {isDemoMode ? 'Switch to Live API' : 'Switch to Demo Mode'}
        </button>

        <div className="h-3 w-px bg-navy-700" />

        {/* Last sync timestamp */}
        <span className="text-[11px] text-slate-400 font-mono">
          Sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Right: Date Time & User Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Switch to Citizen Portal */}
        <a
          href="/citizen"
          className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center transition"
          title="Switch to Citizen Emergency Interface"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1.5" />
          <span className="hidden sm:inline">Citizen</span> Safety Portal
        </a>

        {/* Real-time Clock */}
        <div className="hidden md:flex flex-col text-right">
          <span className="font-mono text-xs font-semibold text-slate-200">
            {formatDateTime(currentTime)}
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider">
            UTC+05:30 (IST)
          </span>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-navy-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 text-navy-900 z-50 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Operational Alerts (2 Active)
                </span>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                  CRITICAL
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <p className="font-semibold text-red-900">RED ALERT: Coastal Sector 4 Heatwave</p>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    Heat index 48.2°C. 124 registered vulnerable individuals impacted.
                  </p>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-100">
                  <p className="font-semibold text-amber-900">SOS Case EC-2026-001 Dispatched</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Mobile Critical Care Unit Alpha en route to Marina Beach Rd.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-navy-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center border border-navy-600 text-amber-400 font-bold text-xs">
              {user ? user.fullName.charAt(0) : 'A'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.fullName || 'Rajesh Sharma'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono leading-none">
                {user?.role?.replace('ROLE_', '') || 'AUTHORITY'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 text-navy-900 z-50 p-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-navy-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect & Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
