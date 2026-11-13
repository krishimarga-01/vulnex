import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { WeatherAlert, AlertType, WeatherSeverity, WeatherAlertRequest } from '../types';
import {
  AlertTriangle,
  Radio,
  PlusCircle,
  XCircle,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';

export const EmergencyAlerts: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [alertType, setAlertType] = useState<AlertType>('HEATWAVE');
  const [severity, setSeverity] = useState<WeatherSeverity>('EXTREME');
  const [regionName, setRegionName] = useState('Coastal Ward Sector 4');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');
  const [validHours, setValidHours] = useState(24);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['authority-weather-alerts'],
    queryFn: () => apiService.getActiveWeatherAlerts(),
  });

  const { data: imdWarnings = [] } = useQuery({
    queryKey: ['authority-imd-warnings'],
    queryFn: () => apiService.getImdWarnings(),
    refetchInterval: 30000,
  });

  const { data: imdStatus } = useQuery({
    queryKey: ['authority-imd-status'],
    queryFn: () => apiService.getImdStatus(),
  });

  const syncImdMutation = useMutation({
    mutationFn: () => apiService.syncImdWarnings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-imd-warnings'] });
      queryClient.invalidateQueries({ queryKey: ['authority-imd-status'] });
      queryClient.invalidateQueries({ queryKey: ['authority-weather-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      alert('IMD Early Warnings successfully synchronized from official bulletins (mausam.imd.gov.in).');
    },
  });

  const createMutation = useMutation({
    mutationFn: (req: WeatherAlertRequest) => apiService.createWeatherAlert(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-weather-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsCreateOpen(false);
      resetForm();
      alert('Official disaster weather alert broadcasted to mobile users and emergency agencies.');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiService.deactivateWeatherAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-weather-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const resetForm = () => {
    setHeadline('');
    setDescription('');
    setSafetyInstructions('');
    setValidHours(24);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      alertType,
      severity,
      affectedRegionName: regionName,
      headline,
      description,
      safetyInstructions,
      validHours,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">
            Official Multi-Hazard Alert Broadcasting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast emergency weather bulletins, trigger auto risk reassessments and push alerts to mobile citizens
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Broadcast Official Warning</span>
        </button>
      </div>

      {/* India IMD Early Warning System Monitor */}
      <div className="bg-gradient-to-r from-navy-900 to-indigo-950 rounded-xl p-5 text-white shadow-lg border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-indigo-500/20 rounded-lg shrink-0 border border-indigo-400/30">
              <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                  IMD STATUS: {imdStatus?.status || 'OPERATIONAL'}
                </span>
                <span className="text-xs text-indigo-200 font-mono">Official Source: mausam.imd.gov.in</span>
              </div>
              <h3 className="text-base font-bold mt-1 text-white">
                India Meteorological Department (IMD) Early Warning Feeds
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Centralized telemetry continuously monitoring Indian states & districts for extreme rainfall, flash floods, squalls and heatwaves.
              </p>
            </div>
          </div>

          <button
            onClick={() => syncImdMutation.mutate()}
            disabled={syncImdMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 flex items-center space-x-2 border border-indigo-400/40"
          >
            <Clock className={`w-3.5 h-3.5 ${syncImdMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncImdMutation.isPending ? 'Syncing Feeds...' : 'Sync Live IMD Feeds'}</span>
          </button>
        </div>

        {/* IMD Monitored Warning Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-800/60">
          {imdWarnings.slice(0, 3).map((w: any, idx: number) => (
            <div key={idx} className="bg-navy-950/70 p-3 rounded-lg border border-indigo-700/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{w.district}, {w.state}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  w.colorCode === 'RED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  w.colorCode === 'ORANGE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}>
                  {w.colorCode} ALERT
                </span>
              </div>
              <p className="text-[11px] text-indigo-200 mt-1 line-clamp-1">{w.hazardType || w.description}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-indigo-300">
                <span>Vulnerable Pop: <b>{w.vulnerableCount ?? 6}</b></span>
                <span className="font-mono text-slate-400">Level: {w.warningLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
          Active Warnings in Effect ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No active emergency weather alerts in effect.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                alert.severity === 'EXTREME'
                  ? 'border-red-300 ring-1 ring-red-100'
                  : 'border-amber-300 ring-1 ring-amber-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <StatusBadge type="severity" value={alert.severity} size="sm" />
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {alert.alertCode}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                      TYPE: {alert.alertType}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-navy-900 pt-1">{alert.headline}</h4>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>
                </div>

                <div className="shrink-0 flex md:flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Deactivate warning ${alert.alertCode}?`)) {
                        deactivateMutation.mutate(alert.id);
                      }
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-300 px-3 py-1.5 rounded-lg transition"
                  >
                    Deactivate Alert
                  </button>
                </div>
              </div>

              {/* Safety Instructions callout */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-navy-900 uppercase text-[10px] tracking-wider block mb-1">
                  Public Safety Directives:
                </span>
                <p className="text-slate-800">{alert.safetyInstructions}</p>
              </div>

              {/* Footer Meta */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Sector: {alert.affectedRegionName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid until: {new Date(alert.effectiveUntil).toLocaleString()}</span>
                  </span>
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  Broadcasted by: {alert.issuedByName || 'Disaster Operations Commissioner'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Alert Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Broadcast Extreme Weather Alert"
        maxWidth="xl"
      >
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Hazard Alert Type
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as AlertType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold"
              >
                <option value="HEATWAVE">Extreme Heatwave</option>
                <option value="FLOOD">Flash Flood / River Inundation</option>
                <option value="CYCLONE">Cyclone / High Velocity Gale</option>
                <option value="STORM">Severe Thunderstorm</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as WeatherSeverity)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold text-red-600"
              >
                <option value="EXTREME">EXTREME (Red Alert)</option>
                <option value="SEVERE">SEVERE (Orange Alert)</option>
                <option value="MODERATE">MODERATE (Yellow Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Target Geographical Sector
            </label>
            <select
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold"
            >
              <option value="Coastal Ward Sector 4">Coastal Ward Sector 4 (High Risk)</option>
              <option value="Riverside Lowland Basin">Riverside Lowland Basin (Medium Risk)</option>
              <option value="Upland Hill Plateau">Upland Hill Plateau (Low Risk)</option>
              <option value="Entire Metropolitan District">Entire Metropolitan District</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Alert Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RED ALERT: Critical Heatwave Exceeding 44°C"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold text-navy-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Hazard Description & Risk Impact
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe meteorological parameters and specific risks for vulnerable persons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Public Safety Directives & Shelter Instructions
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Remain in air-conditioned or shaded shelter, drink fluids, medical dispatch active..."
              value={safetyInstructions}
              onChange={(e) => setSafetyInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-navy-900 uppercase tracking-wider mb-1">
              Validity Duration (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={72}
              value={validHours}
              onChange={(e) => setValidHours(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{createMutation.isPending ? 'Broadcasting...' : 'Publish Warning'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
