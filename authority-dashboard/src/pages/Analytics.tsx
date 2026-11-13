import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Download, FileSpreadsheet, FileText, Printer, CheckCircle, TrendingUp } from 'lucide-react';

const monthlyIncidentsData = [
  { month: 'Jun', heatwave: 14, flood: 4, cyclone: 0, responseTimeMin: 18 },
  { month: 'Jul', heatwave: 22, flood: 8, cyclone: 1, responseTimeMin: 16 },
  { month: 'Aug', heatwave: 19, flood: 18, cyclone: 2, responseTimeMin: 14 },
  { month: 'Sep', heatwave: 12, flood: 26, cyclone: 3, responseTimeMin: 12 },
  { month: 'Oct', heatwave: 8, flood: 34, cyclone: 4, responseTimeMin: 11 },
  { month: 'Nov', heatwave: 28, flood: 12, cyclone: 1, responseTimeMin: 9 },
];

const vulnerabilityByCategory = [
  { name: 'Elderly (75+)', count: 110, color: '#173B5E' },
  { name: 'Infants & Children', count: 48, color: '#2A66A0' },
  { name: 'Disability & Mobility', count: 42, color: '#F59E0B' },
  { name: 'Medical/Oxygen Dependency', count: 28, color: '#DC3545' },
  { name: 'Pregnant Mothers', count: 26, color: '#16A34A' },
];

const regionalVulnerabilityData = [
  { region: 'Coastal Sector 4', highRisk: 64, mediumRisk: 42, lowRisk: 18 },
  { region: 'Riverside Basin', highRisk: 28, mediumRisk: 44, lowRisk: 16 },
  { region: 'Upland Plateau', highRisk: 6, mediumRisk: 16, lowRisk: 20 },
];

export const Analytics: React.FC = () => {
  const exportCSV = () => {
    const headers = 'Month,Heatwaves,Floods,Cyclones,AverageResponseTimeMinutes\n';
    const rows = monthlyIncidentsData
      .map(
        (r) =>
          `${r.month},${r.heatwave},${r.flood},${r.cyclone},${r.responseTimeMin}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'municipal-disaster-analytics-2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">
            Disaster Analytics & Post-Incident Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational benchmarks, response latency trends, vulnerability spatial densities, and compliance reports
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-navy-900 text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportPDF}
            className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Average Response Time
          </span>
          <div className="text-2xl font-extrabold text-navy-900 mt-1">9.4 mins</div>
          <span className="text-[11px] text-emerald-600 font-semibold">↓ 35% faster than benchmark</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Case Resolution Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">94.8%</div>
          <span className="text-[11px] text-slate-500">18 resolved / 22 total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            High-Risk Triage Speed
          </span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">&lt; 3 mins</div>
          <span className="text-[11px] text-slate-500">Auto-escalation rules</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Audit Trail Compliance
          </span>
          <div className="text-2xl font-extrabold text-navy-900 mt-1">100%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Immutable Spring audit logs</span>
        </div>
      </div>

      {/* Row 1: Weather Incident Frequency & Response Time Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
            Extreme Weather Event Frequency (6 Months)
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Heatwaves, flash floods, and cyclonic storm occurrences
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncidentsData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#10243A',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="heatwave" name="Heatwaves" fill="#DC3545" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flood" name="Floods" fill="#2A66A0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cyclone" name="Cyclones" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
            Dispatch to Scene Response Latency (Minutes)
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Average response time declining through automated geospatial routing
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyIncidentsData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#10243A',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responseTimeMin"
                  name="Avg Response Time (Min)"
                  stroke="#16A34A"
                  fill="#DCFCE7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Region-wise Risk Density */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
          Sector Risk Densities Across Jurisdictions
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Breakdown of high, medium, and low risk vulnerable individuals by municipality
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalVulnerabilityData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#10243A',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="highRisk" name="High Risk (Red)" fill="#DC3545" stackId="a" />
              <Bar dataKey="mediumRisk" name="Medium Risk (Orange)" fill="#F59E0B" stackId="a" />
              <Bar dataKey="lowRisk" name="Low Risk (Green)" fill="#16A34A" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
