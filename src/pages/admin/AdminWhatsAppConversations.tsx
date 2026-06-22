import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Search, 
  Send, 
  Radio, 
  User, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  Bot, 
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  Flag,
  RotateCcw,
  Key,
  Save
} from 'lucide-react';

interface WhatsAppChat {
  phone_number: string;
  contact_name: string;
  latest_message: string;
  latest_sender: 'customer' | 'ai';
  created_at: string;
  lead_id: string | null;
  ai_disabled: boolean;
  unread_count: number;
}

interface WhatsAppMessage {
  id: string;
  created_at: string;
  phone_number: string;
  contact_name: string;
  message_type: string;
  sender: 'customer' | 'ai';
  message: string;
  conversation_id: string;
  lead_id: string | null;
  metadata?: {
    ai_disabled?: boolean;
    manual_representative_reply?: boolean;
    whatsapp_delivery_attempted?: boolean;
    qualifications?: {
      name?: string;
      company?: string;
      budget?: string;
      service_required?: string;
      country?: string;
      timeline?: string;
    };
  };
}

export default function AdminWhatsAppConversations() {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [whatsappToken, setWhatsappToken] = useState(() => localStorage.getItem('whatsapp_token') || '');
  const [phoneId, setPhoneId] = useState(() => localStorage.getItem('whatsapp_phone_id') || '');
  const [verifyToken, setVerifyToken] = useState(() => localStorage.getItem('whatsapp_verify_token') || '');
  const [simName, setSimName] = useState('Ali Reda');
  const [simPhone, setSimPhone] = useState('971505551234');
  const [simMessage, setSimMessage] = useState('Salam! I need SPC Sharjah freezone licensing support. My budget is 15000 AED and I want to launch my company next week.');
  const [simulating, setSimulating] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all WhatsApp chat threads
  const loadChats = async (selectFirst: boolean = false) => {
    setLoadingChats(true);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/whatsapp-conversations');
      const data = await response.json();
      if (data.success && data.chats) {
        setChats(data.chats);
        if (selectFirst && data.chats.length > 0 && !selectedPhone) {
          setSelectedPhone(data.chats[0].phone_number);
        }
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to load conversations.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error fetching conversations.' });
    } finally {
      setLoadingChats(false);
    }
  };

  // Load messages for the selected conversation
  const loadMessages = async (phoneNumber: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/whatsapp-conversations?phone_number=${phoneNumber}`);
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      } else {
        console.error('Failed to load thread messages:', data.error);
      }
    } catch (err) {
      console.error('Error fetching messages thread:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadChats(true);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone);
    } else {
      setMessages([]);
    }
  }, [selectedPhone]);

  // Scroll to bottom of message viewport
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch updates periodically (polling)
  useEffect(() => {
    const chatInterval = setInterval(() => {
      loadChats(false);
    }, 12000);

    const messageInterval = setInterval(() => {
      if (selectedPhone) {
        loadMessages(selectedPhone);
      }
    }, 6000);

    return () => {
      clearInterval(chatInterval);
      clearInterval(messageInterval);
    };
  }, [selectedPhone]);

  // Toggle Human Takeover / Disable AI Autopilot
  const handleToggleAi = async (phoneNumber: string, currentDisabled: boolean) => {
    setTogglingAi(true);
    try {
      const response = await fetch('/api/whatsapp-conversations?action=toggle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_phone_number: phoneNumber,
          ai_disabled: !currentDisabled
        })
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically update lists
        setChats(prev => prev.map(c => c.phone_number === phoneNumber ? { ...c, ai_disabled: !currentDisabled } : c));
        loadMessages(phoneNumber);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to toggle autopilot.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating autopilot state.' });
    } finally {
      setTogglingAi(false);
    }
  };

  // Dispatch Manual Administrative Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedPhone) return;

    const activeChat = chats.find(c => c.phone_number === selectedPhone);
    const textToSend = typedMessage.trim();
    setTypedMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch('/api/whatsapp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: selectedPhone,
          message: textToSend,
          contact_name: activeChat?.contact_name || 'WhatsApp User',
          lead_id: activeChat?.lead_id,
          custom_token: localStorage.getItem('whatsapp_token') || undefined,
          custom_phone_id: localStorage.getItem('whatsapp_phone_id') || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        // Append sent message to local viewport
        if (data.saved_log) {
          setMessages(prev => [...prev, data.saved_log]);
        } else {
          loadMessages(selectedPhone);
        }
        // Update chats preview list
        setChats(prev => prev.map(c => c.phone_number === selectedPhone ? { ...c, latest_message: textToSend, latest_sender: 'ai', created_at: new Date().toISOString() } : c));
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send message.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error sending outbound message.' });
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (phoneNumber: string) => {
    if (!window.confirm('Are you absolute sure you want to permanently delete all message logs for this conversation? This won\'t delete the Lead entry.')) return;

    try {
      const response = await fetch(`/api/whatsapp-conversations?target_phone_number=${phoneNumber}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setChats(prev => prev.filter(c => c.phone_number !== phoneNumber));
        setSelectedPhone(null);
        setMessages([]);
        setStatusMessage({ type: 'success', text: 'Chat conversation deleted cleanly.' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete conversion.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error deleting conversation records.' });
    }
  };

  // Simulate Webhook Incoming Message Event
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simPhone.trim() || !simMessage.trim()) return;

    setSimulating(true);
    setStatusMessage(null);
    try {
      const payload = {
        object: "whatsapp_business_account",
        custom_token: localStorage.getItem('whatsapp_token') || undefined,
        custom_phone_id: localStorage.getItem('whatsapp_phone_id') || undefined,
        entry: [
          {
            id: "123456789",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "971500000000",
                    phone_number_id: "971500000000"
                  },
                  contacts: [
                    {
                      profile: {
                        name: simName.trim()
                      },
                      wa_id: simPhone.trim()
                    }
                  ],
                  messages: [
                    {
                      from: simPhone.trim(),
                      id: "wamid.SimulatedMessageID_" + Date.now(),
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: {
                        body: simMessage.trim()
                      },
                      type: "text"
                    }
                  ]
                },
                field: "messages"
              }
            ]
          }
        ]
      };

      const response = await fetch('/api/whatsapp-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully simulated webhook! AI Replied: "${data.aiReplied || 'Replied'}"`
        });
        setSimulatorOpen(false);
        // Reload conversations and select the active simulated phone
        await loadChats(false);
        setSelectedPhone(simPhone.trim());
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to trigger simulated webhook.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error occurred during webhook simulation.'
      });
    } finally {
      setSimulating(false);
    }
  };

  // Save credentials configuration locally
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('whatsapp_token', whatsappToken);
    localStorage.setItem('whatsapp_phone_id', phoneId);
    localStorage.setItem('whatsapp_verify_token', verifyToken);
    setConfigOpen(false);
    setStatusMessage({
      type: 'success',
      text: 'WhatsApp API credentials successfully stored in browser configurations.'
    });
  };

  // Extract collected lead metadata profiles from message timeline
  const activeChat = chats.find(c => c.phone_number === selectedPhone);
  
  // Find qualification details across messages
  const qualificationStats = messages.reduce((acc: any, curr) => {
    const qual = curr.metadata?.qualifications;
    if (qual) {
      if (qual.name) acc.name = qual.name;
      if (qual.company) acc.company = qual.company;
      if (acc.budget) {
         if (qual.budget) acc.budget = qual.budget;
      } else {
         acc.budget = qual.budget;
      }
      if (qual.service_required) acc.service_required = qual.service_required;
      if (qual.country) acc.country = qual.country;
      if (qual.timeline) acc.timeline = qual.timeline;
    }
    return acc;
  }, { name: '', company: '', budget: '', service_required: '', country: '', timeline: '' });

  const filteredChats = chats.filter(c => 
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_number.includes(searchTerm) ||
    c.latest_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]" id="whatsapp_admin_workspace">
      
      {/* 1. Header Status Notification Bar */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between mb-4 animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-950/40 border border-rose-500/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Unified Workspace Area */}
      <div className="flex-1 bg-[#111111]/90 border border-white/5 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 relative shadow-2xl backdrop-blur-md">
        
        {/* LEFT COLUMN: CHAT INDEX (4 cols of 12) */}
        <div className="md:col-span-4 border-r border-white/5 flex flex-col min-h-0 bg-[#0c0c0c]/90">
          {/* List Toolbar search */}
          <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-white/70 font-semibold tracking-wider">WhatsApp Line (Active)</span>
              </div>
              <div className="flex items-center gap-1.5 animate-fade-in">
                <button
                  onClick={() => setConfigOpen(!configOpen)}
                  className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 hover:border-emerald-400 text-[10px] font-mono text-emerald-300 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  title="Configure WhatsApp API Credentials"
                >
                  <Key className="w-3 h-3 text-emerald-400" />
                  <span>API Keys</span>
                </button>
                <button
                  onClick={() => setSimulatorOpen(!simulatorOpen)}
                  className="px-2 py-1 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/20 hover:border-violet-400 text-[10px] font-mono text-violet-300 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  title="Simulate Webhook message"
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>Simulator</span>
                </button>
                <button 
                  onClick={() => loadChats(false)}
                  disabled={loadingChats}
                  className="p-1.5 bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-outline-brand hover:text-white cursor-pointer transition-all disabled:opacity-50"
                  title="Refresh Chat List"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingChats ? 'animate-spin text-primary-brand' : ''}`} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-outline-brand" />
              <input 
                type="text" 
                placeholder="Search contact, phone or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/3 border border-white/5 focus:border-primary-brand/30 rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-white focus:outline-none transition-all placeholder:text-outline-brand"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/2">
            {loadingChats && chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-outline-brand font-mono space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary-brand" />
                <p>Loading WhatsApp database threads...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-outline-brand font-mono">
                No active conversations found matching queries.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = selectedPhone === chat.phone_number;
                return (
                  <button 
                    key={chat.phone_number}
                    onClick={() => setSelectedPhone(chat.phone_number)}
                    className={`w-full p-4 flex flex-col gap-1.5 transition-all outline-none text-left cursor-pointer border-l-2 ${
                      isSelected 
                        ? 'bg-primary-container/[0.08] border-primary-brand text-white' 
                        : 'border-transparent text-outline-brand hover:bg-white/2 hover:text-white/90'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="font-sans font-bold text-xs truncate max-w-[150px] text-white">
                        {chat.contact_name}
                      </div>
                      <div className="font-mono text-[9px] text-outline-brand shrink-0">
                        {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-outline-brand tracking-tight flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#58da81]" />
                      <span>+{chat.phone_number}</span>
                    </div>

                    <p className="text-xs truncate text-outline-brand tracking-wide mt-0.5 max-w-[100%]">
                      {chat.latest_sender === 'ai' ? '🤖: ' : '👤: '}
                      {chat.latest_message}
                    </p>

                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-white/2 w-full">
                      <div className="flex gap-1.5 items-center">
                        {chat.ai_disabled ? (
                          <span className="text-[9px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                            Takeover Mode
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                            AI Autopilot
                          </span>
                        )}
                      </div>

                      {chat.unread_count > 0 && (
                        <span className="text-[10px] font-mono bg-primary-brand text-white font-black px-2 py-0.5 rounded-full shadow-md shadow-primary-brand/35 shrink-0 animate-pulse">
                          {chat.unread_count} pending
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PORT (8 cols of 12) */}
        {selectedPhone && activeChat ? (
          <div className="md:col-span-8 flex flex-col min-h-0 bg-[#0F0F0F]/95">
            {/* Thread Header */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0a0a0a]/90 z-20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-white/5 flex items-center justify-center p-0.5">
                  <User className="w-5 h-5 text-primary-brand" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-white text-sm">{activeChat.contact_name}</h4>
                  <p className="font-mono text-xs text-outline-brand flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    WhatsApp Link: +{activeChat.phone_number}
                  </p>
                </div>
              </div>

              {/* Takeover Control Panel Group */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-white/2 border border-white/5 rounded-xl px-3.5 py-1.5">
                  <span className="font-mono text-[10px] text-outline-brand uppercase font-bold tracking-widest shrink-0">AI autopilot:</span>
                  <button
                    onClick={() => handleToggleAi(activeChat.phone_number, activeChat.ai_disabled)}
                    disabled={togglingAi}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${
                      !activeChat.ai_disabled ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        !activeChat.ai_disabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button 
                  onClick={() => handleDeleteConversation(activeChat.phone_number)}
                  className="p-2 border border-white/5 hover:border-red-500/20 bg-white/2 hover:bg-red-500/10 text-outline-brand hover:text-red-400 rounded-xl cursor-pointer transition-colors"
                  title="Delete Conversation Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI CRM Qualified Leads Box */}
            <div className="bg-primary-container/[0.04] border-b border-white/5 px-4.5 py-3.5 text-xs z-10 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-brand animate-pulse" />
                <span className="font-mono text-[10px] uppercase font-extrabold text-white/90 tracking-widest">Cortex AI - Lead Qualification Intel</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8fe2ff] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Client Name</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.name || activeChat.contact_name || 'Detecting...'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#ce9aff] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Company</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.company || 'Qualifying...'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#7fffca] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Budget Scale</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.budget || 'Qualifying...'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#ffca8b] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Service Required</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.service_required || 'Scanning...'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-[#ffa4be] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Region</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.country || 'AED/Global'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#beff9c] shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-outline-brand font-mono block uppercase">Timeline Intent</span>
                    <span className="font-sans font-bold text-white truncate text-[10px]">
                      {qualificationStats.timeline || 'Qualifying...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thread Body Scroll Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary-brand" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-outline-brand space-y-2">
                  <MessageSquare className="w-8 h-8 text-white/10" />
                  <p className="font-mono text-xs">This WhatsApp chat thread is empty.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurCustomer = msg.sender === 'customer';
                  const isManualReply = msg.metadata?.manual_representative_reply === true;
                  
                  return (
                    <div 
                      key={msg.id || index}
                      className={`flex w-full ${isCurCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-4 flex flex-col gap-1 text-xs border text-left leading-relaxed ${
                        isCurCustomer 
                          ? 'bg-neutral-900 border-white/5 text-neutral-100 rounded-tl-none' 
                          : isManualReply 
                            ? 'bg-violet-950/40 border-violet-500/20 text-violet-200 rounded-tr-none'
                            : 'bg-[#122A42]/50 border-sky-500/20 text-sky-200 rounded-tr-none'
                      }`}>
                        {/* Meta header block */}
                        <div className="flex justify-between items-center gap-4 mb-1">
                          <span className="font-bold text-[10px] text-white/80">
                            {isCurCustomer ? msg.contact_name : isManualReply ? '👤 Corporate Rep' : '🤖 Autopilot Sales AI'}
                          </span>
                          <span className="font-mono text-[9px] text-white/40">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Text Message body */}
                        <p className="font-sans selection:bg-primary-brand/35 text-[13px] whitespace-pre-wrap">{msg.message}</p>

                        {/* Outbound diagnostic status footer tags */}
                        {!isCurCustomer && (
                          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/5 justify-end">
                            {isManualReply ? (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-1 py-0.5 rounded">
                                Outbound manual
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-400/10 px-1 py-0.5 rounded">
                                Autopilot reply
                              </span>
                            )}
                            
                            {msg.metadata?.whatsapp_delivery_attempted === false && (
                              <span className="text-[8px] font-mono text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded" title="Verify WhatsApp settings. Delivery failed.">
                                Delivery API Error
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Active Thread Footer Entry input form */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/5 bg-[#0a0a0a]/90 flex gap-3 items-center shrink-0"
            >
              <input 
                type="text" 
                placeholder={
                  activeChat.ai_disabled 
                    ? "Type a manual WhatsApp message to send..." 
                    : "⚠️ AI is active. Toggle 'AI Autopilot' switch above to take over manually, or write here to inject manual response."
                }
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                disabled={sendingMessage}
                className="flex-1 bg-white/3 border border-white/5 focus:border-primary-brand/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all placeholder:text-outline-brand font-sans"
              />
              <button 
                type="submit"
                disabled={sendingMessage || !typedMessage.trim()}
                className="p-3 bg-primary-brand text-white border border-primary-brand/20 hover:bg-primary-brand-dark rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary-brand/30 hover:scale-103"
              >
                {sendingMessage ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 translate-x-[1px]" />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex flex-col items-center justify-center text-center p-12 bg-[#0F0F0F]/95">
            <div className="relative mb-4">
              <Bot className="w-12 h-12 text-white/5" />
              <Radio className="w-4 h-4 text-emerald-400 absolute -right-1 -bottom-1 animate-pulse" />
            </div>
            <h3 className="font-display font-bold text-white text-base">WhatsApp Communication Center</h3>
            <p className="font-mono text-xs text-outline-brand max-w-sm mt-2 leading-relaxed">
              Select an active contact session from the left-hand directory to view WhatsApp thread, monitor qualification metrics, and perform human takeovers.
            </p>
          </div>
        )}

      </div>

      {/* 3. Webhook Simulator Modal Overlay */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-left">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="font-sans font-black text-white text-base flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              <span>WhatsApp Webhook Simulator</span>
            </h3>
            <p className="font-sans text-xs text-outline-brand mb-4 leading-relaxed">
              Test your Meta WhatsApp webhook configurations instantly. This dispatches a structured incoming message packet to 
              <code className="font-mono bg-white/5 text-violet-300 px-1.5 py-0.5 rounded mx-1">/api/whatsapp-webhook</code> 
              to trigger the CRM auto-lead generation and Gemini qualification analysis pipeline.
            </p>

            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">Sender Profile Name</label>
                <input 
                  type="text" 
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="e.g. Ali Reda"
                  required
                  className="w-full bg-white/3 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder:text-outline-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">Sender Whatsapp Number (Digits only)</label>
                <input 
                  type="text" 
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="e.g. 971505551234"
                  required
                  className="w-full bg-white/3 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder:text-outline-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">Incoming Message Body</label>
                <textarea 
                  rows={4}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  placeholder="Ask a question about Nexloop's SPC Sharjah licenses, Amazon e-commerce services, etc."
                  required
                  className="w-full bg-white/3 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder:text-outline-brand resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSimulatorOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-outline-brand hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-55 font-sans"
                >
                  {simulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Webhook</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. API Credentials Configuration Modal Overlay */}
      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-left">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="font-sans font-black text-white text-base flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>WhatsApp API Credentials</span>
            </h3>
            <p className="font-sans text-xs text-outline-brand mb-4 leading-relaxed">
              Paste your Meta Business Cloud developer credentials below. Storing these credentials temporarily in your local browser sandbox allows you to instantly test and dispatch real outbound messages.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">WhatsApp System User Access Token / Temporary Token</label>
                <textarea 
                  rows={3}
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  placeholder="Paste your EAAB... Meta developer access token"
                  required
                  className="w-full bg-white/3 border border-white/5 focus:border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder:text-outline-brand resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">WhatsApp Phone Number ID (`WHATSAPP_PHONE_NUMBER_ID`)</label>
                <input 
                  type="text" 
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  placeholder="e.g. 104692742398433"
                  required
                  className="w-full bg-white/3 border border-white/5 focus:border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder:text-outline-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-outline-brand uppercase font-bold mb-1">Verify Token (`WHATSAPP_VERIFY_TOKEN` - Optional)</label>
                <input 
                  type="text" 
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  placeholder="e.g. nexloop_verify_token"
                  className="w-full bg-white/3 border border-white/5 focus:border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none placeholder:text-outline-brand"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfigOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-outline-brand hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Config Sandbox Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
