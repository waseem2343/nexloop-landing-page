/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  Layers, 
  Activity, 
  Maximize2, 
  Cpu, 
  ShieldCheck, 
  Menu, 
  X, 
  Flame, 
  Briefcase, 
  Code,
  ShoppingCart,
  ShoppingBag,
  Megaphone,
  Target,
  Smartphone,
  Palette,
  Building2,
  Phone
} from 'lucide-react';
import { IMAGES, PILLARS, METHODOLOGY_STEPS } from './data';
import { StrategicPillar } from './types';
import SpotlightCard from './components/SpotlightCard';
import ServiceModal from './components/ServiceModal';
import ContactForm from './components/ContactForm';
import AiMatrixBackground from './components/AiMatrixBackground';
import AiChatbot from './components/AiChatbot';

// CRM Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeads from './pages/admin/AdminLeads';
import AdminConversations from './pages/admin/AdminConversations';
import AdminKnowledgeBase from './pages/admin/AdminKnowledgeBase';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';

// Helper component to resolve specific icons dynamically
const getPillarIcon = (iconType: string) => {
  const iconProps = { className: "w-6 h-6 text-primary-brand group-hover:scale-105 transition-transform duration-300" };
  switch (iconType) {
    case 'ecommerce':
      return <ShoppingCart className="w-6 h-6 text-primary-brand group-hover:scale-105 transition-transform duration-300" />;
    case 'shopify':
      return <ShoppingBag className="w-6 h-6 text-emerald-400 group-hover:scale-105 transition-transform duration-300" />;
    case 'marketing':
      return <Megaphone className="w-6 h-6 text-[#a5eeff] group-hover:scale-105 transition-transform duration-300" />;
    case 'ads':
      return <Target className="w-6 h-6 text-amber-400 group-hover:scale-105 transition-transform duration-300" />;
    case 'webdev':
      return <Code className="w-6 h-6 text-[#0066ff] group-hover:scale-105 transition-transform duration-300" />;
    case 'mobile':
      return <Smartphone className="w-6 h-6 text-purple-400 group-hover:scale-105 transition-transform duration-300" />;
    case 'pos':
      return <Cpu className="w-6 h-6 text-[#ce93d8] group-hover:scale-105 transition-transform duration-300" />;
    case 'graphic':
      return <Palette className="w-6 h-6 text-rose-400 group-hover:scale-105 transition-transform duration-300" />;
    case 'corporate':
      return <Building2 className="w-6 h-6 text-tertiary-brand group-hover:scale-105 transition-transform duration-300" />;
    case 'ai':
      return <Sparkles className="w-6 h-6 text-violet-400 group-hover:scale-105 transition-transform duration-300" />;
    default:
      return <Briefcase {...iconProps} />;
  }
};

