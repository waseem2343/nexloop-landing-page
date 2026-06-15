import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Loader2, 
  PlusCircle, 
  Tag, 
  FolderClosed, 
  BookMarked,
  Info
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  keywords: string;
  status: string;
  content: string;
}

export default function AdminKnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals management state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [creatingArticle, setCreatingArticle] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Article form fields
  const [formFields, setFormFields] = useState({
    title: '',
    category: 'Corporate Setup',
    keywords: '',
    status: 'Published',
    content: ''
  });

  const loadArticles = async () => {
    console.log("[KB Audit] Fetching articles from database...");
    try {
      const res = await fetch('/api/admin?action=knowledge-base');
      const json = await res.json();
      console.log("[KB Audit] GET response payload:", json);
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
      } else {
        console.error("[KB Audit] GET response was not successful or missing data array:", json);
      }
    } catch (err: any) {
      console.error("[KB Audit] GET request error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("[KB Audit] POST request payload:", formFields);
    try {
      const res = await fetch('/api/admin?action=knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formFields)
      });
      const data = await res.json();
      console.log("[KB Audit] POST response payload:", data);
      if (data.success && data.data) {
        setArticles(prev => [data.data, ...prev]);
      } else {
        console.error("[KB Audit] POST failed, response error:", data.error || "No data");
      }
    } catch (err) {
      console.error("[KB Audit] POST application/network error:", err);
    } finally {
      setSubmitting(false);
      setCreatingArticle(false);
      setFormFields({
        title: '',
        category: 'Corporate Setup',
        keywords: '',
        status: 'Published',
        content: ''
      });
    }
  };

  const handleEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setSubmitting(true);
    console.log("[KB Audit] PUT request payload:", editingArticle);
    try {
      const res = await fetch('/api/admin?action=knowledge-base', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArticle)
      });
      const data = await res.json();
      console.log("[KB Audit] PUT response payload:", data);
      if (data.success && data.data) {
        const updatedArticle = data.data;
        setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
      } else {
        console.error("[KB Audit] PUT failed, response error:", data.error || "No data");
      }
    } catch (err) {
      console.error("[KB Audit] PUT application/network error:", err);
    } finally {
      setSubmitting(false);
      setEditingArticle(null);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Verify: Remove this article from AI self-learning knowledge bank index?")) return;
    console.log("[KB Audit] DELETE request ID:", id);
    try {
      const res = await fetch(`/api/admin?action=knowledge-base&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      console.log("[KB Audit] DELETE response payload:", data);
      if (data.success) {
        setArticles(prev => prev.filter(a => a.id !== id));
      } else {
        console.error("[KB Audit] DELETE failed, response error:", data.error || "No success flag");
      }
    } catch (err) {
      console.error("[KB Audit] DELETE application/network error:", err);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || article.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-white tracking-tight">AI Knowledge Base Index</h2>
          <p className="text-xs text-outline-brand mt-0.5">Define facts, documentation articles, FAQs, and business credentials accessed by Gemini.</p>
        </div>
        <button 
          onClick={() => setCreatingArticle(true)}
          className="px-5 py-3 rounded-full bg-primary-container hover:bg-opacity-95 text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-container/15 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Document Article</span>
        </button>
      </div>

      {/* Info Notice Box */}
      <div className="flex gap-3 p-4 bg-primary-container/10 border border-primary-brand/15 text-primary-brand rounded-2xl text-xs leading-relaxed select-none">
        <Info className="w-5 h-5 shrink-0 text-primary-brand" />
        <div>
          <span className="font-bold block text-white mb-0.5 font-sans">Semantic AI Integration:</span>
          Articles that are set as <strong className="text-white">Published</strong> are dynamically compiled as high-priority reference material within the AI bot system schema. This ensures precise, factory-proof answers on Sharjah setups and local sourcing.
        </div>
      </div>

      {/* Toolbar Filter Controls */}
      <div className="p-5 bg-[#111111]/95 border border-white/5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-outline-brand" />
          <input 
            type="text" 
            placeholder="Search documents by keywords, text elements or titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-full bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white placeholder:text-outline-brand focus:outline-none transition-colors"
          />
        </div>

        {/* Category filter dropdown */}
        <div className="flex items-center gap-2 bg-[#1c1b1b] border border-white/5 rounded-full px-4 py-2.5 w-full sm:w-auto">
          <FolderClosed className="w-3.5 h-3.5 text-outline-brand" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-outline-brand">Category:</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-semibold"
          >
            <option value="All" className="bg-[#111111] text-white">All Categories</option>
            <option value="Corporate Setup" className="bg-[#111111] text-white">Corporate Setup</option>
            <option value="Shopify Hub" className="bg-[#111111] text-white">Shopify Hub</option>
            <option value="Amazon Support" className="bg-[#111111] text-white">Amazon Support</option>
            <option value="Local Sourcing" className="bg-[#111111] text-white">Local Sourcing</option>
          </select>
        </div>
      </div>

      {/* Table Data list panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
          <p className="text-xs font-mono text-outline-brand animate-pulse">Consulting knowledge metadata catalogs...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-16 text-center bg-[#111111]/50 border border-white/5 rounded-3xl space-y-3">
          <p className="text-sm text-outline-brand text-center select-none">No documentation articles found matching search requirements.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#111111]/70 border border-white/5 rounded-3xl shadow-xl">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-[#8c90a1] font-bold bg-[#131313]/95">
                <th className="py-4.5 px-6">Document Title</th>
                <th className="py-4.5 px-6">Classification Category</th>
                <th className="py-4.5 px-6">Semantic Keywords</th>
                <th className="py-4.5 px-6">Reference Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[13px] font-medium text-white/95">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary-container/10 border border-secondary-container/10 flex items-center justify-center shrink-0">
                        <BookMarked className="w-4.5 h-4.5 text-secondary-container" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-secondary-container transition-colors leading-snug">{article.title}</div>
                        <div className="text-[10px] font-mono text-outline-brand mt-0.5">UID: {article.id}</div>
                        {article.content && (
                          <div className="text-[11px] text-[#8c90a1] mt-1 line-clamp-2 max-w-sm font-normal">
                            &ldquo;{article.content}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 font-semibold text-[#b9f1ff]">{article.category}</td>
                  <td className="py-4.5 px-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                      {article.keywords.split(',').map((kw, i) => (
                        <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.03] border border-white/5 text-outline-brand">
                          <Tag className="w-2.5 h-2.5 shrink-0 text-outline-brand" />
                          <span>{kw.trim()}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4.5 px-6">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border rounded-full ${
                      article.status === 'Published' 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingArticle(article)}
                        className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-secondary-container rounded-lg cursor-pointer"
                        title="Edit Article parameters"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-red-400 rounded-lg cursor-pointer"
                        title="Remove Article"
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

      {/* CREATE ARTICLE MODAL */}
      {creatingArticle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 text-left">
          <form onSubmit={handleCreateArticle} className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-secondary-container/10 to-transparent flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-secondary-container" />
                <h3 className="text-md font-display font-black text-white">Create AI Core Reference</h3>
              </div>
              <button type="button" onClick={() => setCreatingArticle(false)} className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Document Title / Concept</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sourcing coordinates in Deira Dubai Markets"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Knowledge Category</label>
                  <select 
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Corporate Setup">Corporate Setup</option>
                    <option value="Shopify Hub">Shopify Hub</option>
                    <option value="Amazon Support">Amazon Support</option>
                    <option value="Local Sourcing">Local Sourcing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Index Status</label>
                  <select 
                    value={formFields.status}
                    onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Semantic indexing Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. dubai, wholesale, sourcing, deira"
                  value={formFields.keywords}
                  onChange={(e) => setFormFields({ ...formFields, keywords: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Knowledge Content</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="e.g. Nexloop helps clients with UAE company formation, free zone license setup, mainland license guidance, visa assistance, business activity selection, document preparation, and bank account guidance."
                  value={formFields.content}
                  onChange={(e) => setFormFields({ ...formFields, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none resize-none font-sans"
                />
              </div>

            </div>
            <div className="p-5 bg-[#111111]/80 border-t border-white/5 flex justify-end gap-3 rounded-b-[32px]">
              <button 
                type="button" 
                onClick={() => setCreatingArticle(false)}
                className="px-5 py-2.5 rounded-full bg-[#1c1b1b] text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-secondary-container hover:bg-opacity-95 text-xs font-bold text-[#00363f] uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enroll Article</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDITING ARTICLE MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[150] p-4 text-left">
          <form onSubmit={handleEditArticle} className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-secondary-container/10 to-transparent flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-secondary-container" />
                <h3 className="text-md font-display font-black text-white">Modify Article credentials</h3>
              </div>
              <button type="button" onClick={() => setEditingArticle(null)} className="p-1.5 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Document Title / Concept</label>
                <input 
                  type="text" 
                  required
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Knowledge Category</label>
                  <select 
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Corporate Setup">Corporate Setup</option>
                    <option value="Shopify Hub">Shopify Hub</option>
                    <option value="Amazon Support">Amazon Support</option>
                    <option value="Local Sourcing">Local Sourcing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Index Status</label>
                  <select 
                    value={editingArticle.status}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Semantic indexing Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  value={editingArticle.keywords}
                  onChange={(e) => setEditingArticle({ ...editingArticle, keywords: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-outline-brand uppercase tracking-wider font-bold">Knowledge Content</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter full training information for the AI..."
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-secondary-container/35 text-xs text-white focus:outline-none resize-none font-sans"
                />
              </div>

            </div>
            <div className="p-5 bg-[#111111]/80 border-t border-white/5 flex justify-end gap-3 rounded-b-[32px]">
              <button 
                type="button" 
                onClick={() => setEditingArticle(null)}
                className="px-5 py-2.5 rounded-full bg-[#1c1b1b] text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-secondary-container hover:bg-opacity-95 text-xs font-bold text-[#00363f] uppercase tracking-wider flex items-center gap-2 cursor-pointer"
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
