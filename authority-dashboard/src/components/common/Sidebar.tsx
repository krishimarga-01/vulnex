import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  CloudRain,
  AlertTriangle,
  LifeBuoy,
  ShieldAlert,
  BarChart3,
  Settings,
  Zap,
  Building,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  pendingCasesCount?: number;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingCasesCount = 2,
  activeAlertsCount = 4,
}) => {
  const navigate = useNavigate();

  const navItems = [
    {
      to: '/',
      label: '1. Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/risk-map',
      label: '2. Risk Monitoring Map',
      icon: MapPin,
      badge: 'GIS LIVE',
      badgeColor: 'bg-emerald-800 text-emerald-200',
    },
    {
      to: '/priority-plan',
      label: '3. Priority & Action Plan',
      icon: Zap,
      badge: 'AI ENGINE',
      badgeColor: 'bg-amber-600 text-white font-black animate-pulse',
    },
    {
      to: '/vulnerable-population',
      label: '4. Vulnerable Population',
      icon: Users,
      badge: '30 Pop',
      badgeColor: 'bg-navy-700 text-slate-200',
    },
    {
      to: '/weather-monitoring',
      label: '5. Weather Monitoring',
      icon: CloudRain,
      badge: null,
    },
    {
      to: '/alerts',
      label: '6. Emergency Alerts (IMD)',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} ACT` : null,
      badgeColor: 'bg-red-600 text-white font-bold',
    },
    {
      to: '/emergency-cases',
      label: '7. Emergency Cases & Triage',
      icon: LifeBuoy,
      badge: pendingCasesCount > 0 ? `${pendingCasesCount} SOS` : null,
      badgeColor: 'bg-red-600 text-white font-bold animate-pulse',
    },
    {
      to: '/shelters',
      label: '8. Evacuation Shelters',
      icon: Building,
      badge: '5 Active',
      badgeColor: 'bg-cyan-800 text-cyan-200',
    },
    {
      to: '/response-teams',
      label: '9. Response Teams',
      icon: ShieldAlert,
      badge: '3 Units',
      badgeColor: 'bg-navy-700 text-slate-200',
    },
    {
      to: '/analytics',
      label: '10. Analytics & Audit',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/settings',
      label: '11. Settings & Config',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 border-r border-navy-800 flex flex-col justify-between shrink-0 select-none shadow-lg">
      <div className="py-4">
        {/* Navigation Category Label */}
        <div className="px-5 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Command Center Modules
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-md font-bold shrink-0 ${
                      item.badgeColor || 'bg-navy-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher: Jump to Citizen Portal */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/60">
        <button
          onClick={() => navigate('/citizen')}
          className="w-full bg-gradient-to-r from-red-600/20 to-amber-500/20 hover:from-red-600/30 hover:to-amber-500/30 border border-red-500/40 rounded-xl p-3 text-left transition group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-300 mb-0.5">
            <span className="flex items-center">
              <HeartHandshake className="w-4 h-4 mr-1.5 text-red-400" />
              Citizen Safety Portal
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-[11px] text-slate-400">
            Citizen registration, live IMD alerts & emergency SOS button.
          </p>
        </button>
      </div>
    </aside>
  );
};
