import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  LifeBuoy,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
  MapPin
} from 'lucide-react';

export const CitizenMyRequests: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const data = await apiService.getMyEmergencyCases();
      setCases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 3500); // Poll live status every 3.5s!
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Emergency Request Status & Audit Tracking</h2>
            <p className="text-xs text-slate-400">
              Live bi-directional status updates synchronized with Disaster Authority Dispatchers.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCases}
          className="bg-navy-950 hover:bg-navy-800 text-slate-300 px-3 py-1.5 rounded-lg border border-navy-800 text-xs font-semibold flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-amber-400" />
          Retrieving submitted emergency calls...
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Distress Calls</h3>
          <p className="text-xs max-w-md mx-auto">
            You currently have no pending emergency assistance requests. If you require urgent evacuation, press the Emergency SOS button.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id || c.caseNumber}
              className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-black text-white bg-navy-950 px-2.5 py-1 rounded-lg border border-navy-700">
                    #{c.caseNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.emergencyCategory}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Submitted: {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : c.status === 'ASSIGNED'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    STATUS: {c.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-navy-950 p-3 rounded-xl border border-navy-800">
                {c.description}
              </p>

              {/* Progress Timeline */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs py-2">
                {['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((step, idx) => {
                  const order = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
                  const currentIdx = order.indexOf(c.status);
                  const isPastOrCurrent = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition ${
                          isCurrent
                            ? 'bg-amber-500 text-navy-950 ring-4 ring-amber-500/30'
                            : isPastOrCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-navy-950 text-slate-600 border border-navy-800'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-semibold ${isCurrent ? 'text-amber-400 font-bold' : isPastOrCurrent ? 'text-slate-300' : 'text-slate-600'}`}>
                        {step === 'IN_PROGRESS' ? 'RESCUE IN PROGRESS' : step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Assigned Team Info */}
              {c.assignedTeamName && (
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-slate-400">Response Team: </span>
                      <strong className="text-white">{c.assignedTeamName}</strong>
                    </div>
                  </div>
                  {c.assignedTeamPhone && (
                    <a
                      href={`tel:${c.assignedTeamPhone}`}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold inline-flex items-center w-fit"
                    >
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Contact Team
                    </a>
                  )}
                </div>
              )}

              {/* Resolution Details */}
              {c.resolutionDetails && (
                <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200">
                  <strong className="text-emerald-300 block mb-0.5">Resolution & Evacuation Summary:</strong>
                  {c.resolutionDetails}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
