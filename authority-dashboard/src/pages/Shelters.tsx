import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Building,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Accessibility,
  Activity,
  Zap,
  ExternalLink,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const Shelters: React.FC = () => {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const data = await apiService.getShelters(districtFilter);
      setShelters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [districtFilter]);

  const filtered = shelters.filter(s =>
    search === '' ||
    s.shelterName?.toLowerCase().includes(search.toLowerCase()) ||
    s.district?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-cyan-500/20 text-cyan-400 text-xs font-black px-2.5 py-0.5 rounded border border-cyan-500/40 uppercase tracking-wider">
              CIVIL DEFENSE INFRASTRUCTURE
            </span>
            <span className="text-slate-400 text-xs font-mono">Karnataka State Relief Network</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Designated Emergency Evacuation Shelters
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            Command centre overview of certified relief shelters equipped with backup diesel generators, medical trauma units, and disabled accessibility.
          </p>
        </div>

        <button
          onClick={fetchShelters}
          className="bg-navy-950 hover:bg-navy-800 text-slate-200 border border-navy-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center transition shadow-sm w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2 text-cyan-400" />
          Refresh Shelter Status
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            District:
          </span>
          {['ALL', 'Kodagu', 'Uttara Kannada', 'Udupi', 'Kalaburagi', 'Bengaluru Urban'].map((d) => (
            <button
              key={d}
              onClick={() => setDistrictFilter(d)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                districtFilter === d
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-navy-950 text-slate-300 hover:bg-navy-850 border border-navy-800'
              }`}
            >
              {d === 'ALL' ? 'All Districts' : d}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shelter name or locality..."
            className="bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Shelters Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
          Querying state shelter telemetry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-navy-900 rounded-2xl border border-navy-800">
          No shelters matched the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s.shelterId}
              className="bg-navy-900 border border-navy-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                      {s.shelterCode}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{s.shelterName}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {s.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{s.address}, <strong>{s.district}</strong></span>
                </p>

                {/* Facilities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {s.isAccessibleDisabled && (
                    <span className="inline-flex items-center text-[10px] bg-navy-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                      <Accessibility className="w-3 h-3 mr-1" /> PwD Accessible
                    </span>
                  )}
                  {s.hasMedicalFacility && (
                    <span className="inline-flex items-center text-[10px] bg-navy-950 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">
                      <Activity className="w-3 h-3 mr-1" /> Medical Wing
                    </span>
                  )}
                  {s.hasBackupPower && (
                    <span className="inline-flex items-center text-[10px] bg-navy-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                      <Zap className="w-3 h-3 mr-1" /> 24/7 Power Backup
                    </span>
                  )}
                </div>

                {s.contactPersonName && (
                  <div className="bg-navy-950 rounded-xl p-3 border border-navy-800 text-xs space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Relief Center Director</span>
                    <strong className="text-white">{s.contactPersonName}</strong>
                    {s.contactPhone && (
                      <p className="text-slate-400 font-mono">{s.contactPhone}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                {s.contactPhone ? (
                  <a
                    href={`tel:${s.contactPhone}`}
                    className="text-slate-300 hover:text-white flex items-center font-semibold"
                  >
                    <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Call Facility
                  </a>
                ) : (
                  <span className="text-slate-500">Official Relief Facility</span>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Map View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
