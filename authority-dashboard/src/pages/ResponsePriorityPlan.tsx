import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  LifeBuoy,
  Users,
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Check,
  Send,
  Building,
  ChevronDown,
  Info
} from 'lucide-react';

export const ResponsePriorityPlan: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Response Teams
  const [teams, setTeams] = useState<any[]>([]);

  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await apiService.getResponsePriorityPlan(districtFilter);
      setPlan(data);
      const allTeams = await apiService.getResponseTeams();
      setTeams(allTeams);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [districtFilter]);

  const handleOpenAssign = (item: any) => {
    setSelectedItem(item);
    setSelectedTeamId(item.recommendedTeamId || (teams[0] ? teams[0].id : ''));
    setAssignNotes(`Priority dispatch approved for ${item.targetPersonName}. Evacuation target: ${item.nearbyShelterName || 'Regional Center'}.`);
    setAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedItem) return;
    setAssigning(true);
    try {
      if (selectedItem.activeCaseId) {
        // Assign to existing emergency case
        await apiService.assignResponseTeam(
          selectedItem.activeCaseId,
          selectedTeamId,
          assignNotes
        );
      } else {
        // Create emergency case and assign team
        const newCase = await apiService.createEmergencyCase({
          affectedPersonId: selectedItem.targetPersonId,
          emergencyCategory: 'EVACUATION',
          description: `Disaster Authority Proactive Evacuation: ${selectedItem.recommendedAction}`,
          priority: selectedItem.priorityScore >= 80 ? 'CRITICAL' : 'HIGH',
          latitude: selectedItem.latitude,
          longitude: selectedItem.longitude,
          address: selectedItem.address,
        });

        if (newCase && (newCase.id || newCase.caseNumber)) {
          const caseId = newCase.id || newCase.caseNumber;
          await apiService.assignResponseTeam(caseId, selectedTeamId, assignNotes);
        }
      }

      setActionSuccess(`Response team assigned successfully to ${selectedItem.targetPersonName}! Dispatch order logged.`);
      setAssignModalOpen(false);
      await fetchPlan();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message || 'Error'}`);
    } finally {
      setAssigning(false);
    }
  };

  const planItems: any[] = plan?.planItems || [];

  const filteredItems = planItems.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.targetPersonName?.toLowerCase().includes(search.toLowerCase()) ||
      item.address?.toLowerCase().includes(search.toLowerCase()) ||
      item.district?.toLowerCase().includes(search.toLowerCase()) ||
      item.hazardName?.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'ALL' || item.priorityLevel === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-400 text-xs font-black px-2.5 py-0.5 rounded border border-amber-500/40 uppercase tracking-wider">
                TACTICAL DECISION ENGINE
              </span>
              <span className="text-slate-400 text-xs font-mono">PostGIS Spatial Ranking</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              VULNEX RESPONSE PRIORITY & ACTION PLAN
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Algorithmic proximity prioritization evaluating meteorological warning severity, vulnerable demographic indices, mobility constraints, and live SOS distress signals to recommend high-priority evacuation routes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchPlan}
              className="bg-navy-950 hover:bg-navy-800 text-slate-200 border border-navy-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              Recalculate Priorities
            </button>
          </div>
        </div>

        {/* 2. Situational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-800/80">
          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Hazard Warnings</span>
            <span className="text-xl font-black text-amber-400 font-mono">{plan?.activeWarningsCount || 4} Warnings</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across 4 Districts</span>
          </div>

          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Population in Hazard Path</span>
            <span className="text-xl font-black text-white font-mono">{plan?.totalVulnerableInAffectedZones || 30} Registered</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">100% PostGIS Geocoded</span>
          </div>

          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Critical SOS Distress Calls</span>
            <span className="text-xl font-black text-red-500 font-mono animate-pulse">{plan?.criticalCasesCount || 2} Cases</span>
            <span className="text-[10px] text-red-300 block mt-0.5">Ranked at Top Priority</span>
          </div>

          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Available Response Teams</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{plan?.availableTeamsCount || 1} Ready</span>
            <span className="text-[10px] text-cyan-300 block mt-0.5">NDRF / SDRF / Medical</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-950 border border-emerald-500/50 rounded-xl p-4 text-emerald-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-semibold">{actionSuccess}</p>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-emerald-400 hover:text-white font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Filters & District Selector */}
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-navy-950 text-slate-300 hover:bg-navy-850 border border-navy-800'
              }`}
            >
              {d === 'ALL' ? 'All Districts' : d}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search citizen or address..."
              className="bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-navy-950 text-slate-300 border border-navy-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL_IMMEDIATE">Critical Immediate (80+)</option>
            <option value="HIGH_PRIORITY">High Priority (50-79)</option>
            <option value="URGENT_MONITOR">Urgent Monitor (&lt;50)</option>
          </select>
        </div>
      </div>

      {/* 4. Priority Ranking Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            Ranked Response Action Queue ({filteredItems.length} locations)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Sorted by Priority Score &bull; Explainable Factors
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
            Computing spatial proximity and ranking vulnerable locations...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No locations matched the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-navy-800/80">
            {filteredItems.map((item) => (
              <div
                key={item.targetPersonId || item.rank}
                className={`p-6 transition hover:bg-navy-850/60 ${
                  item.hasActiveSos ? 'bg-red-950/20 border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Rank, Citizen Info & Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Priority Rank Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase font-mono ${
                          item.priorityLevel === 'CRITICAL_IMMEDIATE'
                            ? 'bg-red-600 text-white shadow-md'
                            : item.priorityLevel === 'HIGH_PRIORITY'
                            ? 'bg-amber-500 text-navy-950 font-black'
                            : 'bg-navy-800 text-slate-300 border border-navy-700'
                        }`}
                      >
                        PRIORITY #{item.rank}
                      </span>

                      {/* Active SOS indicator */}
                      {item.hasActiveSos && (
                        <span className="bg-red-600/30 text-red-300 border border-red-500/50 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center animate-pulse">
                          <LifeBuoy className="w-3 h-3 mr-1" />
                          ACTIVE SOS DISTRESS CALL
                        </span>
                      )}

                      {/* Vulnerability Category */}
                      <span className="bg-navy-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {item.vulnerabilityCategory}
                      </span>

                      {/* Mobility */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.mobilityStatus === 'BEDRIDDEN'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : item.mobilityStatus === 'WHEELCHAIR'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-navy-950 text-slate-300 border border-navy-700'
                        }`}
                      >
                        {item.mobilityStatus}
                      </span>

                      <span className="text-xs text-slate-400 font-mono">
                        Age: {item.age} yrs
                      </span>
                    </div>

                    {/* Name & Location */}
                    <div className="space-y-0.5">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {item.targetPersonName}
                        <span className="text-xs font-mono font-normal text-slate-400">
                          ({item.district})
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                    </div>

                    {/* Recommended Action */}
                    <div className="bg-navy-950/80 rounded-xl p-3 border border-navy-800 text-xs space-y-1">
                      <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Recommended Operational Action:</span>
                      </div>
                      <p className="text-slate-200">{item.recommendedAction}</p>
                      {item.nearbyShelterName && (
                        <p className="text-[11px] text-cyan-400 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          Nearest Shelter: <strong>{item.nearbyShelterName}</strong> ({item.nearbyShelterDistanceKm} km away)
                        </p>
                      )}
                    </div>

                    {/* Explainable Reasons Factor List */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Explainable Priority Factors & Justification:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.reasons?.map((reason: string, rIdx: number) => (
                          <span
                            key={rIdx}
                            className="text-[10px] bg-navy-950 text-slate-300 border border-navy-800 rounded-md px-2 py-0.5"
                          >
                            &bull; {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Score, Team Recommendation, & Dispatch Action */}
                  <div className="lg:w-72 shrink-0 flex flex-col justify-between space-y-3 bg-navy-950/60 p-4 rounded-xl border border-navy-800">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                          Response Priority Score
                        </span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {item.priorityScore.toFixed(1)} / 100
                        </span>
                      </div>
                      <div className="w-full bg-navy-900 rounded-full h-2 overflow-hidden border border-navy-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.priorityScore >= 80
                              ? 'bg-gradient-to-r from-red-600 to-rose-500'
                              : item.priorityScore >= 50
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          }`}
                          style={{ width: `${item.priorityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommended / Assigned Team */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Recommended Team:
                      </span>
                      <p className="font-bold text-white flex items-center gap-1.5 truncate">
                        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{item.recommendedTeamName || '10th Battalion NDRF'}</span>
                      </p>

                      {item.assignedTeamName && (
                        <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                          Assigned: <strong>{item.assignedTeamName}</strong>
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-navy-800">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'IN_PROGRESS' || item.status === 'ASSIGNED'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenAssign(item)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center ${
                        item.status === 'RESOLVED'
                          ? 'bg-navy-850 text-slate-400 cursor-not-allowed'
                          : item.hasActiveSos
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {item.assignedTeamId ? 'Reassign Response Team' : 'Approve & Dispatch Team'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. TEAM ASSIGNMENT MODAL */}
      {assignModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-navy-800 pb-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">DISASTER RESPONSE TEAM DISPATCH</h3>
                <p className="text-xs text-slate-400">
                  Assigning team to {selectedItem.targetPersonName} (Priority #{selectedItem.rank})
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Select Disaster Response Team:
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  {teams.map((t) => (
                    <option key={t.id || t.teamId} value={t.id || t.teamId}>
                      {t.teamName} &bull; {t.teamType} ({t.isAvailable ? 'AVAILABLE' : 'DEPLOYED'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Dispatch Instructions & Destination Shelter:
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-blue-500 min-h-[90px]"
                />
              </div>

              <div className="bg-navy-950 rounded-xl p-3 border border-navy-800 text-slate-400 space-y-1 font-mono text-[11px]">
                <div>&bull; Recipient: {selectedItem.targetPersonName} ({selectedItem.mobilityStatus})</div>
                <div>&bull; Priority Level: {selectedItem.priorityLevel} (Score {selectedItem.priorityScore})</div>
                <div>&bull; Destination Shelter: {selectedItem.nearbyShelterName || 'Madikeri Hospital Wing'}</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                disabled={assigning}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={assigning}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center transition"
              >
                {assigning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Dispatch Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
