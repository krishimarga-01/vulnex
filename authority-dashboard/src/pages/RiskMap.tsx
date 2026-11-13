import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { VulnerablePerson, RiskLevel, VulnerabilityCategory } from '../types';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Filter,
  Users,
  AlertTriangle,
  Flame,
  Phone,
  Home,
  HeartPulse,
  Send,
  CheckCircle,
  Building,
  LifeBuoy,
  Layers,
  MapPin,
  RefreshCw
} from 'lucide-react';

// Custom Map center changer component
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const DISTRICT_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  ALL: { center: [13.5, 76.0], zoom: 7 },
  'Bengaluru Urban': { center: [12.9716, 77.5946], zoom: 12 },
  Kodagu: { center: [12.426, 75.739], zoom: 12 },
  'Uttara Kannada': { center: [14.821, 74.135], zoom: 12 },
  Udupi: { center: [13.342, 74.745], zoom: 12 },
  Kalaburagi: { center: [17.331, 76.839], zoom: 12 },
};

// Generate custom SVG DivIcon for Leaflet based on risk level
function createRiskMarkerIcon(riskLevel: RiskLevel) {
  const color = riskLevel === 'HIGH' ? '#DC3545' : riskLevel === 'MEDIUM' ? '#F59E0B' : '#16A34A';
  const pulseClass = riskLevel === 'HIGH' ? 'marker-critical-pulse' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div class="${pulseClass}" style="
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
        ">
          ${riskLevel === 'HIGH' ? '!' : riskLevel === 'MEDIUM' ? '▲' : '●'}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Generate Shelter Icon
function createShelterIcon() {
  return L.divIcon({
    className: 'shelter-leaflet-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: #0284C7;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 14px;
      ">
        ⌂
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// Generate SOS Distress Icon
function createSosIcon() {
  return L.divIcon({
    className: 'sos-leaflet-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px;">
        <div class="marker-critical-pulse" style="
          position: absolute;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #DC2626;
          border: 3px solid white;
          box-shadow: 0 0 15px rgba(220,38,38,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: -0.5px;
        ">
          SOS
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export const RiskMap: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedPerson, setSelectedPerson] = useState<VulnerablePerson | null>(null);

  // Layer toggles
  const [showVulnerable, setShowVulnerable] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showActiveSos, setShowActiveSos] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);

  // Fetch data
  const { data: persons = [] } = useQuery({
    queryKey: ['vulnerable-persons-map'],
    queryFn: () => apiService.getVulnerablePersons(),
  });

  const { data: shelters = [] } = useQuery({
    queryKey: ['shelters-map'],
    queryFn: () => apiService.getShelters(),
  });

  const { data: emergencyCases = [] } = useQuery({
    queryKey: ['emergency-cases-map'],
    queryFn: () => apiService.getEmergencyCases(),
  });

  const { data: imdWarnings = [] } = useQuery({
    queryKey: ['imd-warnings-map'],
    queryFn: () => apiService.getImdWarnings(),
  });

  // Filter vulnerable people
  const filteredPersons = persons.filter((person) => {
    if (selectedCategory !== 'ALL' && person.vulnerabilityCategory !== selectedCategory) {
      return false;
    }
    if (selectedRisk !== 'ALL' && person.currentRiskLevel !== selectedRisk) {
      return false;
    }
    if (selectedDistrict !== 'ALL' && person.address && !person.address.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    return true;
  });

  const activeSosCases = emergencyCases.filter(
    (c: any) => c.status === 'REPORTED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
  );

  const currentView = DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS.ALL;

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-3">
      {/* Top Filter Bar */}
      <div className="bg-navy-900 border border-navy-800 p-3 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            GIS Risk Layers & Telemetry:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-navy-950 border border-navy-800 text-white rounded-xl px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Karnataka</option>
              <option value="Kodagu">Kodagu (Orange Alert)</option>
              <option value="Uttara Kannada">Uttara Kannada (Orange Alert)</option>
              <option value="Udupi">Udupi (Yellow Alert)</option>
              <option value="Kalaburagi">Kalaburagi (Yellow Alert)</option>
              <option value="Bengaluru Urban">Bengaluru Urban (Yellow Alert)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-navy-950 border border-navy-800 text-white rounded-xl px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Categories ({persons.length})</option>
              <option value="ELDERLY">Elderly (65+)</option>
              <option value="CHILD">Children / Infants</option>
              <option value="DISABILITY">Persons with Disabilities</option>
              <option value="PREGNANT">Pregnant Women</option>
              <option value="MEDICAL_ASSISTANCE">Medical Assistance</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-navy-950 border border-navy-800 text-white rounded-xl px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only (Red)</option>
              <option value="MEDIUM">Medium Risk (Orange)</option>
              <option value="LOW">Low Risk (Green)</option>
            </select>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-2 text-[11px] font-semibold">
          <label className="flex items-center space-x-1 cursor-pointer bg-navy-950 px-2 py-1 rounded-lg border border-navy-800 text-slate-300">
            <input
              type="checkbox"
              checked={showVulnerable}
              onChange={(e) => setShowVulnerable(e.target.checked)}
              className="rounded border-navy-700 bg-navy-900 text-red-500"
            />
            <span>Vulnerable ({filteredPersons.length})</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer bg-navy-950 px-2 py-1 rounded-lg border border-navy-800 text-cyan-300">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="rounded border-navy-700 bg-navy-900 text-cyan-500"
            />
            <span>Shelters ({shelters.length})</span>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer bg-navy-950 px-2 py-1 rounded-lg border border-navy-800 text-red-400">
            <input
              type="checkbox"
              checked={showActiveSos}
              onChange={(e) => setShowActiveSos(e.target.checked)}
              className="rounded border-navy-700 bg-navy-900 text-red-600"
            />
            <span>SOS Calls ({activeSosCases.length})</span>
          </label>
        </div>
      </div>

      {/* Main Map Container & Sidebar */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Leaflet GIS Map */}
        <div className="flex-1 bg-navy-950 rounded-2xl border border-navy-800 overflow-hidden relative shadow-lg">
          <MapContainer
            center={currentView.center}
            zoom={currentView.zoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#0B1120' }}
          >
            <ChangeView center={currentView.center} zoom={currentView.zoom} />

            {/* Standard OpenStreetMap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* IMD Hazard Zones (Circles) */}
            {showHazardZones && (
              <>
                {/* Kodagu Inundation Buffer */}
                <Circle
                  center={[12.426, 75.739]}
                  radius={18000}
                  pathOptions={{
                    color: '#F97316',
                    fillColor: '#F97316',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 5',
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="text-orange-600 block">IMD ORANGE ALERT ZONE: Kodagu</strong>
                      <p>Flash Floods & Western Ghats Slope Inundation Risk.</p>
                      <span className="font-mono text-[10px]">Radius: 18 km Buffer</span>
                    </div>
                  </Popup>
                </Circle>

                {/* Uttara Kannada Coastal Squall Buffer */}
                <Circle
                  center={[14.821, 74.135]}
                  radius={20000}
                  pathOptions={{
                    color: '#F97316',
                    fillColor: '#F97316',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 5',
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="text-orange-600 block">IMD ORANGE ALERT ZONE: Uttara Kannada</strong>
                      <p>Coastal Inundation & Squall Winds exceeding 65 kmph.</p>
                    </div>
                  </Popup>
                </Circle>
              </>
            )}

            {/* 1. Shelters Layer */}
            {showShelters &&
              shelters.map((s: any) => {
                if (!s.latitude || !s.longitude) return null;
                return (
                  <Marker
                    key={s.shelterId}
                    position={[s.latitude, s.longitude]}
                    icon={createShelterIcon()}
                  >
                    <Popup>
                      <div className="text-xs p-1 max-w-[220px]">
                        <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">
                          RELIEF SHELTER
                        </span>
                        <h4 className="font-bold text-navy-900 mt-1">{s.shelterName}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{s.address}, {s.district}</p>
                        <div className="mt-2 text-[10px] space-y-0.5 text-slate-700 font-medium">
                          <div>&bull; PwD Accessible: {s.isAccessibleDisabled ? 'Yes' : 'No'}</div>
                          <div>&bull; Medical Facility: {s.hasMedicalFacility ? 'Yes' : 'No'}</div>
                          <div>&bull; 24/7 Power: {s.hasBackupPower ? 'Yes' : 'No'}</div>
                        </div>
                        {s.contactPhone && (
                          <div className="mt-2 text-[11px] font-bold text-cyan-700">
                            Phone: {s.contactPhone}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* 2. Active Emergency SOS Cases Layer */}
            {showActiveSos &&
              activeSosCases.map((c: any) => {
                if (!c.latitude || !c.longitude) return null;
                return (
                  <Marker
                    key={c.id || c.caseNumber}
                    position={[c.latitude, c.longitude]}
                    icon={createSosIcon()}
                  >
                    <Popup>
                      <div className="text-xs p-1 max-w-[220px]">
                        <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                          ACTIVE SOS #{c.caseNumber}
                        </span>
                        <h4 className="font-bold text-red-900 mt-1">{c.emergencyCategory}</h4>
                        <p className="text-[11px] text-slate-700 mt-0.5">{c.description}</p>
                        <div className="mt-2 text-[10px] text-slate-500">
                          Priority: <strong className="text-red-700 font-bold">{c.priority}</strong> &bull; Status: {c.status}
                        </div>
                        {c.assignedTeamName && (
                          <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
                            Assigned: {c.assignedTeamName}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* 3. Vulnerable Persons Layer */}
            {showVulnerable &&
              filteredPersons.map((p) => {
                if (!p.latitude || !p.longitude) return null;
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={createRiskMarkerIcon(p.currentRiskLevel)}
                    eventHandlers={{
                      click: () => setSelectedPerson(p),
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 max-w-[220px]">
                        <div className="font-bold text-navy-900">{p.fullName}</div>
                        <div className="text-[11px] text-slate-600">
                          Age: {p.age} &bull; {p.vulnerabilityCategory}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Mobility: {p.mobilityStatus}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <StatusBadge type="risk" value={p.currentRiskLevel} size="sm" />
                          <span className="text-amber-700 font-bold font-mono text-[11px]">
                            {p.currentRiskScore || 75.0} / 100
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedPerson(p)}
                          className="mt-2.5 text-[10px] bg-navy-900 text-white px-2 py-1.5 rounded-lg w-full font-bold hover:bg-navy-800 transition"
                        >
                          View Profile & Dispatch
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-navy-950/95 backdrop-blur-md p-3.5 rounded-2xl border border-navy-800 shadow-2xl text-xs space-y-2 text-white">
            <span className="font-black text-slate-300 text-[10px] uppercase tracking-wider block border-b border-navy-800 pb-1">
              GIS Tactical Symbols
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white flex items-center justify-center font-bold text-[9px]">!</span>
                <span>High Risk Citizen (Score 75+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white flex items-center justify-center font-bold text-[9px]">▲</span>
                <span>Medium Risk (Score 45-74)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white flex items-center justify-center font-bold text-[9px]">●</span>
                <span>Low Risk (&lt;45)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-md bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">⌂</span>
                <span>Evacuation Relief Shelter</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
                <span className="text-red-400 font-bold">Active SOS Distress Call</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Citizen Sidebar Panel (when clicked) */}
        {selectedPerson && (
          <div className="w-80 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between shrink-0 overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-navy-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedPerson.nationalId || 'VP-2026'}</span>
                  <h3 className="text-base font-bold text-white">{selectedPerson.fullName}</h3>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vulnerability Category:</span>
                  <span className="font-bold text-cyan-400">{selectedPerson.vulnerabilityCategory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mobility:</span>
                  <span className="font-bold text-amber-400">{selectedPerson.mobilityStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold text-white">{selectedPerson.age} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedPerson.currentRiskScore || 78.5} / 100</span>
                </div>
              </div>

              {selectedPerson.medicalConditions && (
                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-rose-200">
                  <strong className="block text-rose-300 mb-0.5">Medical Condition:</strong>
                  {selectedPerson.medicalConditions}
                </div>
              )}

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Residential Address</span>
                <p>{selectedPerson.address}</p>
                <p className="font-mono text-[10px] text-slate-400">
                  {selectedPerson.latitude.toFixed(4)}°N, {selectedPerson.longitude.toFixed(4)}°E
                </p>
              </div>

              {selectedPerson.contactNumber && (
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Contact Number</span>
                  <strong className="text-white font-mono">{selectedPerson.contactNumber}</strong>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-navy-800">
              <a
                href="/priority-plan"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center transition shadow-md"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Dispatch via Priority Engine
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
