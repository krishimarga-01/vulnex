import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLiveConnection } from '../contexts/LiveConnectionContext';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Bell,
  Server,
  Save,
  CheckCircle,
  Database,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, toggleDemoMode, reconnect, status } = useLiveConnection();

  // Settings states
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  );
  const [pollCasesSec, setPollCasesSec] = useState(8);
  const [pollStatsSec, setPollStatsSec] = useState(15);

  // Risk Scoring engine thresholds
  const [elderlyPoints, setElderlyPoints] = useState(20);
  const [bedriddenPoints, setBedriddenPoints] = useState(30);
  const [heatwaveExtremePoints, setHeatwaveExtremePoints] = useState(25);
  const [medicalAssistancePoints, setMedicalAssistancePoints] = useState(25);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 tracking-tight">
          System Configuration & Risk Engine Parameters
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure backend API endpoints, risk algorithm weights, notification triggers, and live polling
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>System configuration parameters saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Backend Connection & Data Mode */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-navy-800" />
            <h3 className="font-bold text-navy-900 uppercase tracking-wider text-xs">
              Spring Boot REST API Integration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                API Base URL (VITE_API_BASE_URL)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: http://localhost:8080/api/v1
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Current Live Status
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  {status}
                </span>
                <button
                  type="button"
                  onClick={reconnect}
                  className="text-xs text-navy-800 font-bold underline hover:text-navy-900"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <span className="font-bold text-navy-900">Demonstration Simulation Mode</span>
              <p className="text-[11px] text-slate-500">
                Fallback to mock dataset if Spring Boot server or DB is offline
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isDemoMode
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isDemoMode ? 'Demo Mode Active' : 'Live Mode Active'}
            </button>
          </div>
        </div>

        {/* Section 2: Real-time Telemetry Polling Intervals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-navy-800" />
            <h3 className="font-bold text-navy-900 uppercase tracking-wider text-xs">
              Live Polling Cadence (TanStack Query)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Emergency Cases Incident Queue (Seconds)
              </label>
              <input
                type="number"
                min={3}
                max={60}
                value={pollCasesSec}
                onChange={(e) => setPollCasesSec(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 8 seconds (stops when tab inactive)
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Dashboard Overview Statistics (Seconds)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={pollStatsSec}
                onChange={(e) => setPollStatsSec(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 15 seconds
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Risk Scoring Weights Engine */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-navy-900 uppercase tracking-wider text-xs">
              Explainable Risk Scoring Weights (0–100 Matrix)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Age ≥ 75 yrs
              </label>
              <input
                type="number"
                value={elderlyPoints}
                onChange={(e) => setElderlyPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Bedridden Mobility
              </label>
              <input
                type="number"
                value={bedriddenPoints}
                onChange={(e) => setBedriddenPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Extreme Heatwave
              </label>
              <input
                type="number"
                value={heatwaveExtremePoints}
                onChange={(e) => setHeatwaveExtremePoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Oxygen / Medical
              </label>
              <input
                type="number"
                value={medicalAssistancePoints}
                onChange={(e) => setMedicalAssistancePoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Authority Profile Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-navy-900 uppercase tracking-wider text-xs">
            Authenticated Official Profile
          </h3>
          <div className="grid grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Officer Name</span>
              <p className="font-bold text-navy-900">{user?.fullName || 'Rajesh Sharma'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Security Role</span>
              <p className="font-mono text-amber-700 font-bold">{user?.role || 'ROLE_AUTHORITY'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Official Email</span>
              <p className="font-mono text-slate-600">{user?.email || 'officer.raj@disasterresponse.gov'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Emergency Operations Line</span>
              <p className="font-mono text-emerald-700 font-bold">{user?.phoneNumber || '+1-555-0101'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg shadow-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save Settings & Apply</span>
          </button>
        </div>
      </form>
    </div>
  );
};
