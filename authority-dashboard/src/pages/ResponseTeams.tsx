import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { ResponseTeam, TeamType } from '../types';
import {
  ShieldAlert,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  PlusCircle,
  Users,
  Activity,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const ResponseTeams: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamType, setNewTeamType] = useState<TeamType>('RESCUE');
  const [newTeamPhone, setNewTeamPhone] = useState('');
  const [newBaseLocation, setNewBaseLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState(10);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['response-teams-all'],
    queryFn: () => apiService.getResponseTeams(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => apiService.toggleTeamAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['response-teams-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Response team ${newTeamName} registered into Municipal Dispatch system.`);
    setIsAddOpen(false);
    setNewTeamName('');
    setNewTeamPhone('');
    setNewBaseLocation('');
  };

  const getTeamIcon = (type: TeamType) => {
    switch (type) {
      case 'MEDICAL':
        return HeartPulse;
      case 'EVACUATION':
        return Truck;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">
            Emergency Response & Tactical Rescue Teams
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet readiness, paramedic squads, disaster rescue personnel, and transport units
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Register New Response Unit</span>
        </button>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teams.map((team) => {
          const Icon = getTeamIcon(team.teamType);
          return (
            <div
              key={team.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition flex flex-col justify-between ${
                team.isAvailable ? 'border-slate-200' : 'border-slate-200 opacity-75 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-navy-900">
                    <Icon className="w-5 h-5 text-navy-800" />
                  </div>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      team.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {team.isAvailable ? 'ONLINE & READY' : 'ON ACTIVE MISSION'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-navy-900 mt-3">{team.teamName}</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  CATEGORY: {team.teamType}
                </span>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Base: <strong>{team.baseLocationName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-800 font-bold">{team.contactPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Crew / Transport Capacity: <strong>{team.currentCapacity} persons</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer Toggle */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Availability Toggle</span>
                <button
                  onClick={() => toggleMutation.mutate(team.id)}
                  className={`text-xs font-bold px-3 py-1 rounded transition ${
                    team.isAvailable
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {team.isAvailable ? 'Set Busy' : 'Set Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Team Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Emergency Response Unit"
        maxWidth="md"
      >
        <form onSubmit={handleAddTeam} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Unit / Fleet Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rapid Water Rescue Squad 4"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Specialized Discipline
              </label>
              <select
                value={newTeamType}
                onChange={(e) => setNewTeamType(e.target.value as TeamType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold"
              >
                <option value="RESCUE">Search & Rescue</option>
                <option value="MEDICAL">Medical & Paramedic</option>
                <option value="EVACUATION">Evacuation Transport</option>
                <option value="GENERAL">General Support</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Crew / Vehicle Capacity
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Emergency Contact Hotline
            </label>
            <input
              type="tel"
              required
              placeholder="+1-555-0000"
              value={newTeamPhone}
              onChange={(e) => setNewTeamPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Base Station / Depot Location
            </label>
            <input
              type="text"
              required
              placeholder="e.g. North Coast Fire & Rescue Station"
              value={newBaseLocation}
              onChange={(e) => setNewBaseLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg shadow"
            >
              Register Unit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
