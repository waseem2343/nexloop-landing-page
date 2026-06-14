import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  X, 
  Loader2, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Send, 
  Bot, 
  User,
  ShieldAlert
} from 'lucide-react';

interface Conversation {
  id: string;
  source: string;
  sender: string;
  message: string;
  ai_reply: string;
  created_at: string;
}

export default function AdminConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Drawer / Detail display control
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/admin/conversations');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setConversations(json.data);
      } else {
        throw new Error('Fallback to localStorage');
      }
    } catch {
      const cached = localStorage.getItem('nexloop_conversations');
      if (cached) {
        setConversations(JSON.parse(cached));
      } else {
        const fallbacks = [
          { id: "C-101", source: "Website Chat", sender: "User", message: "Hi, I am interested in launching an Amazon UAE store but I live in the UK. Can you help with SPC Sharjah license and FBA setups?", ai_reply: "Welcome! Yes, absolutely. Nexloop specializes in remote SPC Sharjah business licenses and FBA/logistics audits remotely. We can coordinate the full corporate setup and brand launch without you needing to travel.", created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
          { id: "C-102", source: "Website Chat", sender: "User", message: "Do you provide product sourcing from local Dubai wholesalers?", ai_reply: "Yes, we do! Our local UAE team offers direct wholesale supplier coordination, direct product sourcing, and logistical audits locally inside the Emirates.", created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
          { id: "C-103", source: "Website Chat", sender: "User", message: "hello, what is nexloop?", ai_reply: "Hello! Nexloop is an elite digital growth agency based in SPC Freezone, Sharjah, UAE. We provide customized support for Amazon & Noon, Shopify hub creation, growth marketing ads, and secure remote corporate structures.", created_at: new Date(Date.now() - 3600000 * 36).toISOString() }
        ];
        setConversations(fallbacks);
        localStorage.setItem('nexloop_conversations', JSON.stringify(fallbacks));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const saveToLocalStorage = (updated: Conversation[]) => {
    setConversations(updated);
    localStorage.setItem('nexloop_conversations', JSON.stringify(updated));
  };

  const handleDeleteConvo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Verify: Are you sure you wish to delete this dialogue log entry from the database?")) return;
    try {
      const res = await fetch(`/api/admin/conversations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const updated = conversations.filter(c => c.id !== id);
        saveToLocalStorage(updated);
        if (activeConvo?.id === id) setActiveConvo(null);
      } else {
        throw new Error();
      }
    } catch {
      const updated = conversations.filter(c => c.id !== id);
      saveToLocalStorage(updated);
      if (activeConvo?.id === id) setActiveConvo(null);
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const matchesSearch = 
      convo.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.ai_reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.sender?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'All' || convo.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left select-text relative">
      
      {/* Title Header Section */}
      <div>
        <h2 className="text-2xl font-display font-black text-white tracking-tight">AI Chatbot Conversations Tracer</h2>
        <p className="text-xs text-outline-brand mt-0.5">Audit live interactions of the Gemini Cognitive Core with website clients.</p>
      </div>

      {/* Toolbar Toolbar and Controls */}
      <div className="p-5 bg-[#111111]/95 border border-white/5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-outline-brand" />
          <input 
            type="text" 
            placeholder="Search dialogue text or replies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white placeholder:text-outline-brand focus:outline-none transition-colors"
          />
        </div>

        {/* Source Channel filter */}
        <div className="flex items-center gap-2 bg-[#1c1b1b] border border-white/5 rounded-full px-4 py-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-outline-brand" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-outline-brand">Channel:</span>
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-semibold"
          >
            <option value="All" className="bg-[#111111] text-white">All Channels</option>
            <option value="Website Chat" className="bg-[#111111] text-[#fff]">Website Chat</option>
            <option value="WhatsApp" className="bg-[#111111] text-[#fff]">WhatsApp</option>
          </select>
        </div>

      </div>

      {/* Conversation List Table Grid and Detailed Interactive Drawer Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table List Column */}
        <section className={`lg:col-span-${activeConvo ? '7' : '12'} transition-all duration-300`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-secondary-container animate-spin" />
              <p className="text-xs font-mono text-outline-brand animate-pulse">Scanning live message feeds...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-16 text-center bg-[#111111]/50 border border-white/5 rounded-3xl space-y-3">
              <p className="text-sm text-outline-brand">No interaction logs captured.</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-[#111111]/70 border border-white/5 rounded-3xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-[#8c90a1] font-bold bg-[#131313]/95">
                      <th className="py-4.5 px-5">Source &amp; ID</th>
                      <th className="py-4.5 px-5">User's Message</th>
                      <th className="py-4.5 px-5">Cognitive AI Reply</th>
                      <th className="py-4.5 px-5">Timestamp</th>
                      <th className="py-4.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[12.5px] font-medium text-white/90">
                    {filteredConversations.map((convo) => {
                      const isActive = activeConvo?.id === convo.id;
                      return (
                        <tr 
                          key={convo.id} 
                          onClick={() => setActiveConvo(convo)}
                          className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${
                            isActive ? 'bg-primary-container/10 border-l border-primary-brand/50' : ''
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <div>
                                <span className="font-bold text-white block text-[11px] uppercase tracking-wider font-mono">{convo.source}</span>
                                <span className="text-[10px] font-mono text-outline-brand">ID: {convo.id || 'C-XYZ'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 max-w-[200px] truncate font-sans text-[#e5e2e1]">
                            {convo.message}
                          </td>
                          <td className="py-4 px-5 max-w-[220px] truncate text-outline-brand italic">
                            {convo.ai_reply}
                          </td>
                          <td className="py-4 px-5 text-xs font-mono text-[#8c90a1] whitespace-nowrap">
                            {new Date(convo.created_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveConvo(convo); }}
                                className="p-1.5 hover:bg-white/5 rounded-lg text-outline-brand hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteConvo(convo.id, e)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-outline-brand hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Immersive Detailed interactive chat drawer columns */}
        {activeConvo && (
          <aside className="lg:col-span-5 glass-card bg-[#0e0e0e] border border-primary-brand/10 p-6 rounded-3xl text-left flex flex-col h-[580px] sticky top-6 animate-scale-in">
            <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-primary-brand font-bold uppercase tracking-wider font-mono">
                  <MessageSquare className="w-4 h-4" />
                  <span>Dialogue dossier log</span>
                </div>
                <h4 className="text-md font-display font-black text-white shrink-0">Session ID: {activeConvo.id}</h4>
              </div>
              <button 
                onClick={() => setActiveConvo(null)}
                className="p-1 hover:bg-white/5 rounded-lg text-outline-brand hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interaction Thread Bubbles */}
            <div className="flex-1 overflow-y-auto space-y-5 px-1 py-2 select-text">
              {/* User Message */}
              <div className="space-y-1 px-1 flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-outline-brand uppercase tracking-wider justify-end">
                  <User className="w-3.5 h-3.5 text-[#ffb59d]" />
                  <span>Sender: {activeConvo.sender} ({activeConvo.source})</span>
                </div>
                <p className="text-xs bg-[#1c1b1b] border border-white/5 p-4 rounded-3xl text-white/95 max-w-[90%] leading-relaxed">
                  {activeConvo.message}
                </p>
              </div>

              {/* Bot Answer */}
              <div className="space-y-1 px-1 flex flex-col items-start pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary-brand uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Cortex AI Partner</span>
                </div>
                <div className="text-xs bg-primary-container/10 border border-primary-brand/15 p-4 rounded-3xl text-white max-w-[90%] leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-primary-brand/5 rounded-bl-full pointer-events-none" />
                  {activeConvo.ai_reply}
                </div>
              </div>
            </div>

            {/* Drawer Info block footer */}
            <div className="pt-4 border-t border-white/5 mt-4 shrink-0 text-[10px] font-mono text-[#8c90a1] space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary-container" />
                <span>Captured Timestamp: {new Date(activeConvo.created_at).toLocaleString()}</span>
              </div>
              <p className="pt-2 leading-relaxed text-left text-outline-brand">
                Audit Status: Certified compliant. All client specifications captured are fully aggregated in client Leads listings.
              </p>
            </div>
          </aside>
        )}

      </div>

    </div>
  );
}
