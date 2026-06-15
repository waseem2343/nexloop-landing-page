import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Award,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_interest: string;
  status: string;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Modals management state
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [creatingLead, setCreatingLead] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Lead form fields
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    phone: '',
    service_interest: 'Remote UAE Corporate License',
    status: 'New'
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const res = await fetch('/api/admin?action=leads');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLeads(json.data);
      } else {
        throw new Error(json.error || 'Server returned invalid or empty leads payload.');
      }
    } catch (err: any) {
      console.error("[Leads Page] Load leads error:", err);
      setErrorStatus(err.message || 'Database connection error. Failed to retrieve leads from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/admin?action=leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCreatingLead(false);
        setFormFields({
          name: '',
          email: '',
          phone: '',
          service_interest: 'Remote UAE Corporate License',
          status: 'New'
        });
        await loadLeads();
      } else {
        throw new Error(data.error || 'Database rejected post submission.');
      }
    } catch (err: any) {
      console.error("[Leads Page] Create lead error:", err);
      setErrorStatus(err.message || 'Failed to save new lead. Database connection rejected the record insert.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setSubmitting(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/admin?action=leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead)
      });
      const data = await res.json();
      if (data.success) {
        setEditingLead(null);
        await loadLeads();
      } else {
        throw new Error(data.error || 'DB update operation rejected.');
      }
    } catch (err: any) {
      console.error("[Leads Page] Edit lead error:", err);
      setErrorStatus(err.message || 'Failed to sync updates to Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Verify: Are you sure you wish to delete this CRM lead record? This is irreversible.")) return;
    setErrorStatus(null);
    try {
      const res = await fetch(`/api/admin?action=leads&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadLeads();
      } else {
        throw new Error(data.error || 'DB delete operation rejected.');
      }
    } catch (err: any) {
      console.error("[Leads Page] Delete lead error:", err);
      setErrorStatus(err.message || 'Failed to delete lead from Supabase.');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.service_interest?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesService = serviceFilter === 'All' || lead.service_interest?.toLowerCase().includes(serviceFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 border-blue-500/25 text-blue-400';
      case 'Contacted':
        return 'bg-amber-500/10 border-amber-500/25 text-amber-400';
      case 'Qualified':
        return 'bg-violet-500/10 border-violet-500/25 text-violet-400';
      case 'Negotiating':
        return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
      case 'Closed Won':
        return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
      case 'Closed Lost':
        return 'bg-red-500/10 border-red-500/25 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500/25 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Page Title & Add New Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-white tracking-tight">Leads CRM Database</h2>
          <p className="text-xs text-outline-brand mt-0.5">Capture inquiries, manage business funnels, and prioritize pipelines.</p>
        </div>
        <button 
          onClick={() => setCreatingLead(true)}
          className="px-5 py-3 rounded-full bg-primary-container hover:bg-opacity-95 text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-container/15 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead Record</span>
        </button>
      </div>

      {/* Error alert indicator */}
      {errorStatus && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs font-mono">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Toolbar - Search, Sort and Filtering Controls */}
      <div className="p-5 bg-[#111111]/95 border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 select-none">
        {/* Search field */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-outline-brand" />
          <input 
            type="text" 
            placeholder="Search leads by name, email, phone or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white placeholder:text-outline-brand focus:outline-none transition-colors"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#1c1b1b] border border-white/5 rounded-full px-4 py-2.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-outline-brand" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-outline-brand">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-semibold"
            >
              <option value="All" className="bg-[#111111] text-white">All Statuses</option>
              <option value="New" className="bg-[#111111] text-white">New</option>
              <option value="Contacted" className="bg-[#111111] text-white">Contacted</option>
              <option value="Qualified" className="bg-[#111111] text-white">Qualified</option>
              <option value="Negotiating" className="bg-[#111111] text-white">Negotiating</option>
              <option value="Closed Won" className="bg-[#111111] text-white">Closed Won</option>
              <option value="Closed Lost" className="bg-[#111111] text-white">Closed Lost</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2 bg-[#1c1b1b] border border-white/5 rounded-full px-4 py-2.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-outline-brand">Service:</span>
            <select 
              value={serviceFilter} 
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-semibold"
            >
              <option value="All" className="bg-[#111111] text-white">All Services</option>
              <option value="Remote License" className="bg-[#111111] text-white">UAE Licensing</option>
              <option value="Amazon" className="bg-[#111111] text-white">Amazon Support</option>
              <option value="Shopify" className="bg-[#111111] text-white">Shopify Hub</option>
              <option value="Local Sourcing" className="bg-[#111111] text-white">Sourcing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List View Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
          <p className="text-xs font-mono text-outline-brand animate-pulse">Syncing leads collection database...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-16 text-center bg-[#111111]/50 border border-white/5 rounded-3xl space-y-3">
          <p className="text-sm text-outline-brand">No lead records coincide with search criteria or filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); setServiceFilter('All'); }}
            className="text-xs text-primary-brand font-bold hover:underline"
          >
            Clear Active Filter Search
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#111111]/70 border border-white/5 rounded-3xl shadow-xl">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-outline-brand font-bold bg-[#131313]/90">
                <th className="py-4.5 px-6">Profile / Name</th>
                <th className="py-4.5 px-6">Email Contact</th>
                <th className="py-4.5 px-6">Phone Number</th>
                <th className="py-4.5 px-6">Desired Service</th>
                <th className="py-4.5 px-6">Funnel Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[13px] font-medium text-white/95">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container/10 border border-primary-brand/10 text-primary-brand text-xs font-black flex items-center justify-center shrink-0">
                        {lead.name ? lead.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'NL'}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary-brand transition-colors">{lead.name}</div>
                        <div className="text-[10px] font-mono text-outline-brand mt-0.5">ID: {lead.id} • {new Date(lead.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-outline-brand">{lead.email}</td>
                  <td className="py-4 px-6 font-mono text-xs text-outline-brand">{lead.phone}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-[11px] font-bold text-white/90 bg-white/5 border border-white/5 rounded-full">
                      {lead.service_interest}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewLead(lead)}
                        className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer transition-colors"
                        title="View Detailed Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingLead(lead)}
                        className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-primary-brand rounded-lg cursor-pointer transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewLead && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 text-left">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-primary-container/20 to-transparent flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-brand" />
                <h3 className="text-md font-display font-black text-white">Client Lead dossier</h3>
              </div>
              <button onClick={() => setViewLead(null)} className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-14 h-14 rounded-full bg-primary-container text-white text-lg font-black flex items-center justify-center">
                  {viewLead.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{viewLead.name}</h4>
                  <p className="text-xs text-outline-brand">Registered CRM Client ID: {viewLead.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider block">Email Contact</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <Mail className="w-3.5 h-3.5 text-primary-brand shrink-0" />
                    <span>{viewLead.email}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider block">Phone Directory</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <Phone className="w-3.5 h-3.5 text-secondary-container shrink-0" />
                    <span>{viewLead.phone}</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-4 border-t border-white/[0.04]">
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider block">Target Service</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-white block w-fit mt-1 border border-white/10">{viewLead.service_interest}</span>
                </div>
                <div className="space-y-1.5 pt-4 border-t border-white/[0.04]">
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider block">Lead Capture Stage</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wide text-[9px] block w-fit mt-1 border ${getStatusBadge(viewLead.status)}`}>
                    {viewLead.status}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-outline-brand uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-secondary-container" />
                  <span>Audit History Timestamps</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">
                  Enrolled on: {new Date(viewLead.created_at).toLocaleString()}
                </p>
                <p className="text-[11px] text-outline-brand leading-relaxed pt-1.5 border-t border-white/5">
                  Assigned to: General Commercial Agent Desk Sharjah. Auto-sync integration checks fully compiled.
                </p>
              </div>
            </div>
            <div className="p-5 bg-[#111111]/80 border-t border-white/5 flex justify-end gap-3 rounded-b-[32px]">
              <button 
                onClick={() => { setViewLead(null); setEditingLead(viewLead); }}
                className="px-4.5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
              >
                Modify Record
              </button>
              <button 
                onClick={() => setViewLead(null)}
                className="px-5 py-2.5 rounded-full bg-[#1c1b1b] text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {creatingLead && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 text-left">
          <form onSubmit={handleCreateLead} className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-primary-container/20 to-transparent flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-primary-brand" />
                <h3 className="text-md font-display font-black text-white">Capture New Lead Dossier</h3>
              </div>
              <button type="button" onClick={() => setCreatingLead(false)} className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Client Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Khalid Al-Maktoum"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none placeholder:text-outline-brand/70"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. contact@domain.ae"
                    value={formFields.email}
                    onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none placeholder:text-outline-brand/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Phone Connection</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. +971 52 123 4567"
                    value={formFields.phone}
                    onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none placeholder:text-outline-brand/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Strategic Service Line</label>
                  <select 
                    value={formFields.service_interest}
                    onChange={(e) => setFormFields({ ...formFields, service_interest: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Remote UAE Corporate License">Remote UAE Corporate License</option>
                    <option value="Amazon & Noon Support">Amazon & Noon Support</option>
                    <option value="Shopify & E-commerce Hub">Shopify & E-commerce Hub</option>
                    <option value="Paid Brand Ads & Growth">Paid Brand Ads & Growth</option>
                    <option value="Local UAE Product Sourcing">Local UAE Product Sourcing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Capture Stage</label>
                  <select 
                    value={formFields.status}
                    onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 bg-[#111111]/80 border-t border-white/5 flex justify-end gap-3 rounded-b-[32px]">
              <button 
                type="button" 
                onClick={() => setCreatingLead(false)}
                className="px-5 py-2.5 rounded-full bg-[#1c1b1b] text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-primary-container hover:bg-opacity-95 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enroll Lead</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDITING LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 text-left">
          <form onSubmit={handleEditLead} className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-primary-container/20 to-transparent flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-primary-brand" />
                <h3 className="text-md font-display font-black text-white">Modify Client Dossier</h3>
              </div>
              <button type="button" onClick={() => setEditingLead(null)} className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Client Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Phone Connection</label>
                  <input 
                    type="text" 
                    required
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Strategic Service Line</label>
                  <select 
                    value={editingLead.service_interest}
                    onChange={(e) => setEditingLead({ ...editingLead, service_interest: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Remote UAE Corporate License">Remote UAE Corporate License</option>
                    <option value="Amazon & Noon Support">Amazon & Noon Support</option>
                    <option value="Shopify & E-commerce Hub">Shopify & E-commerce Hub</option>
                    <option value="Paid Brand Ads & Growth">Paid Brand Ads & Growth</option>
                    <option value="Local UAE Product Sourcing">Local UAE Product Sourcing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Capture Stage</label>
                  <select 
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 bg-[#111111]/80 border-t border-white/5 flex justify-end gap-3 rounded-b-[32px]">
              <button 
                type="button" 
                onClick={() => setEditingLead(null)}
                className="px-5 py-2.5 rounded-full bg-[#1c1b1b] text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-primary-container hover:bg-opacity-95 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
