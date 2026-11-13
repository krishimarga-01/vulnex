import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Building,
  MapPin,
  PhoneCall,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Activity,
  Accessibility,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';

export const CitizenShelters: React.FC = () => {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchShelters() {
      setLoading(true);
      try {
        const data = await apiService.getShelters(districtFilter);
        setShelters(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchShelters();
  }, [districtFilter]);

  const filteredShelters = shelters.filter(s =>
    search === '' ||
    s.shelterName.toLowerCase().includes(search.toLowerCase()) ||
    s.district.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-cyan-400" />
            Designated Government Relief Shelters & Safe Havens
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verified evacuation shelters equipped with auxiliary generators, medical support wings, and disabled accessibility.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-navy-950 text-slate-200 border border-navy-800 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Karnataka Districts</option>
            <option value="Kodagu">Kodagu</option>
            <option value="Uttara Kannada">Uttara Kannada</option>
            <option value="Udupi">Udupi</option>
            <option value="Kalaburagi">Kalaburagi</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shelter by name, district, locality..."
          className="w-full bg-navy-900 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Shelters Grid */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Loading relief shelter telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShelters.map((s) => (
            <div
              key={s.shelterId}
              className="bg-navy-900 border border-navy-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg space-y-4 transition flex flex-col justify-between"
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
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                {s.contactPhone ? (
                  <a
                    href={`tel:${s.contactPhone}`}
                    className="text-slate-300 hover:text-white flex items-center font-semibold"
                  >
                    <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {s.contactPhone}
                  </a>
                ) : (
                  <span className="text-slate-500">24/7 Onsite Wardens</span>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
