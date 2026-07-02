import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronLeft, 
  Menu, 
  Globe, 
  Database, 
  Clock, 
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Highlight active menu item
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    // Ticking UTC Clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Fetch DB/Server health status info
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbHealthy(data.stats.databaseHealthy !== false);
        } else {
          setDbHealthy(false);
        }
      })
      .catch(() => setDbHealthy(false));

    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Leads CRM', path: '/admin/leads', icon: Users },
    { label: 'AI Conversations', path: '/admin/conversations', icon: MessageSquare },
    { label: 'Knowledge Base', path: '/admin/knowledge-base', icon: BookOpen },
    { label: 'AI Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-surface-brand font-sans flex flex-col md:flex-row overflow-hidden selection:bg-primary-container selection:text-white">
      
      {/* 1. Mobile Top Bar Navigation */}
      <div className="md:hidden w-full bg-[#131313] border-b border-white/5 px-4 py-3 flex justify-between items-center z-55">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary-container p-0.5">
            <img 
              alt="Nexloop" 
              className="w-full h-full object-contain" 
              src="https://rdrsmrdhrbigldgvttr2wc.supabase.co/storage/v1/object/public/nexloop-assets/nexloop_isometric_emblem.png" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display font-black text-white tracking-tight text-sm">Nexloop CRM</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-on-surface-variant hover:text-white bg-white/5 border border-white/10 rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Responsive Sidebar - Desktop & Slide-out for Mobile */}
      <aside 
        className={`fixed md:relative top-0 bottom-0 left-0 bg-[#0E0E0E] border-r border-white/5 flex flex-col transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex justify-between items-center border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary-container p-1 shrink-0">
              <img 
                alt="Nexloop" 
                className="w-full h-full object-contain" 
                src="https://rdrsmrdhrbigldgvttr2wc.supabase.co/storage/v1/object/public/nexloop-assets/nexloop_isometric_emblem.png" 
                referrerPolicy="no-referrer"
              />
            </div>
            {sidebarOpen && (
              <span className="font-display font-black text-white text-base tracking-tight whitespace-nowrap animate-fade-in">
                Nexloop <span className="text-primary-brand text-xs">Cortex</span>
              </span>
            )}
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1 hover:bg-white/5 text-outline-brand hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Active = isActive(item.path);
            const IconComp = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 group relative cursor-pointer ${
                  Active 
                    ? 'bg-primary-container text-white shadow-lg shadow-primary-container/15 font-extrabold' 
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComp className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${Active ? 'text-white' : 'text-outline-brand'}`} />
                {sidebarOpen && <span className="whitespace-nowrap transition-opacity">{item.label}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-16 bg-surface-container border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/50 space-y-3 shrink-0">
          <Link 
            to="/" 
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-outline-brand hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-outline-brand" />
            {sidebarOpen && <span>Public Website</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Background Mask for Mobile Overlay sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 3. Main Dashboard Terminal Workspaces */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
        
        {/* Workspace Top Header Bar */}
        <header className="bg-[#0E0E0E] border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-30 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary-brand font-bold uppercase tracking-widest px-2 py-0.5 bg-primary-container/10 border border-primary-brand/20 rounded-md">
                Admin Console
              </span>
              <span className="text-[10px] font-mono text-[#b9f1ff] uppercase tracking-widest">
                v1.17
              </span>
            </div>
            <h1 className="text-xl font-display font-black text-white tracking-tight mt-1">
              {navItems.find(n => isActive(n.path))?.label || 'Platform Console'}
            </h1>
          </div>

          {/* Diagnostic Metrics Pill Bar */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-outline-brand font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/3 border border-white/5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-secondary-container animate-pulse" />
              <span>UTC: {currentTime || 'Clock Initializing...'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/3 border border-white/5 rounded-full">
              <Server className="w-3.5 h-3.5 text-[#ffb59d]" />
              <span>Node: Cloud-Run</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/3 border border-white/5 rounded-full">
              <Database className={`w-3.5 h-3.5 ${dbHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className={dbHealthy === true ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {dbHealthy === true ? 'Supabase: Sync' : dbHealthy === false ? 'Local Fallback' : 'Connecting...'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-6 md:p-8 relative">
          {/* Subtle glowing mesh backdrop strictly local to work area */}
          <div className="absolute top-[5%] right-[5%] w-[400px] h-[400px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />
          
          <Outlet />
        </main>

        {/* Bottom copyright status bar */}
        <footer className="bg-[#0E0E0E] border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-outline-brand shrink-0">
          <div>
            Nexloop AI System Platform &copy; {new Date().getFullYear()} Sharjah Holding, UAE.
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Telemetry Link Operational / Latency 8ms</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
