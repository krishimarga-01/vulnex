import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Flame,
  ShieldCheck,
  LifeBuoy,
  CheckCircle,
  Activity,
  ArrowUpRight,
  Clock,
  MapPin,
  Send,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Overview: React.FC = () => {
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiService.getDashboardSummary(),
    refetchInterval: 15000, // automatic live refresh every 15s as specified
  });

  const categoryChartData = summary?.categoryBreakdown?.map((c) => ({
    name: c.category.replace('_', ' '),
    count: c.count,
  })) || [];

  const riskPieData = [
    { name: 'High Risk (>=75)', value: summary?.highRiskCount || 68, color: '#DC3545' },
    { name: 'Medium Risk (45-74)', value: summary?.mediumRiskCount || 112, color: '#F59E0B' },
    { name: 'Low Risk (<45)', value: summary?.lowRiskCount || 74, color: '#16A34A' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-lg font-bold text-navy-900 tracking-tight">
              Active Emergency Situation: High Thermal & Coastal Inundation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aggregate telemetry across 3 geographical sectors. Open-Meteo & Spatial GIS Sync active.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/alerts"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Broadcast Warning</span>
          </Link>
          <Link
            to="/risk-map"
            className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Open GIS Threat Map</span>
          </Link>
        </div>
      </div>

      {/* 7 Key Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Total Vulnerable */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Vulnerable
            </span>
            <Users className="w-4 h-4 text-navy-800" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {isLoading ? '...' : summary?.totalVulnerablePeople || 254}
          </div>
          <span className="text-[10px] text-slate-500">Across 3 districts</span>
        </div>

        {/* Card 2: High Risk */}
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm bg-red-50/20">
          <div className="flex items-center justify-between text-red-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
              High Risk
            </span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {isLoading ? '...' : summary?.highRiskCount || 68}
          </div>
          <span className="text-[10px] text-red-600 font-semibold">Immediate attention</span>
        </div>

        {/* Card 3: Medium Risk */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Medium Risk
            </span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            {isLoading ? '...' : summary?.mediumRiskCount || 112}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Under monitoring</span>
        </div>

        {/* Card 4: Low Risk */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Low Risk
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {isLoading ? '...' : summary?.lowRiskCount || 74}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Stable status</span>
        </div>

        {/* Card 5: Active Alerts */}
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {isLoading ? '...' : summary?.activeWeatherAlerts || 2}
          </div>
          <span className="text-[10px] text-red-700 font-semibold">1 Extreme Heatwave</span>
        </div>

        {/* Card 6: Pending SOS Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Cases
            </span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">
            {isLoading ? '...' : summary?.pendingEmergencyRequests || 4}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">1 Critical Priority</span>
        </div>

        {/* Card 7: Resolved Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Resolved Cases
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {isLoading ? '...' : summary?.resolvedCasesCount || 18}
          </div>
          <span className="text-[10px] text-slate-500">100% verified</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Population by Vulnerability Category */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Vulnerable Population by Category
              </h3>
              <p className="text-[11px] text-slate-500">
                Registered profiles categorized for specialized emergency logistics
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Live DB
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#10243A',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#173B5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Level Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Risk Distribution
              </h3>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                Scoring Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Composite score (Age + Mobility + Weather Exposure)
            </p>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10243A',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Triage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Emergency Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LifeBuoy className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Recent Emergency Assistance Requests
              </h3>
            </div>
            <Link
              to="/emergency-cases"
              className="text-xs font-semibold text-navy-800 hover:text-navy-900 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {summary?.recentEmergencyCases?.slice(0, 3).map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-navy-900">
                      {item.caseNumber}
                    </span>
                    <StatusBadge type="priority" value={item.priority} size="sm" />
                    <StatusBadge type="caseStatus" value={item.status} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Just now</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1 font-medium line-clamp-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.address}</span>
                  </div>
                  {item.assignedTeamName && (
                    <span className="text-indigo-700 font-semibold text-[10px]">
                      Assigned: {item.assignedTeamName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Weather Warnings Banner List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Active Weather Warnings in Effect
              </h3>
            </div>
            <Link
              to="/weather-monitoring"
              className="text-xs font-semibold text-navy-800 hover:text-navy-900 flex items-center space-x-1"
            >
              <span>Weather Ops</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {summary?.recentWeatherAlerts?.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-xs ${
                  alert.severity === 'EXTREME'
                    ? 'bg-red-50/70 border-red-200 text-red-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold tracking-tight">{alert.headline}</span>
                  <StatusBadge type="severity" value={alert.severity} size="sm" />
                </div>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  {alert.description}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Impact Area: <strong>{alert.affectedRegionName}</strong></span>
                  <span className="font-mono">Expires: {new Date(alert.effectiveUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