export function PublicWebsite() {
  const [scrollY, setScrollY] = useState(0);
  const [activePillar, setActivePillar] = useState<StrategicPillar | null>(null);
  const [selectedMethodologyPhase, setSelectedMethodologyPhase] = useState<string>('01');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('Web Design & Development');
  
  // Real-time metrics
  const [currentTime, setCurrentTime] = useState('');
  const [activeUsersCount, setActiveUsersCount] = useState(14);

  // Smooth-scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Set ticking clock
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
    const clockInterval = setInterval(updateTime, 1000);

    // Simulate subtle variance in active users count
    const usersInterval = setInterval(() => {
      setActiveUsersCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next > 25 ? 25 : next < 8 ? 8 : next;
      });
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(clockInterval);
      clearInterval(usersInterval);
    };
  }, []);

  // Filter Pillars based on interactive selection tag
  const filteredPillars = PILLARS.filter((pillar) => {
    if (selectedTagFilter === 'All') return true;
    if (selectedTagFilter === 'Growth') {
      return (
        pillar.iconType === 'ecommerce' || 
        pillar.iconType === 'marketing' || 
        pillar.iconType === 'shopify' || 
        pillar.iconType === 'ads' || 
        pillar.iconType === 'graphic'
      );
    }
    if (selectedTagFilter === 'Tech & Dev') {
      return (
        pillar.iconType === 'webdev' || 
        pillar.iconType === 'mobile' || 
        pillar.iconType === 'pos' ||
        pillar.iconType === 'ai'
      );
    }
    if (selectedTagFilter === 'Corporate & Global') {
      return pillar.iconType === 'corporate';
    }
    return true;
  });

  const activeMethodology = METHODOLOGY_STEPS.find(m => m.phase === selectedMethodologyPhase);

  return (
    <div className="relative font-sans text-on-surface-variant selection:bg-primary-container selection:text-white bg-[#0A0A0A] overflow-x-hidden min-h-screen pb-12">
      
      {/* Dynamic ambient color glows background */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[150px] -z-10 pointer-events-none animate-float"></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[180px] -z-10 pointer-events-none"></div>
      <div className="absolute top-[75%] left-[-12%] w-[500px] h-[500px] bg-tertiary-container/5 rounded-full blur-[160px] -z-10 pointer-events-none animate-float" style={{ animationDelay: '3s' }}></div>

      {/* Real-time Status Floating Bar */}
      <div className="w-full bg-[#0E0E0E]/80 border-b border-white/5 px-4 py-2 text-[11px] font-mono flex flex-wrap justify-between items-center gap-2 relative z-[110]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SYS: ACTIVE / ONLINE
          </span>
          <span className="text-outline-brand hidden sm:inline">|</span>
          <span className="text-outline-brand hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-secondary-container" />
            UTC: {currentTime || 'Loading...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-outline-brand flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary-brand" />
            Active Engineers: <strong className="text-white">4</strong>
          </span>
          <span className="text-outline-brand">•</span>
          <span className="text-outline-brand">
            Simulated Node Load: <strong className="text-emerald-400">12ms latency</strong>
          </span>
        </div>
      </div>

      {/* Top Floating Glass Navigation Bar */}
      <nav 
        className={`fixed top-12 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl rounded-full border transition-all duration-500 z-[100] ${
          scrollY > 30 
            ? 'bg-surface-brand/65 border-white/10 backdrop-blur-3xl shadow-xl py-3 px-6' 
            : 'bg-transparent border-white/5 py-4 px-8'
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo brand */}
          <a href="#" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105">
              <img 
                alt="Nexloop Logo" 
                className="w-full h-full object-contain" 
                src={IMAGES.logo} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#0066ff]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-display font-extrabold text-white text-lg tracking-tight group-hover:text-primary-brand transition-colors">
              Nexloop
            </span>
          </a>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#services" className="text-xs font-bold uppercase tracking-widest text-outline-brand hover:text-white transition-colors">
              Services
            </a>
            <a href="#methodology" className="text-xs font-bold uppercase tracking-widest text-outline-brand hover:text-white transition-colors">
              Methodology
            </a>
            <a href="#contact" className="text-xs font-bold uppercase tracking-widest text-outline-brand hover:text-white transition-colors">
              Estimate Loop
            </a>
            <a href="#about" className="text-xs font-bold uppercase tracking-widest text-outline-brand hover:text-white transition-colors">
              About
            </a>
          </div>

          {/* Contact Action */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="https://wa.me/971528131539"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              +971 52 813 1539
            </a>
            <a 
              href="#contact" 
              className="px-6 py-2.5 bg-primary-container text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-[1.05] active:scale-95 transition-all shadow-md shadow-primary-container/10 inline-block text-center cursor-pointer"
            >
              Let's Talk
            </a>
          </div>

          {/* Mobile Menu Action */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-[#e5e2e1] hover:text-white focus:outline-none p-1.5 bg-white/5 border border-white/5 rounded-full cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 pt-4 pb-2 border-t border-white/5 flex flex-col gap-4 text-center"
            >
              <a 
                href="#services" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 text-on-surface-variant hover:text-white"
              >
                Services
              </a>
              <a 
                href="#methodology" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 text-on-surface-variant hover:text-white"
              >
                Methodology
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 text-on-surface-variant hover:text-white"
              >
                Estimate Loop
              </a>
              <a 
                href="https://wa.me/971528131539"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                +971 52 813 1539
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-primary-container py-3 rounded-full text-white font-bold text-xs uppercase"
              >
                Let's Talk
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24" id="home">
        <div className="absolute inset-0 z-0">
          <div className="mesh-bg"></div>
          {/* Parallax Background Visual */}
          <div 
            className="w-full h-full object-cover opacity-30 mix-blend-screen scale-110 blur-sm md:blur-none"
            style={{
              transform: `translateY(${scrollY * 0.25}px)`,
              backgroundImage: `url(${IMAGES.heroBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Glowing AI cyber matrix simulation layout */}
          <AiMatrixBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/60 to-[#0A0A0A]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center pt-8">
          
          {/* Engineering badge */}
          <div className="mx-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary-brand/20 bg-primary-container/10 backdrop-blur-md mb-8 animate-float">
            <span className="material-symbols-outlined text-[#b3c5ff] text-base font-semibold leading-none">
              verified
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-primary-brand uppercase tracking-widest">
              Engineering the Future
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-[68px] font-black leading-tight tracking-tight mb-8 max-w-5xl mx-auto text-white">
            We Don't Just <span className="text-[#b9f1ff]">Build Businesses.</span> <br className="hidden md:inline" />
            We Build Systems That <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-brand via-secondary-brand to-primary-container">Grow Businesses.</span>
          </h1>

          {/* Core Subtitle Paragraph */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
            A high-performance digital agency crafting premium experiences that redefine the intersection of enterprise technology, logistics, and art.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <a 
              href="#services" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-lg shadow-primary-container/20 hover:scale-[1.03] text-center cursor-pointer"
            >
              Explore Our Vision
            </a>
            <a 
              href="#methodology" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all backdrop-blur-sm text-center cursor-pointer"
            >
              View Methodology
            </a>
          </div>

          {/* Interactive Floating Statistics Slider */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto py-8 px-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
            <div>
              <div className="text-2xl md:text-3xl font-black font-display text-white">99.9%</div>
              <div className="text-[10px] text-outline-brand uppercase tracking-widest mt-1">Uptime SLA Check</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black font-display text-white">100ms</div>
              <div className="text-[10px] text-outline-brand uppercase tracking-widest mt-1">TTL Median Latency</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black font-display text-white">$45M+</div>
              <div className="text-[10px] text-outline-brand uppercase tracking-widest mt-1">Client Sales Generated</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black font-display text-secondary-brand">Active</div>
              <div className="text-[10px] text-outline-brand uppercase tracking-widest mt-1">Continuous Sprints</div>
            </div>
          </div>
        </div>
      </header>

      {/* Strategic Pillars Section (Bento Grid) */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="services">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-3 text-[10px] text-primary-brand font-bold uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" /> Capabilities Base
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Strategic Pillars
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Our core expertise mapped across the high-end digital landscape to secure your brand's vertical growth.
          </p>

          {/* Interactive Tag Filter Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-2xl mx-auto">
            {['All', 'Growth', 'Tech & Dev', 'Corporate & Global'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedTagFilter === tag
                    ? 'bg-[#0066ff] text-white shadow-md shadow-primary-container/20'
                    : 'bg-white/5 border border-white/5 text-on-surface-variant hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid Layout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {filteredPillars.map((pillar) => {
            const isLarge = pillar.span === 'md:col-span-8';
            return (
              <SpotlightCard 
                key={pillar.id}
                className={`${pillar.span} flex flex-col ${isLarge ? 'md:flex-row' : ''} ${pillar.id === 'uae-corporate' ? 'md:flex-row-reverse' : ''} justify-between gap-8 cursor-pointer relative min-h-[380px] p-8`}
                id={`pillar-${pillar.id}`}
              >
                <div className="flex-1 relative z-10 text-left flex flex-col justify-between py-1 h-full">
                  <div>
                    {/* Diagnostic Icon Bubble */}
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:border-primary-brand/30 transition-all duration-300 relative shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary-brand/5 to-transparent rounded-2xl"></div>
                      {getPillarIcon(pillar.iconType)}
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-primary-brand transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Features checklist (if present) */}
                    {pillar.features && pillar.features.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-white text-xs mb-6 max-w-md">
                        {pillar.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> 
                            {feat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={() => setActivePillar(pillar)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-brand font-bold group-hover:translate-x-1.5 transition-transform cursor-pointer"
                    >
                      {pillar.iconType === 'ecommerce' || pillar.iconType === 'shopify' ? 'Configure ROI Estimates' : 
                       pillar.iconType === 'marketing' || pillar.iconType === 'ads' ? 'Run Campaign Simulator' :
                       pillar.iconType === 'corporate' ? 'Estimate Licensing Fees' : 'Configure Tech Stacks'} 
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>

                    {/* Tags list (if present) */}
                    {pillar.tags && pillar.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                        {pillar.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="px-2.5 py-1.5 bg-white/5 text-[9px] text-[#b3c5ff] uppercase font-bold tracking-widest border border-white/10 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Backdrop Illustration */}
                {pillar.imageUrl && (
                  <div className={`relative ${isLarge ? 'w-full md:w-[45%]' : 'w-full'} aspect-square md:aspect-auto rounded-3xl overflow-hidden border border-white/5 z-10 flex-shrink-0 bg-[#0E0E0E]`}>
                    <img 
                      alt={pillar.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                      src={pillar.imageUrl} 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                )}
              </SpotlightCard>
            );
          })}

        </div>
      </section>

      {/* Interactive Nexloop Methodology Section */}
      <section className="py-24 relative bg-surface-brand/20" id="methodology">
        <div className="absolute inset-0 bg-primary-container/5 -skew-y-1 z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left Content Area: Interactive Walkers */}
            <div className="w-full lg:w-1/2 text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-full mb-4 text-[10px] text-violet-400 font-bold uppercase tracking-widest font-mono">
                Discover &rarr; Build &rarr; Launch &rarr; Automate &rarr; Scale
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Our Strategic <br /><span className="text-[#b9f1ff]">Methodology</span>
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant mb-12 leading-relaxed">
                At Nexloop, we don't just deliver services. We help businesses identify opportunities, build strong foundations, launch effectively, automate operations, and scale sustainably.
              </p>

              {/* clickable phases list */}
              <div className="space-y-6">
                {METHODOLOGY_STEPS.map((step) => {
                  const isSelected = selectedMethodologyPhase === step.phase;
                  return (
                    <div 
                      key={step.phase}
                      onClick={() => setSelectedMethodologyPhase(step.phase)}
                      className={`flex gap-6 p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-white/5 border-primary-brand/35 shadow-lg shadow-black/80' 
                          : 'border-transparent hover:bg-white/3'
                      }`}
                    >
                      {/* Phase Rounded Indicator */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center font-display font-black text-sm tracking-tighter transition-all ${
                        isSelected 
                          ? 'bg-[#b3c5ff] border-[#b3c5ff] text-on-primary-brand' 
                          : 'border-white/20 text-primary-brand group-hover:bg-white/10'
                      }`}>
                        {step.phase}
                      </div>

                      <div>
                        <h4 className="font-display text-lg font-bold text-white mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant max-w-md">
                          {step.description}
                        </p>

                        {/* Expandable phase deliverable bullet points */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {step.details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                                    <div className="w-1 h-1 rounded-full bg-[#00e0ff]"></div>
                                    <span>{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Media Section: Graphic Retainer showcase */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative aspect-square w-full max-w-md glass-card rounded-[40px] md:rounded-[60px] p-4 group shadow-2xl">
                <div className="spotlight-glow"></div>
                <img 
                  alt="Nexloop AI Lab representation" 
                  className="w-full h-full object-cover rounded-[32px] md:rounded-[50px] opacity-90 transition-all duration-700 group-hover:scale-105" 
                  src={IMAGES.labMethodology} 
                  referrerPolicy="no-referrer"
                />
                
                {/* Float Card representing client satisfaction retention checking */}
                <div className="absolute -bottom-6 -right-6 bg-primary-container p-6 md:p-8 rounded-[32px] shadow-2xl animate-float z-20 border border-white/10">
                  <p className="font-display text-3xl font-black text-white leading-none">98%</p>
                  <p className="font-sans text-[10px] text-white/80 uppercase tracking-widest font-bold mt-1">Client Retention</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section: Ready to Dominate */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto" id="contact">
        <ContactForm selectedService={selectedService} setSelectedService={setSelectedService} />
      </section>

      {/* Footer Info blocks */}
      <footer className="w-full border-t border-white/5 bg-[#0A0A0A] py-16 px-6 md:px-12 max-w-7xl mx-auto" id="about">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <img 
                alt="Nexloop Logo" 
                className="h-9 w-9 object-contain" 
                src={IMAGES.logo} 
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-extrabold text-white text-xl tracking-tight">
                Nexloop
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-outline-brand max-w-sm leading-relaxed mb-4">
              Engineering high-performance premium digital ecosystems and cloud integrations for visionary global brands.
            </p>
            <div className="text-[11px] font-mono text-outline-brand flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4.5 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e0ff] animate-pulse"></span>
              Workspace Registry Node: UAE / LONDON / SEOUL
            </div>
          </div>

          <div className="md:col-span-3 text-left">
            <h5 className="font-sans text-xs font-bold text-white uppercase tracking-widest mb-4">
              Connect
            </h5>
            <div className="flex flex-col gap-3 text-xs text-outline-brand">
              <a 
                href="https://wa.me/971528131539" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-emerald-400 font-mono transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                WhatsApp: +971 52 813 1539
              </a>
              <a 
                href="mailto:business@nexlooplive.com" 
                className="hover:text-violet-400 font-mono transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                Email: business@nexlooplive.com
              </a>
              
              <div className="pt-3 border-t border-white/5 text-[11px] font-sans leading-relaxed text-outline-brand space-y-1">
                <span className="text-white block font-semibold uppercase tracking-wider text-[9px]">UAE Office</span>
                <p>
                  Business Center Sharjah, SPC Freezone,<br />
                  Sharjah, UAE
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-2 mt-1">
                <a href="#" className="hover:text-[#b3c5ff] transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-[#b3c5ff] transition-colors">Instagram</a>
                <a href="#" className="hover:text-[#b3c5ff] transition-colors">Twitter (X)</a>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 text-left">
            <h5 className="font-sans text-xs font-bold text-white uppercase tracking-widest mb-4">
              Legal
            </h5>
            <div className="flex flex-col gap-2 text-xs text-outline-brand">
              <a href="#" className="hover:text-[#b3c5ff] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#b3c5ff] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#b3c5ff] transition-colors">System Security Audit</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Bottom copyright line banner footer */}
      <div className="w-full py-6 text-center border-t border-white/5 bg-[#080808]">
        <p className="font-sans text-[11px] text-outline-brand">
          © {new Date().getFullYear()} Nexloop Digital. Engineering the future. Done with professional standards.
        </p>
      </div>

      {/* Render Dynamic Capabilities Modals */}
      <ServiceModal 
        pillar={activePillar}
        onClose={() => setActivePillar(null)}
        setSelectedService={setSelectedService}
      />

      {/* Floating AI Agent Consultation Chatbot */}
      <AiChatbot />

    </div>
  );
}

// Protected Route Gating Helper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('nexloop_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

// Centralized Router Config
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<PublicWebsite />} />

        {/* Admin Login Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Panel Workspace */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="conversations" element={<AdminConversations />} />
          <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

