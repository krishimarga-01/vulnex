import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Flame,
  Waves,
  Clock,
  Compass,
  Radio,
} from 'lucide-react';

export const WeatherMonitoring: React.FC = () => {
  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['weather-observations'],
    queryFn: () => apiService.getWeatherObservations(),
    refetchInterval: 12000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['weather-alerts-active'],
    queryFn: () => apiService.getActiveWeatherAlerts(),
  });

  const primaryObservation = observations[0] || {
    regionName: 'Coastal Ward Sector 4',
    temperature: 43.5,
    feelsLike: 48.2,
    humidity: 78,
    precipitation: 0.0,
    windSpeed: 32.0,
    weatherCondition: 'Extreme Heatwave and Coastal Swell',
    recordedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">
            Meteorological Threat Telemetry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time weather station feeds and multi-hazard severity assessments
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-slate-500">Source:</span>
          <span className="font-bold text-navy-900">Open-Meteo & IMD Telemetry</span>
        </div>
      </div>

      {/* Critical Hazard Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-xl p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-white/20 rounded-lg shrink-0">
            <Flame className="w-7 h-7 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white text-red-700 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                Critical Hazard In Progress
              </span>
              <span className="text-xs text-red-100 font-mono">CODE: ALERT-HW-2026-001</span>
            </div>
            <h3 className="text-base font-bold mt-1 text-white">
              RED ALERT: Extreme Heatwave & Humidity Index Exceeding 48°C
            </h3>
            <p className="text-xs text-red-100 mt-0.5 max-w-2xl leading-relaxed">
              Coastal Sector 4 experiencing prolonged hyperthermic index. High mortality danger for elderly, bedridden individuals, and young children.
            </p>
          </div>
        </div>

        <div className="bg-navy-950/60 p-3.5 rounded-lg border border-white/20 text-center shrink-0">
          <div className="text-[10px] uppercase font-bold text-amber-300">Heat Index Felt</div>
          <div className="text-3xl font-extrabold text-white mt-0.5">48.2°C</div>
          <div className="text-[10px] text-red-200 font-medium">Extreme Danger Level</div>
        </div>
      </div>

      {/* Primary Weather Metric Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1: Temp */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Air Temperature
            </span>
            <Thermometer className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {primaryObservation.temperature}°C
          </div>
          <span className="text-[10px] text-red-600 font-semibold">Feels like {primaryObservation.feelsLike}°C</span>
        </div>

        {/* Metric 2: Humidity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Relative Humidity
            </span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {primaryObservation.humidity}%
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">High saturation</span>
        </div>

        {/* Metric 3: Precipitation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Precipitation Rate
            </span>
            <CloudRain className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {primaryObservation.precipitation} mm/h
          </div>
          <span className="text-[10px] text-slate-500">No rain in Coastal sector</span>
        </div>

        {/* Metric 4: Wind Speed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Wind Velocity
            </span>
            <Wind className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {primaryObservation.windSpeed} km/h
          </div>
          <span className="text-[10px] text-slate-500">Gusts up to 45 km/h</span>
        </div>

        {/* Metric 5: Condition */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Atmospheric State
            </span>
            <Compass className="w-4 h-4 text-navy-800" />
          </div>
          <div className="text-sm font-bold text-navy-900 mt-2 line-clamp-1">
            {primaryObservation.weatherCondition}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(primaryObservation.recordedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Regional Sensor Observations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Sector Weather Observations Feed
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Auto-refresh active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">Geographical Sector</th>
                <th className="px-5 py-3">Coordinates</th>
                <th className="px-5 py-3">Temperature / Feels Like</th>
                <th className="px-5 py-3">Rainfall</th>
                <th className="px-5 py-3">Humidity / Wind</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {observations.map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-navy-900">
                    {obs.regionName}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                    {obs.latitude.toFixed(4)}, {obs.longitude.toFixed(4)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-extrabold text-navy-900">{obs.temperature}°C</span>{' '}
                    <span className="text-slate-400 text-[11px]">({obs.feelsLike}°C)</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    {obs.precipitation > 0 ? (
                      <span className="text-blue-600 font-bold">{obs.precipitation} mm</span>
                    ) : (
                      <span className="text-slate-400">0.0 mm</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {obs.humidity}% • {obs.windSpeed} km/h
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">
                    {obs.weatherCondition}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">
                    {new Date(obs.recordedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
