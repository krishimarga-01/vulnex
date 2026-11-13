import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { user } = useAuth();
  const [dependents, setDependents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDependents() {
      try {
        const data = await apiService.getMyDependents();
        setDependents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDependents();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-md flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-lg">
          {user?.fullName?.charAt(0) || 'C'}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">{user?.fullName || 'John Doe'}</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
              VERIFIED CITIZEN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Role: {user?.role || 'ROLE_CITIZEN'}</p>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-navy-800 pb-2">
          Contact & Identification Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 flex items-center space-x-3">
            <Mail className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Registered Email</span>
              <strong className="text-white">{user?.email || 'john.citizen@example.com'}</strong>
            </div>
          </div>

          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 flex items-center space-x-3">
            <Phone className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Primary Phone</span>
              <strong className="text-white">{user?.phoneNumber || '+91-9800000093'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Dependents */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-navy-800 pb-2 flex items-center justify-between">
          <span>Registered Family & Dependents ({dependents.length})</span>
          <span className="text-[10px] text-emerald-400 font-mono">PRIORITY PROFILE LINKED</span>
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">Loading linked profiles...</p>
        ) : dependents.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No dependents registered yet. Use the "Register Vulnerability" tab to link elderly family members or children.
          </div>
        ) : (
          <div className="space-y-3">
            {dependents.map((d) => (
              <div
                key={d.id}
                className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-white text-sm">{d.fullName}</strong>
                    <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                      {d.vulnerabilityCategory}
                    </span>
                    <span className="bg-navy-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                      {d.mobilityStatus}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">Age: {d.age} yrs &bull; {d.address}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Calculated Risk Score</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">{d.currentRiskScore || 78.5} / 100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
