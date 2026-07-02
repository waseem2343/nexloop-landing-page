import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, Loader2, Sparkles, LogIn, ArrowRight, Mail } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText('');

    try {
      // Firebase email/password authentication
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (error: any) {
      const errorCode = error.code || '';
      
      let friendlyMessage = 'Authentication failed. Please try again.';
      
      if (errorCode === 'auth/invalid-email') {
        friendlyMessage = 'Invalid email address';
      } else if (errorCode === 'auth/user-disabled') {
        friendlyMessage = 'This user account has been disabled';
      } else if (errorCode === 'auth/user-not-found') {
        friendlyMessage = 'No account found with this email';
      } else if (errorCode === 'auth/wrong-password') {
        friendlyMessage = 'Incorrect password';
      } else if (errorCode === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed attempts. Please try again later';
      }
      
      setErrorText(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantBypass = () => {
    // For development/sandbox: Quick bypass using environment credentials
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@nexloop.local';
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'demo123456';
    
    setLoading(true);
    setErrorText('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    setTimeout(() => {
      signInWithEmailAndPassword(auth, demoEmail, demoPassword)
        .then(() => navigate('/admin'))
        .catch((error) => {
          setErrorText('Sandbox bypass unavailable. Please use your Firebase credentials.');
          console.warn('Demo login failed:', error);
        })
        .finally(() => setLoading(false));
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-on-surface-brand flex flex-col justify-center items-center px-4 relative select-none">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10 text-center">
        
        {/* Logo and Brand Title header */}
        <div className="space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl overflow-hidden bg-primary-container p-2 border border-white/10 shadow-lg shadow-primary-container/20">
            <img 
              alt="Nexloop" 
              className="w-full h-full object-contain" 
              src="https://rdrsmrdhrbigldgvttr2wc.supabase.co/storage/v1/object/public/nexloop-assets/nexloop_isometric_emblem.png" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-black text-white tracking-tight">Nexloop Cortex CRM</h2>
            <p className="text-xs text-outline-brand font-mono uppercase tracking-widest">Platform Administration Console</p>
          </div>
        </div>

        {/* Credentials Form Box Card */}
        <div className="glass-card bg-[#111111]/90 border border-white/5 p-8 rounded-[32px] text-left space-y-6 shadow-2xl">
          
          <div className="flex gap-2.5 p-3.5 bg-primary-container/10 border border-primary-brand/10 text-primary-brand rounded-2xl text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-primary-brand" />
            <span>Firebase authentication is active. Sign in with your Nexloop admin credentials. For sandbox testing, click <strong>Quick Demo Login</strong>.</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-outline-brand" />
                <input 
                  type="email" 
                  placeholder="admin@nexloop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-5 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white placeholder:text-outline-brand focus:outline-none focus:ring-1 focus:ring-primary-brand/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-outline-brand uppercase tracking-wider font-mono font-bold">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-outline-brand" />
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-5 py-3 rounded-2xl bg-[#1c1b1b] border border-white/5 focus:border-primary-brand/35 text-xs text-white placeholder:text-outline-brand focus:outline-none focus:ring-1 focus:ring-primary-brand/10"
                />
              </div>
            </div>

            {errorText && (
              <p className="text-[11px] font-mono text-red-400">{errorText}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-full bg-primary-container text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary-container/10 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              <span>Sign In</span>
            </button>

          </form>

          {/* Quick Demo Login for Sandbox */}
          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2.5">
            <button 
              onClick={handleInstantBypass}
              type="button"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Quick Demo Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-[10px] font-mono text-outline-brand">
          Handshake protocols secured by end-to-end sandbox telemetry.
        </p>

      </div>

    </div>
  );
}
