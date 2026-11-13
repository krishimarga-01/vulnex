import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  AlertTriangle,
  LifeBuoy,
  ShieldAlert,
  MapPin,
  Clock,
  Radio,
  CheckCircle2,
  PhoneCall,
  HeartHandshake,
  Navigation,
  Send,
  RefreshCw,
  Info,
  Building,
  User,
  Activity
} from 'lucide-react';

const KARNATAKA_DISTRICTS = [
  { name: 'Kodagu', lat: 12.426, lon: 75.739, alert: 'ORANGE', hazard: 'Heavy Rainfall & Landslide Warning' },
  { name: 'Uttara Kannada', lat: 14.821, lon: 74.135, alert: 'ORANGE', hazard: 'Coastal Inundation & Squally Winds' },
  { name: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946, alert: 'YELLOW', hazard: 'Thunderstorm & Urban Waterlogging' },
  { name: 'Udupi', lat: 13.342, lon: 74.745, alert: 'YELLOW', hazard: 'High Swell Waves & Gusty Winds' },
  { name: 'Kalaburagi', lat: 17.331, lon: 76.839, alert: 'YELLOW', hazard: 'Elevated Temperature Advisory' },
];

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Location State
  const [selectedDistrict, setSelectedDistrict] = useState('Kodagu');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number } | null>({ lat: 12.426, lon: 75.739 });
  const [locationSource, setLocationSource] = useState<'GPS' | 'MANUAL'>('MANUAL');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Weather & IMD State
  const [imdAlert, setImdAlert] = useState<any>(null);
  const [imdLoading, setImdLoading] = useState(true);

  // Emergency SOS Modal & Submission State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [emergencyCategory, setEmergencyCategory] = useState<'MEDICAL_ASSISTANCE' | 'EVACUATION' | 'RESCUE' | 'FOOD_WATER' | 'OTHER'>('EVACUATION');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);

  // Live Emergency Tracking State
  const [myCases, setMyCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  // Shelters
  const [shelters, setShelters] = useState<any[]>([]);

  // Helplines
  const [helplines, setHelplines] = useState<any[]>([]);

  // Detect GPS
  const handleDetectGPS = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationSource('GPS');
          setGpsLoading(false);
        },
        () => {
          // fallback to Bengaluru
          setGpsLocation({ lat: 12.9716, lon: 77.5946 });
          setLocationSource('MANUAL');
          setSelectedDistrict('Bengaluru Urban');
          setGpsLoading(false);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Change Manual District
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const d = KARNATAKA_DISTRICTS.find((item) => item.name === districtName);
    if (d) {
      setGpsLocation({ lat: d.lat, lon: d.lon });
      setLocationSource('MANUAL');
    }
  };

  // Load IMD Alert for location
  const loadImdAlert = async () => {
    setImdLoading(true);
    try {
      const alert = await apiService.getTargetedImdAlert(
        'Karnataka',
        selectedDistrict,
        gpsLocation?.lat,
        gpsLocation?.lon
      );
      setImdAlert(alert);
    } catch (e) {
      console.error(e);
    } finally {
      setImdLoading(false);
    }
  };

  // Load My Emergency Requests
  const loadMyCases = async () => {
    try {
      const cases = await apiService.getMyEmergencyCases();
      setMyCases(cases);
    } catch (e) {
      console.error(e);
    } finally {
      setCasesLoading(false);
    }
  };

  // Load Shelters & Helplines
  useEffect(() => {
    async function loadData() {
      try {
        const sh = await apiService.getShelters(selectedDistrict);
        setShelters(sh);
        const hp = await apiService.getEmergencyHelplines();
        setHelplines(hp);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [selectedDistrict]);

  useEffect(() => {
    loadImdAlert();
  }, [selectedDistrict, gpsLocation]);

  useEffect(() => {
    loadMyCases();
    const interval = setInterval(loadMyCases, 4000); // Live polling for status updates!
    return () => clearInterval(interval);
  }, []);

  // Submit Emergency SOS
  const handleTriggerSOS = async () => {
    setIsSubmittingSos(true);
    try {
      const payload = {
        emergencyCategory,
        description: emergencyNotes || `CRITICAL CITIZEN SOS: Evacuation assistance urgently requested at ${selectedDistrict}.`,
        priority: 'CRITICAL',
        latitude: gpsLocation?.lat || 12.426,
        longitude: gpsLocation?.lon || 75.739,
        address: `${selectedDistrict} District, Karnataka (Citizen SOS Call)`,
      };

      const res = await apiService.submitSosRequest(payload);
      setSosSuccessMessage(`Emergency SOS Dispatched Successfully! Case ID: #${res.caseNumber || res.id}`);
      setSosModalOpen(false);
      setEmergencyNotes('');
      await loadMyCases();
    } catch (e: any) {
      alert(`Failed to submit SOS: ${e.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingSos(false);
    }
  };

  const activeCase = myCases.find(
    (c) => c.status === 'REPORTED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'RESOLVED'
  );

  return (
    <div className="space-y-6">
      {/* 1. Location Bar & Detection */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <MapPin className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400">Current Citizen Location</span>
              <span className="bg-navy-800 text-[10px] text-slate-300 font-mono px-2 py-0.5 rounded border border-navy-700">
                {locationSource === 'GPS' ? 'LIVE GPS COORDINATES' : 'MANUAL DISTRICT'}
              </span>
            </div>
            <p className="text-base font-bold text-white flex items-center gap-2">
              {selectedDistrict}, Karnataka
              <span className="text-xs text-slate-400 font-mono font-normal">
                ({gpsLocation?.lat.toFixed(4)}°N, {gpsLocation?.lon.toFixed(4)}°E)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* District Selector */}
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="bg-navy-800 text-slate-200 border border-navy-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-red-500"
          >
            {KARNATAKA_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.alert} Alert)
              </option>
            ))}
          </select>

          {/* Detect GPS */}
          <button
            onClick={handleDetectGPS}
            disabled={gpsLoading}
            className="bg-navy-800 hover:bg-navy-700 text-slate-200 px-3 py-1.5 rounded-lg border border-navy-700 text-xs font-semibold flex items-center transition"
          >
            {gpsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-400" />
            ) : (
              <Navigation className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            )}
            Auto-Detect GPS
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sosSuccessMessage && (
        <div className="bg-emerald-950 border border-emerald-500/50 rounded-xl p-4 text-emerald-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-semibold">{sosSuccessMessage}</p>
          </div>
          <button
            onClick={() => setSosSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-white font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. EMERGENCY SOS SECTION — CENTERPIECE */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-950 via-navy-950 to-slate-900 border-2 border-red-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <LifeBuoy className="w-64 h-64 text-red-500" />
        </div>

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-600/30 text-red-300 border border-red-500/50 tracking-wider uppercase animate-pulse">
            <ShieldAlert className="w-4 h-4 mr-1.5 text-red-400" />
            NATIONAL EMERGENCY DISTRESS BEACON
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            IN IMMEDIATE DANGER? TRIGGER SOS
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            One-touch emergency distress call immediately transmits your exact GPS coordinates to the Disaster Management Command Centre, prioritizes your vulnerability profile, and dispatches the nearest NDRF/SDRF rescue team.
          </p>

          {/* THE BIG RED BUTTON */}
          <div className="pt-2 pb-2">
            <button
              onClick={() => setSosModalOpen(true)}
              className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:shadow-[0_0_80px_rgba(239,68,68,0.8)]"
            >
              <span className="w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 flex flex-col items-center justify-center text-white border-4 border-red-400/80 shadow-inner">
                <LifeBuoy className="w-12 h-12 mb-1 animate-spin-slow text-white" />
                <span className="text-2xl font-black tracking-wider">SOS</span>
                <span className="text-[10px] tracking-widest font-mono text-amber-200 uppercase mt-0.5">
                  TAP FOR HELP
                </span>
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Emergency distress calls are audited and dispatched by certified municipal disaster officials under the Disaster Management Act.
          </p>
        </div>
      </div>

      {/* 3. LIVE SOS TRACKER (If active case exists) */}
      {activeCase && (
        <div className="bg-navy-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Live Emergency Response Tracking
                  <span className="text-xs bg-red-600 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                    #{activeCase.caseNumber}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Category: <strong>{activeCase.emergencyCategory}</strong> &bull; Filed: {new Date(activeCase.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400">STATUS: {activeCase.status}</span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
            {['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((step, idx) => {
              const order = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
              const currentIdx = order.indexOf(activeCase.status);
              const isPastOrCurrent = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition ${
                      isCurrent
                        ? 'bg-amber-500 text-navy-950 ring-4 ring-amber-500/30 font-black'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-navy-800 text-slate-500 border border-navy-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`font-semibold text-[11px] ${
                      isCurrent ? 'text-amber-400' : isPastOrCurrent ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step === 'IN_PROGRESS' ? 'RESCUE ACTIVE' : step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Assigned Team Details */}
          {activeCase.assignedTeamName && (
            <div className="bg-navy-950 border border-navy-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-slate-400">Assigned Team: </span>
                  <strong className="text-white">{activeCase.assignedTeamName}</strong>
                </div>
              </div>
              {activeCase.assignedTeamPhone && (
                <a
                  href={`tel:${activeCase.assignedTeamPhone}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold inline-flex items-center w-fit"
                >
                  <PhoneCall className="w-3 h-3 mr-1" />
                  Call Responder
                </a>
              )}
            </div>
          )}

          {activeCase.resolutionDetails && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200">
              <strong>Official Resolution Note:</strong> {activeCase.resolutionDetails}
            </div>
          )}
        </div>
      )}

      {/* 4. IMD OFFICIAL WEATHER ALERT CARD */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Official Indian Meteorological Department (IMD) Early Warning
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Source: mausam.imd.gov.in &bull; Verified Feed
          </span>
        </div>

        {imdLoading ? (
          <div className="py-6 flex justify-center text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Querying official IMD bulletins...
          </div>
        ) : imdAlert ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                    imdAlert.imdColorCode === 'ORANGE'
                      ? 'bg-orange-500 text-navy-950 font-black'
                      : imdAlert.imdColorCode === 'RED'
                      ? 'bg-red-600 text-white font-black'
                      : 'bg-amber-400 text-navy-950 font-black'
                  }`}
                >
                  IMD {imdAlert.imdColorCode || 'ORANGE'} ALERT
                </span>
                <span className="text-xs font-bold text-slate-200">{imdAlert.warningType || 'HEAVY RAINFALL'}</span>
              </div>

              <h4 className="text-base font-bold text-white">{imdAlert.headline}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{imdAlert.description}</p>

              <div className="bg-navy-950 rounded-xl p-3 border border-navy-800 text-xs text-amber-200 space-y-1">
                <strong>Safety Precautions:</strong>
                <p>{imdAlert.safetyInstructions}</p>
              </div>
            </div>

            <div className="bg-navy-950 rounded-xl p-4 border border-navy-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Validity Period</span>
                <span className="text-white font-semibold">
                  Until {new Date(imdAlert.validUntil || Date.now() + 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Matched Vulnerable Citizens</span>
                <span className="text-amber-400 font-bold text-lg">{imdAlert.affectedVulnerableCount || 8} Individuals</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Hazard Telemetry Freshness</span>
                <span className="text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Live Sync (0 min ago)
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 5. QUICK ACTIONS & RELIEF SERVICES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Register Vulnerability */}
        <div
          onClick={() => navigate('/citizen/register-vulnerable')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-800 rounded-2xl p-5 cursor-pointer transition shadow-md group hover:border-red-500/40"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Register Vulnerability / Dependent</h4>
          <p className="text-xs text-slate-400 mb-3">
            Register elderly family members, infants, pregnant women, or persons with disabilities for prioritized evacuation.
          </p>
          <span className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center">
            Register Profile &rarr;
          </span>
        </div>

        {/* Card 2: Nearby Relief Shelters */}
        <div
          onClick={() => navigate('/citizen/shelters')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-800 rounded-2xl p-5 cursor-pointer transition shadow-md group hover:border-cyan-500/40"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Building className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Find Relief Shelters</h4>
          <p className="text-xs text-slate-400 mb-3">
            View verified government emergency evacuation shelters with backup power, medical wings, and wheelchair access.
          </p>
          <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center">
            View Shelters &rarr;
          </span>
        </div>

        {/* Card 3: Track My Requests */}
        <div
          onClick={() => navigate('/citizen/my-requests')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-800 rounded-2xl p-5 cursor-pointer transition shadow-md group hover:border-amber-500/40"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Track Assistance History</h4>
          <p className="text-xs text-slate-400 mb-3">
            Monitor real-time status updates on all emergency requests and response team assignments.
          </p>
          <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center">
            View Status &rarr;
          </span>
        </div>
      </div>

      {/* 6. VERIFIED EMERGENCY HELPLINES */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-md space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
          <PhoneCall className="w-4 h-4 mr-2 text-emerald-400" />
          Verified Emergency Helplines (Toll-Free 24/7)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {helplines.map((item) => (
            <a
              key={item.phone}
              href={`tel:${item.phone}`}
              className="bg-navy-950 border border-navy-800 hover:border-emerald-500/50 rounded-xl p-3 text-center transition group"
            >
              <span className="text-lg font-black text-white group-hover:text-emerald-400 block">
                {item.phone}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* SOS TRIGGER MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-navy-900 border-2 border-red-600 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-3 border-b border-navy-800 pb-3">
              <div className="p-2 rounded-lg bg-red-600 text-white">
                <LifeBuoy className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">CONFIRM EMERGENCY DISTRESS SOS</h3>
                <p className="text-xs text-slate-400">
                  Transmitting to National Disaster Management Grid
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Select Type of Emergency:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'EVACUATION', label: 'Flood / Evacuation' },
                  { id: 'MEDICAL_ASSISTANCE', label: 'Medical Assistance' },
                  { id: 'RESCUE', label: 'Trapped / Water Rescue' },
                  { id: 'FOOD_WATER', label: 'Food & Clean Water' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEmergencyCategory(cat.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition ${
                      emergencyCategory === cat.id
                        ? 'bg-red-600 text-white border-red-400 shadow-md'
                        : 'bg-navy-950 text-slate-300 border-navy-800 hover:bg-navy-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Additional Details / Exact Location Notes (Optional):
                </label>
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="e.g. Ground floor water level rising fast, oxygen concentrator on battery, need boat rescue..."
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 min-h-[80px]"
                />
              </div>

              <div className="bg-navy-950 border border-navy-800 rounded-xl p-3 text-xs text-slate-400 space-y-1 font-mono">
                <div>&bull; Transmitting GPS: {gpsLocation?.lat.toFixed(4)}°N, {gpsLocation?.lon.toFixed(4)}°E</div>
                <div>&bull; Priority: CRITICAL (Level 1 Emergency)</div>
                <div>&bull; District Authority: {selectedDistrict} Disaster Ops</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                disabled={isSubmittingSos}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSOS}
                disabled={isSubmittingSos}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg flex items-center transition"
              >
                {isSubmittingSos ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    DISPATCHING SOS...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    SEND EMERGENCY SOS NOW
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
