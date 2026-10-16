import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Cpu, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState('auto');
  const [activeRuntime, setActiveRuntime] = useState('local');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [maskedKeys, setMaskedKeys] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setProvider(data.ai_provider || 'auto');
      setActiveRuntime(data.active_runtime || 'local');
      setMaskedKeys({
        gemini: data.gemini_key_masked,
        openai: data.openai_key_masked,
        groq: data.groq_key_masked
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateSettings({
        ai_provider: provider,
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        groq_api_key: groqKey || undefined
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        loadSettings();
      }, 1500);
    } catch (e) {
      setIsSaving(false);
      alert('Failed to update settings.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Engine & Model Settings</h2>
              <p className="text-xs text-slate-400">Choose between cloud LLMs or built-in offline intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Active Status Badge */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Current Active Runtime:</span>
                <span className="text-sm font-bold text-emerald-400 capitalize">
                  {activeRuntime === 'local' ? 'Built-in Local NLP (Offline Zero-Config)' : `${activeRuntime} API Connected`}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Operational
            </span>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              AI Provider Preference
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="auto">Auto-Detect (Best Available)</option>
              <option value="gemini">Google Gemini (Recommended)</option>
              <option value="openai">OpenAI (GPT-4o-mini)</option>
              <option value="groq">Groq (Llama-3.3)</option>
              <option value="local">Local Built-in NLP (100% Offline)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Credentials (Optional)</span>
            </div>

            {/* Gemini Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">Google Gemini API Key</label>
                {maskedKeys.gemini && (
                  <span className="text-[10px] text-emerald-400 font-mono">Configured: {maskedKeys.gemini}</span>
                )}
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* OpenAI Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">OpenAI API Key</label>
                {maskedKeys.openai && (
                  <span className="text-[10px] text-emerald-400 font-mono">Configured: {maskedKeys.openai}</span>
                )}
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Groq Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">Groq API Key</label>
                {maskedKeys.groq && (
                  <span className="text-[10px] text-emerald-400 font-mono">Configured: {maskedKeys.groq}</span>
                )}
              </div>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <p>
              Keys are stored securely in local app memory. If no key is set, LectureIQ automatically uses its built-in local offline synthesis engine.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
