import React from 'react';
import { RiskLevel, EmergencyStatus, EmergencyPriority, WeatherSeverity } from '../../types';

interface StatusBadgeProps {
  type: 'risk' | 'caseStatus' | 'priority' | 'severity';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  if (type === 'risk') {
    const risk = value as RiskLevel;
    if (risk === 'HIGH') {
      return (
        <span className={`inline-flex items-center rounded-full bg-red-100 text-red-800 border border-red-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse" />
          HIGH RISK
        </span>
      );
    }
    if (risk === 'MEDIUM') {
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          MEDIUM RISK
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
        LOW RISK
      </span>
    );
  }

  if (type === 'priority') {
    const priority = value as EmergencyPriority;
    const styles: Record<EmergencyPriority, string> = {
      CRITICAL: 'bg-red-600 text-white shadow-sm shadow-red-200',
      HIGH: 'bg-red-100 text-red-800 border border-red-300',
      MEDIUM: 'bg-amber-100 text-amber-800 border border-amber-300',
      LOW: 'bg-slate-100 text-slate-800 border border-slate-300',
    };
    return (
      <span className={`inline-flex items-center rounded-md font-mono ${styles[priority] || styles.MEDIUM} ${sizeClasses}`}>
        {priority}
      </span>
    );
  }

  if (type === 'severity') {
    const severity = value as WeatherSeverity;
    const styles: Record<WeatherSeverity, string> = {
      EXTREME: 'bg-red-700 text-white font-bold',
      SEVERE: 'bg-amber-500 text-slate-900 font-bold',
      MODERATE: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    };
    return (
      <span className={`inline-flex items-center rounded-md ${styles[severity] || styles.MODERATE} ${sizeClasses}`}>
        {severity}
      </span>
    );
  }

  if (type === 'caseStatus') {
    const status = value as EmergencyStatus;
    const config: Record<EmergencyStatus, { bg: string; text: string; label: string }> = {
      REPORTED: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'blue', label: 'REPORTED' },
      VERIFIED: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'purple', label: 'VERIFIED' },
      ASSIGNED: { bg: 'bg-amber-100 text-amber-900 border-amber-200', text: 'amber', label: 'TEAM ASSIGNED' },
      IN_PROGRESS: { bg: 'bg-indigo-100 text-indigo-900 border-indigo-200', text: 'indigo', label: 'IN PROGRESS' },
      RESOLVED: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'emerald', label: 'RESOLVED' },
      CLOSED: { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'slate', label: 'CLOSED' },
    };
    const c = config[status] || config.REPORTED;
    return (
      <span className={`inline-flex items-center rounded-full border ${c.bg} ${sizeClasses}`}>
        {c.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded bg-slate-100 text-slate-800 ${sizeClasses}`}>
      {value}
    </span>
  );
};
