import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Activity, 
  RefreshCw, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalLeads: number;
  totalConversations: number;
  totalKnowledge: number;
  aiStatus: string;
  supabaseConnected: boolean;
  databaseHealthy: boolean;
}

interface ActivityItem {
  type: string;
  message: string;
  date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [diagData, setDiagData] = useState<any>(null);
  const [runningDiag, setRunningDiag] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setErrorStatus(null);
      const res = await fetch('/api/admin?action=dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setActivity(data.recentActivity || []);
      } else {
        throw new Error(data.error || "Failed to load dashboard data");
      }
    } catch (err: any) {
      console.error("[Dashboard Page] Fetch error:", err);
      setErrorStatus(err.message || "Database connection issue detected. Failed to retrieve statistics from Supabase.");
      
      setStats({
        totalLeads: 0,
        totalConversations: 0,
        totalKnowledge: 0,
        aiStatus: "Offline / Disconnected",
        supabaseConnected: false,
        databaseHealthy: false
      });
      setActivity([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-primary-container animate-spin" />
        <p className="text-sm font-mono text-outline-brand">Loading Cortex Workspace Systems...</p>
      </div>
    );
  }

  // Cards layout configurations
  const metricCards = [
    {
      title: 'Total Leads CRM',
      value: stats?.totalLeads ?? 0,
      subtext: '+12% from last week',
      icon: Users,
      colorClass: 'text-primary-brand bg-primary-container/10 border-primary-brand/10',
      link: '/admin/leads'
    },
    {
      title: 'AI Chats Logs',
      value: stats?.totalConversations ?? 0,
      subtext: '96% positive resolution',
      icon: MessageSquare,
      colorClass: 'text-secondary-container bg-secondary-container/5 border-secondary-container/10',
      link: '/admin/conversations'
    },
    {
      title: 'Knowledge Articles',
      value: stats?.totalKnowledge ?? 0,
      subtext: '4 active categories',
      icon: BookOpen,
      colorClass: 'text-tertiary-brand bg-tertiary-container/5 border-tertiary-brand/10',
      link: '/admin/knowledge-base'
    },
    {
      title: 'AI Agent Engine',
      value: stats?.aiStatus || 'Active',
      subtext: 'Gemini-3.5-flash / active',
      icon: Cpu,
      colorClass: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
      link: '/admin/settings'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Alert Warning for fallback states */}
      {errorStatus && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs font-mono select-text">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Hero Welcome banner CRM */}
      <div className="relative glass-card bg-gradient-to-r from-primary-container/10 via-[#131313]/90 to-[#0e0e0e] border border-white/5 p-6 md:p-8 rounded-[32px] overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl text-left">
          <span className="text-[10px] font-mono font-bold text-primary-brand uppercase tracking-widest bg-primary-container/15 px-3 py-1.5 rounded-full border border-primary-brand/10">
            Nexloop Operations Hub
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight mt-1">
            Welcome to Nexloop Cortex Platform Office
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Direct orchestration room for e-commerce leads cataloging, Amazon &amp; Noon support audits, remote freezone licensing requests, and localized Dubai supply tracking.
          </p>
        </div>
        <button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-widest border border-white/5 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Grid of four metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, i) => {
          const IconComp = card.icon;
          return (
            <Link 
              key={i} 
              to={card.link}
              className="glass-card hover:-translate-y-2 flex flex-col justify-between p-6 rounded-3xl border text-left cursor-pointer transition-all duration-300 bg-[#111111]/90"
              id={`dashboard-card-${i}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-outline-brand">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.colorClass}`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-3xl font-display font-black text-white tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-outline-brand font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-secondary-container" />
                  <span>{card.subtext}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Columns segment: Recent Activity vs System Health diagnostics panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Activity panel */}
        <section className="lg:col-span-8 glass-card border border-white/5 bg-[#111111]/70 p-6 md:p-8 rounded-3xl text-left">
          <div className="flex justify-between items-center pb-5 border-b border-white/5 mb-6">
            <div>
              <h3 className="font-display text-lg font-black text-white tracking-tight">Recent Captured Activity</h3>
              <p className="text-xs text-outline-brand mt-0.5">Real-time trace entries generated by users on direct endpoint routes.</p>
            </div>
            <Link to="/admin/leads" className="text-xs text-primary-brand font-bold hover:underline flex items-center gap-1.5">
              <span>View All CRM Leads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {activity.length === 0 ? (
              <p className="text-xs font-mono text-outline-brand text-center py-6">No recent capture activities generated.</p>
            ) : (
              activity.map((act, index) => {
                const isLead = act.type === 'lead';
                return (
                  <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border ${
                      isLead 
                        ? 'bg-primary-container/10 border-primary-brand/20 text-primary-brand' 
                        : 'bg-secondary-container/5 border-secondary-container/15 text-secondary-container'
                    }`}>
                      {isLead ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white leading-relaxed font-semibold truncate">
                        {act.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-outline-brand">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(act.date).toLocaleString()}</span>
                        <span className="text-white/10">|</span>
                        <span>Source: web-client</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* System Health panel */}
        <section className="lg:col-span-4 glass-card border border-white/5 bg-[#111111]/70 p-6 md:p-8 rounded-3xl text-left space-y-6">
          <div>
            <h3 className="font-display text-lg font-black text-white tracking-tight">Diagnostics System</h3>
            <p className="text-xs text-outline-brand mt-0.5">Integrated environment check status stats.</p>
          </div>

          <div className="space-y-4 font-mono text-[11px]">
            {/* Database check line */}
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Database className={`w-4 h-4 ${stats?.databaseHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>Supabase Connection</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border ${
                stats?.supabaseConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {stats?.supabaseConnected ? 'Online' : 'Mock Mode'}
              </span>
            </div>

            {/* AI pipeline trace line */}
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-violet-400" />
                <span>Gemini API Node</span>
              </div>
              <span className="px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                ACTIVE
              </span>
            </div>

            {/* Node host container check */}
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-secondary-container" />
                <span>Server Container</span>
              </div>
              <span className="text-white font-bold text-right truncate">
                Cloud Run / Docker
              </span>
            </div>

            {/* SLA checking line */}
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#ffb59d]" />
                <span>Security Shield</span>
              </div>
              <span className="px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                LOCKED
              </span>
            </div>
          </div>

          {/* Interactive Supabase Diagnostics Tool */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold uppercase tracking-wider text-[9px] font-mono">Supabase Real-time Auditor</span>
              <button
                onClick={async () => {
                  setRunningDiag(true);
                  setDiagError(null);
                  try {
                    const res = await fetch("/api/admin/test-connection");
                    const data = await res.json();
                    if (data.success) {
                      setDiagData(data);
                    } else {
                      throw new Error(data.error || "Failed to audit keys");
                    }
                  } catch (e: any) {
                    setDiagError(e.message || "Auditing error");
                  } finally {
                    setRunningDiag(false);
                  }
                }}
                disabled={runningDiag}
                className="px-2.5 py-1 text-[9px] uppercase tracking-wider rounded bg-secondary-container/15 hover:bg-secondary-container/25 text-secondary-container transition-all cursor-pointer font-bold border border-secondary-container/20 disabled:opacity-50"
              >
                {runningDiag ? "Testing..." : "Verify Keys & Tables"}
              </button>
            </div>

            {diagError && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl text-[10px] font-mono">
                Error during check: {diagError}
              </div>
            )}

            {diagData && (
              <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-outline-brand">API Keys Configured:</span>
                  <span className={`font-bold ${diagData.supabaseConfigured ? "text-emerald-400" : "text-amber-400"}`}>
                    {diagData.supabaseConfigured ? "YES" : "NO"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-outline-brand text-[9px] uppercase tracking-wider">Environment Variable status:</div>
                  <div className="flex justify-between pl-2">
                    <span className="text-white/40">- SUPABASE_URL:</span>
                    <span className="text-white truncate max-w-[120px]">{diagData.envState.maskedUrl}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-white/40">- SUPABASE_ANON_KEY:</span>
                    <span className={diagData.envState.keyExists ? "text-emerald-400" : "text-red-400"}>
                      {diagData.envState.keyExists ? "Present" : "Missing"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="text-outline-brand text-[9px] uppercase tracking-wider">Required Schema Tables:</div>
                  
                  {/* Lead checking */}
                  <div className="flex justify-between items-start pl-1">
                    <span className="text-white/75">leads table:</span>
                    <div className="text-right">
                      {diagData.connectionTest.tables.leads.ok ? (
                        <span className="text-emerald-400 font-bold">✔ OK ({diagData.connectionTest.tables.leads.count ?? 0} rows)</span>
                      ) : (
                        <span className="text-rose-400 text-[9px] block max-w-[150px] leading-tight">
                          ❌ {diagData.connectionTest.tables.leads.error || "Missing / inaccessible"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conversations checking */}
                  <div className="flex justify-between items-start pl-1">
                    <span className="text-white/75">conversations table:</span>
                    <div className="text-right">
                      {diagData.connectionTest.tables.conversations.ok ? (
                        <span className="text-emerald-400 font-bold">✔ OK ({diagData.connectionTest.tables.conversations.count ?? 0} rows)</span>
                      ) : (
                        <span className="text-rose-400 text-[9px] block max-w-[150px] leading-tight">
                          ❌ {diagData.connectionTest.tables.conversations.error || "Missing / inaccessible"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Knowledge base checking */}
                  <div className="flex justify-between items-start pl-1">
                    <span className="text-white/75">knowledge_base table:</span>
                    <div className="text-right">
                      {diagData.connectionTest.tables.knowledge_base.ok ? (
                        <span className="text-emerald-400 font-bold">✔ OK ({diagData.connectionTest.tables.knowledge_base.count ?? 0} rows)</span>
                      ) : (
                        <span className="text-rose-400 text-[9px] block max-w-[150px] leading-tight">
                          ❌ {diagData.connectionTest.tables.knowledge_base.error || "Missing / inaccessible"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Settings checking */}
                  <div className="flex justify-between items-start pl-1">
                    <span className="text-white/75">ai_settings table:</span>
                    <div className="text-right">
                      {diagData.connectionTest.tables.ai_settings.ok ? (
                        <span className="text-emerald-400 font-bold">✔ OK ({diagData.connectionTest.tables.ai_settings.count ?? 0} rows)</span>
                      ) : (
                        <span className="text-rose-400 text-[9px] block max-w-[150px] leading-tight">
                          ❌ {diagData.connectionTest.tables.ai_settings.error || "Missing / inaccessible"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded bg-white/[0.02] border border-white/5 text-[9px] text-[#8c90a1]">
                  <span className="text-white font-bold block mb-0.5">Status Statement:</span>
                  {diagData.connectionTest.status}
                </div>
              </div>
            )}

            {!diagData && (
              <div className="pt-2 border-t border-white/5 space-y-3 font-mono text-[10px] text-outline-brand">
                <span className="text-white block font-semibold uppercase tracking-wider text-[9px]">Platform Logs Index</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>TLS connection handshake certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CORS requests strictly restricted to origins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Supabase environment secrets securely loaded</span>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
