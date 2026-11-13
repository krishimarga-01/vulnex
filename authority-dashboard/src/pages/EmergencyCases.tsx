import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  EmergencyCase,
  EmergencyStatus,
  EmergencyPriority,
  ResponseTeam,
} from '../types';
import {
  LifeBuoy,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  Shield,
  ArrowRight,
  Filter,
  UserCheck,
  Radio,
  FileCheck,
} from 'lucide-react';

export const EmergencyCases: React.FC = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Auto-polling emergency cases every 8s as per requirement #6
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['emergency-cases-list'],
    queryFn: () => apiService.getEmergencyCases(),
    refetchInterval: 8000,
  });

  const { data: responseTeams = [] } = useQuery({
    queryKey: ['response-teams'],
    queryFn: () => apiService.getResponseTeams(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: EmergencyStatus; notes?: string }) =>
      apiService.updateEmergencyCaseStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-cases-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ caseId, teamId, notes }: { caseId: number; teamId: number; notes?: string }) =>
      apiService.assignResponseTeam(caseId, teamId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-cases-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsAssignOpen(false);
      setAssignmentNotes('');
      alert('Emergency response team assigned and dispatched.');
    },
  });

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleOpenAssign = (c: EmergencyCase) => {
    setSelectedCase(c);
    setIsAssignOpen(true);
  };

  const handleOpenResolve = (c: EmergencyCase) => {
    setSelectedCase(c);
    setIsResolveOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    assignMutation.mutate({
      caseId: selectedCase.id,
      teamId: selectedTeamId,
      notes: assignmentNotes,
    });
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    statusMutation.mutate({
      id: selectedCase.id,
      status: 'RESOLVED',
      notes: resolutionNotes,
    });
    setIsResolveOpen(false);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-navy-900 tracking-tight">
              Emergency Dispatch & Incident Triage
            </h2>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
              LIVE INGESTION (8s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency incident queue with status lifecycle management and responder team dispatch
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Incidents' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium text-[11px]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none bg-slate-50 font-semibold"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Incident Cards / Queue */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No emergency cases found matching current filters.
          </div>
        ) : (
          filteredCases.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                c.priority === 'CRITICAL'
                  ? 'border-red-300 ring-1 ring-red-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Case Left Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                      {c.caseNumber}
                    </span>
                    <StatusBadge type="priority" value={c.priority} size="sm" />
                    <StatusBadge type="caseStatus" value={c.status} size="sm" />
                    <span className="text-[10px] text-slate-500 font-bold bg-navy-50 text-navy-800 px-2 py-0.5 rounded">
                      {c.emergencyCategory.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{c.address}</span>
                    </span>

                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </span>

                    {c.reporterName && (
                      <span className="text-slate-600">
                        Reporter: <strong>{c.reporterName}</strong> ({c.reporterPhone})
                      </span>
                    )}

                    {c.affectedPersonName && (
                      <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        Subject: {c.affectedPersonName}
                      </span>
                    )}
                  </div>

                  {c.assignedTeamName && (
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs flex items-center justify-between text-indigo-950">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold">Assigned Unit: {c.assignedTeamName}</span>
                          <span className="text-[11px] text-indigo-700 ml-2">({c.assignedTeamPhone})</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded">
                        DISPATCH ACTIVE
                      </span>
                    </div>
                  )}

                  {c.resolutionNotes && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-950">
                      <strong>Resolution Notes:</strong> {c.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Case Action Controls */}
                <div className="shrink-0 flex lg:flex-col items-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                  {c.status === 'REPORTED' && (
                    <>
                      <button
                        onClick={() => statusMutation.mutate({ id: c.id, status: 'VERIFIED' })}
                        className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Verify Incident
                      </button>
                      <button
                        onClick={() => handleOpenAssign(c)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Dispatch Team
                      </button>
                    </>
                  )}

                  {c.status === 'VERIFIED' && (
                    <button
                      onClick={() => handleOpenAssign(c)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Assign Response Team
                    </button>
                  )}

                  {c.status === 'ASSIGNED' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: c.id, status: 'IN_PROGRESS' })}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {c.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleOpenResolve(c)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Record Resolution
                    </button>
                  )}

                  {c.status === 'RESOLVED' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: c.id, status: 'CLOSED' })}
                      className="text-slate-500 hover:text-navy-900 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Close Case
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Team Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign Response Team: ${selectedCase?.caseNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Select Available Emergency Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold text-navy-900"
            >
              {responseTeams.map((team) => (
                <option key={team.id} value={team.id} disabled={!team.isAvailable}>
                  {team.teamName} ({team.teamType}) - {team.isAvailable ? 'AVAILABLE' : 'BUSY'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Dispatch Instructions & Medical Equipment Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Carry portable battery backup and pediatric oxygen cylinders..."
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Case Modal */}
      <Modal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        title={`Resolve Incident: ${selectedCase?.caseNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Incident Resolution Summary
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail medical evacuation outcome, patient destination, or relief delivered..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsResolveOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
            >
              Mark Resolved
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
