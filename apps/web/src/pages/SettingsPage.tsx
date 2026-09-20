import React, { useState } from 'react';
import { Sliders, Moon, Bell, Shield, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white tracking-tight pb-3 border-b border-[#1F2C47]">
        Platform Settings
      </h1>

      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[#1F2C47]">
            <div>
              <p className="text-xs font-bold text-white">Dark Command Center Theme</p>
              <p className="text-[11px] text-slate-400">Default professional civic operations palette</p>
            </div>
            <span className="text-xs font-mono text-teal-400 font-bold">LOCKED DARK</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#1F2C47]">
            <div>
              <p className="text-xs font-bold text-white">Live Telemetry Auto-Refresh</p>
              <p className="text-[11px] text-slate-400">Poll live signal stream and issues every 5 seconds</p>
            </div>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-teal-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-white">Audible Priority Alerts</p>
              <p className="text-[11px] text-slate-400">Play audio ping on CRITICAL priority escalations</p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="accent-teal-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Preferences Saved' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};
