import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { JuryDemoBar } from '../components/common/JuryDemoBar';
import { useLiveConnection } from '../contexts/LiveConnectionContext';
import { Info, WifiOff } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { isDemoMode, status, toggleDemoMode } = useLiveConnection();

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <JuryDemoBar />
      {/* Persistent DEMO MODE Banner if active */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-cyan-900 via-navy-900 to-cyan-950 text-cyan-200 px-6 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-cyan-800 shadow-inner">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>DEMONSTRATION & SIMULATION MODE ACTIVE:</strong> Using realistic municipal test dataset. All actions, dispatch assignments, and risk reassessments are locally reactive and simulate the Spring Boot REST API.
            </span>
          </div>
          <button
            onClick={() => toggleDemoMode(false)}
            className="underline text-white hover:text-cyan-300 font-bold ml-4"
          >
            Connect to Live Java Backend
          </button>
        </div>
      )}

      {/* Backend Offline Warning Banner */}
      {!isDemoMode && status === 'OFFLINE' && (
        <div className="bg-red-700 text-white px-6 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-white shrink-0 animate-pulse" />
            <span>
              CANNOT REACH SPRING BOOT SERVER AT http://localhost:8080/api/v1. Check that the backend is running.
            </span>
          </div>
          <button
            onClick={() => toggleDemoMode(true)}
            className="bg-white text-red-800 px-2.5 py-1 rounded text-xs font-bold hover:bg-red-50 shadow-sm"
          >
            Switch to Demo Mode
          </button>
        </div>
      )}

      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
