import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Cpu, 
  Sliders, 
  Save, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  Volume2,
  Lock,
  MessageCircleOff
} from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Form Fields State
  const [settings, setSettings] = useState({
    businessName: 'Nexloop Digital',
    tone: 'Professional Co-Founder',
    replyLength: 'Concise (1-3 Sentences)',
    leadCaptureEnabled: true,
    fallbackMessage: 'Our complimentary interactive assistant is currently operating at capacity. Please reach out to us directly on WhatsApp +971 52 813 1539!'
  });

  const loadSettings = async () => {
    try {
      setErrorStatus(null);
      const res = await fetch('/api/admin?action=settings');
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({
          businessName: json.data.businessName || 'Nexloop Digital',
          tone: json.data.tone || 'Professional Co-Founder',
          replyLength: json.data.replyLength || 'Concise (1-3 Sentences)',
          leadCaptureEnabled: json.data.leadCaptureEnabled !== false,
          fallbackMessage: json.data.fallbackMessage || 'Our complimentary interactive assistant is operating at capacity.'
        });
      } else {
        throw new Error(json.error || 'Failed to retrieve set of system instructions.');
      }
    } catch (err: any) {
      console.error("[Settings Page] Load error:", err);
      setErrorStatus(err.message || 'Database connection error. Failed to load setting registers from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorStatus(null);

    try {
      const res = await fetch('/api/admin?action=settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
      } else {
        throw new Error(data.error || "Failed to update settings");
      }
    } catch (err: any) {
      console.error("[Settings Page] Sync error:", err);
      setErrorStatus(err.message || 'Database connection failed. Unable to synchronize settings to Supabase.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
        <p className="text-sm font-mono text-outline-brand">Parsing Cognitive core settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-black text-white tracking-tight">AI Agent Cognitive Settings</h2>
        <p className="text-xs text-outline-brand mt-0.5">Tune Gemini neural parameters, branding terminology, and conversation filters.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 select-none">
        
        {/* Save Confirmation Alerts */}
        {savedSuccess && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>AI Brain parameters compiled successfully. Live synapses synchronized.</span>
          </div>
        )}

        {errorStatus && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-mono">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* 1. Core Branding Config */}
        <section className="glass-card border border-white/5 bg-[#111111]/70 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-container/10 border border-primary-brand/10 flex items-center justify-center text-primary-brand shrink-0">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white">AI Agency Branding</h3>
              <p className="text-[10px] text-outline-brand font-mono uppercase mt-0.5">Global identification constants</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">Business Persona Name</label>
              <input 
                type="text" 
                required
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full sm:max-w-lg px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none placeholder:text-outline-brand focus:ring-1 focus:ring-primary-brand/15"
              />
              <p className="text-[10px] text-outline-brand">Defines the firm name referenced during welcoming greetings.</p>
            </div>
          </div>
        </section>

        {/* 2. Conversational Sliders & Tones */}
        <section className="glass-card border border-white/5 bg-[#111111]/70 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/10 border border-secondary-container/10 flex items-center justify-center text-secondary-container shrink-0">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white">Linguistic &amp; Style Tuning</h3>
              <p className="text-[10px] text-outline-brand font-mono uppercase mt-0.5">Synapse temperature parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tone Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">Conversational Tone</label>
              <select 
                value={settings.tone}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Professional Co-Founder">Professional Co-Founder (Authoritative, helpful)</option>
                <option value="Creative Director">Creative Director (Enthusiastic, energetic)</option>
                <option value="Analytical Consultant">Analytical Consultant (Direct facts, charts-oriented)</option>
                <option value="Empathetic Supporter">Empathetic Supporter (Friendly, patient)</option>
              </select>
              <p className="text-[10px] text-outline-brand">Alters temperature and descriptive vocabulary style.</p>
            </div>

            {/* Answer Length */}
            <div className="space-y-2">
              <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">Max Answer Length</label>
              <select 
                value={settings.replyLength}
                onChange={(e) => setSettings({ ...settings, replyLength: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Concise (1-3 Sentences)">Concise (1-3 sentences prompt constraint)</option>
                <option value="Standard (3-5 Sentences)">Standard (3-5 sentences balanced block)</option>
                <option value="Comprehensive Guide">Comprehensive (FBA and freezone lists included)</option>
              </select>
              <p className="text-[10px] text-outline-brand">Caps the token consumption length filters.</p>
            </div>
          </div>
        </section>

        {/* 3. Automatic Data Capture and Fallbacks */}
        <section className="glass-card border border-white/5 bg-[#111111]/70 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-9 h-9 rounded-xl bg-tertiary-container/10 border border-tertiary-brand/10 flex items-center justify-center text-tertiary-brand shrink-0">
              <Volume2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white">Funnel Capture &amp; Redundancies</h3>
              <p className="text-[10px] text-outline-brand font-mono uppercase mt-0.5">SaaS automation directives</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Toggle lead capture */}
            <div className="flex items-center justify-between p-4 bg-[#1c1b1b] border border-white/5 rounded-2xl">
              <div className="space-y-0.5 text-left max-w-md">
                <span className="text-xs font-bold text-white block">Auto CRM leads extraction</span>
                <p className="text-[10px] text-outline-brand leading-normal">
                  Toggle semantic extraction. If checked, Gemini automatically maps user name, email, phone, and service interest to CRM listings database.
                </p>
              </div>
              <input 
                type="checkbox"
                checked={settings.leadCaptureEnabled}
                onChange={(e) => setSettings({ ...settings, leadCaptureEnabled: e.target.checked })}
                className="w-5 h-5 rounded-lg border border-white/10 accent-primary-container shrink-0 cursor-pointer"
              />
            </div>

            {/* Fallback Message */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-1.5">
                <MessageCircleOff className="w-3.5 h-3.5 text-outline-brand" />
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">API Offline Fallback greeting notice</label>
              </div>
              <textarea 
                rows={3}
                required
                value={settings.fallbackMessage}
                onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-tertiary-brand/35 text-xs text-white focus:outline-none placeholder:text-outline-brand focus:ring-1 focus:ring-tertiary-brand/15 leading-relaxed"
              />
              <p className="text-[10px] text-outline-brand">Greeting returned to customers if credentials throw timeout blocks.</p>
            </div>

          </div>
        </section>

        {/* Global actions submission bottom panel */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0E0E0E] border border-white/5 rounded-3xl p-5 gap-4 select-none">
          <div className="flex items-center gap-2.5 text-outline-brand font-mono text-[10px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Administrator access handshake secured.</span>
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary-container hover:bg-opacity-95 text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Compiling Rules' : 'Synchronize Brain Constants'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
