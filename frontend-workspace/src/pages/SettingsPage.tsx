import React, { useEffect, useState } from 'react';
import { Check, Globe, Loader2, Moon, Save, Settings, ShieldCheck, Sun, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPreference } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [pref, setPref] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadPref = async () => {
      try {
        const data = await api.getPreferences();
        setPref(data);
      } catch (err) {
        console.error('Failed to load preferences', err);
      } finally {
        setLoading(false);
      }
    };
    loadPref();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pref) return;

    setSaving(true);
    setSuccess(false);
    try {
      const updated = await api.updatePreferences(pref);
      setPref(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-[#1F293D] pb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" /> Workspace Preferences
        </h1>
        <p className="text-xs text-gray-400 mt-1">Configure default markets, technical charts, and agent sensitivity.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Profile Overview */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> User Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-gray-400 block mb-1">Name:</span>
            <span className="text-white font-semibold">{user?.full_name}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Email:</span>
            <span className="text-white font-semibold">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      {pref && (
        <form onSubmit={handleSave} className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Default Stock Market
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['US', 'IN', 'GLOBAL'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPref({ ...pref, default_market: m })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                      pref.default_market === m
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m === 'US' ? 'United States (NYSE/NASDAQ)' : m === 'IN' ? 'India (NSE / BSE)' : 'Global Markets'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Default Chart Timeframe</label>
              <div className="grid grid-cols-5 gap-2">
                {(['1M', '3M', '6M', '1Y', '5Y'] as const).map((tf) => (
                  <button
                    type="button"
                    key={tf}
                    onClick={() => setPref({ ...pref, default_timeframe: tf })}
                    className={`py-2 px-3 rounded-lg text-xs font-mono transition border ${
                      pref.default_timeframe === tf
                        ? 'bg-blue-600 text-white font-semibold border-blue-500'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Default Risk Profile Sensitivity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['conservative', 'moderate', 'aggressive'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setPref({ ...pref, default_risk_tolerance: r })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition ${
                      pref.default_risk_tolerance === r
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1F293D] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

