import React from 'react';
import {
  BookOpen,
  CloudRain,
  Wind,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Package,
  PhoneCall
} from 'lucide-react';

export const CitizenSafety: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Disaster Safety Instructions & Evacuation Protocols</h2>
            <p className="text-xs text-slate-400">
              National Disaster Management Authority (NDMA) & State Disaster Management Authority (SDMA) verified guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol 1: Heavy Rainfall & Flash Floods */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <CloudRain className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold text-white">Flash Floods & Western Ghats Inundation Protocol</h3>
        </div>

        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Move to Upper Floors:</strong> Move elderly, bedridden, and mobility-impaired family members away from basement and ground-floor riverine zones.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Turn off Main Electricity:</strong> Switch off the main circuit breaker before floodwaters contact electrical outlets to prevent electrocution hazards.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Avoid Driving / Walking through Flowing Water:</strong> Just 15 cm (6 inches) of rapid water can knock a person down; 60 cm can carry away vehicles.</span>
          </li>
        </ul>
      </div>

      {/* Protocol 2: Cyclones & Gale Winds */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-3 text-amber-400">
          <Wind className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold text-white">Cyclones & Squally Coastal Gale Winds</h3>
        </div>

        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Stay Indoors:</strong> Keep away from exterior glass windows and tin roofs. Secure loose outdoor objects before gale onset.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Fishermen Advisory:</strong> Strictly avoid venturing into Arabian Sea and coastal waters when Orange/Red squall alerts are active.</span>
          </li>
        </ul>
      </div>

      {/* Protocol 3: Emergency Kit Checklist */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-3 text-red-400">
          <Package className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold text-white">72-Hour Emergency Evacuation Kit</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
            <strong>Critical Medical Supplies:</strong>
            <p className="text-slate-400 mt-1">7-day supply of prescription medications, portable oxygen cylinders, insulin coolers, medical history records.</p>
          </div>
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
            <strong>Hydration & Food:</strong>
            <p className="text-slate-400 mt-1">3 liters of drinking water per person per day, non-perishable high-calorie food, infant formula.</p>
          </div>
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
            <strong>Power & Illumination:</strong>
            <p className="text-slate-400 mt-1">Waterproof LED flashlight, auxiliary power bank, battery-operated radio, spare batteries.</p>
          </div>
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
            <strong>Important Documents:</strong>
            <p className="text-slate-400 mt-1">Aadhaar / ID cards, insurance policies, bank records sealed inside waterproof pouch.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
