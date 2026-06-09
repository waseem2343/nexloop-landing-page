/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { StrategicPillar } from '../types';
import { X, ArrowRight, Gauge, HelpCircle, Landmark, ShoppingBag, ShieldCheck, Cpu } from 'lucide-react';

interface ServiceModalProps {
  pillar: StrategicPillar | null;
  onClose: () => void;
}

export default function ServiceModal({ pillar, onClose }: ServiceModalProps) {
  if (!pillar) return null;

  // Currency option (USD / AED)
  const [currency, setCurrency] = useState<'USD' | 'AED'>('USD');

  // Sandbox state trackers
  // ecommerce:
  const [currentSales, setCurrentSales] = useState(25000);
  const [advertisingRoas, setAdvertisingRoas] = useState(2.8);

  // marketing:
  const [adSpend, setAdSpend] = useState(5000);
  const [targetCpa, setTargetCpa] = useState(35);
  const [channel, setChannel] = useState<'Google search' | 'Meta social' | 'TikTok video'>('Google search');

  // webdev:
  const [frontend, setFrontend] = useState<'NextJS' | 'Vite React' | 'VanillaJS'>('NextJS');
  const [cms, setCms] = useState<'Headless Contentful' | 'Sanity' | 'WordPress API'>('Headless Contentful');
  const [animated, setAnimated] = useState(true);

  // corporate:
  const [jurisdiction, setJurisdiction] = useState<'IFZA Freezone' | 'Meydan Freezone' | 'Dubai Mainland'>('IFZA Freezone');
  const [visasRequired, setVisasRequired] = useState(2);
  const [activity, setActivity] = useState<'E-Commerce' | 'Commercial' | 'Service/Consultancy'>('E-Commerce');

  // ai:
  const [employees, setEmployees] = useState(15);
  const [manualHours, setManualHours] = useState(8);
  const [aiSystemType, setAiSystemType] = useState<'agent' | 'rag' | 'workflow'>('agent');
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  useEffect(() => {
    if (pillar && pillar.id === 'ai-automation') {
      const systemName = aiSystemType === 'agent' 
        ? 'Cognitive Agent Portal' 
        : aiSystemType === 'rag' 
          ? 'Knowledge Vector Embedding Layer' 
          : 'Event Workflow Matrix';
      
      const initialLogs = [
        `[STATUS] Booting matrix core...`,
        `[STATUS] Target pipeline: ${systemName}`,
        `[STATUS] Processing metrics: ${employees} users, ${manualHours} hours/wk`,
      ];
      setAiLogs(initialLogs);

      const sequentialLogs = [
        `[COMPUTING] Mapping enterprise automation latency vectors...`,
        `[PROCESSING] Estimating workload decompression: ~${(manualHours * 0.6).toFixed(1)} hrs saved per user.`,
        `[OK] Optimizing neural context boundaries for safe deployment...`,
        `[READY] Operational audit synchronized. Annual return vectors calculated.`
      ];

      const timers: number[] = [];
      sequentialLogs.forEach((log, index) => {
        const timer = window.setTimeout(() => {
          setAiLogs((prev) => [...prev, log]);
        }, (index + 1) * 750);
        timers.push(timer);
      });

      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [employees, manualHours, aiSystemType, pillar]);

  // Interactive Calculators
  const calculateEcommerceGrowth = () => {
    // Listing optimization usually increases conversion by 25-40%
    const optimizedSales = Math.floor(currentSales * 1.35);
    const addedProfit = Math.floor((optimizedSales - currentSales) * 0.18); // assuming 18% net margin increase
    const targetAdEfficiency = Math.floor(currentSales * (advertisingRoas / 100) * 8.5);
    return {
      optimizedSales,
      addedProfit,
      efficiencyPercent: Math.floor(advertisingRoas * 24),
    };
  };

  const calculateMarketingSim = () => {
    let convRate = 0.024; // 2.4% avg
    if (channel === 'Meta social') convRate = 0.021;
    if (channel === 'TikTok video') convRate = 0.018;

    const estimatedClicks = Math.floor(adSpend / (targetCpa * 0.45));
    const simulatedOrders = Math.floor(estimatedClicks * convRate * 3.5);
    const revenueGen = Math.floor(simulatedOrders * 85); // Assuming $85 AOV
    const returnedRoas = revenueGen > 0 ? (revenueGen / adSpend).toFixed(1) : '0';

    return {
      estimatedClicks,
      simulatedOrders,
      revenueGen,
      returnedRoas,
    };
  };

  const calculateWebPerformance = () => {
    let speed = 0.4; // seconds
    let seo = 99;
    let performance = 98;

    if (frontend === 'NextJS') {
      speed = 0.6;
      performance = 96;
    } else if (frontend === 'VanillaJS') {
      speed = 0.3;
      performance = 99;
    }

    if (cms === 'Sanity') {
      speed += 0.1;
      performance -= 1;
    } else if (cms === 'WordPress API') {
      speed += 0.5;
      performance -= 10;
      seo -= 4;
    }

    if (animated) {
      speed += 0.2;
      performance -= 2;
    }

    return {
      loadingTime: speed.toFixed(1),
      seoScore: seo,
      perfScore: performance,
    };
  };

  const calculateCorporateFees = () => {
    let licenseCost = 12500;
    if (jurisdiction === 'Meydan Freezone') licenseCost = 14200;
    if (jurisdiction === 'Dubai Mainland') licenseCost = 19500;

    let visaCostPerVisa = 4800;
    if (jurisdiction === 'Dubai Mainland') visaCostPerVisa = 5500;

    const totalVisasCost = visasRequired * visaCostPerVisa;
    const adminProcessing = 3500;
    const estTotalAED = licenseCost + totalVisasCost + adminProcessing;
    const estTotalUSD = Math.floor(estTotalAED / 3.67);

    return {
      licenseCost,
      totalVisasCost,
      estTotalAED,
      estTotalUSD,
    };
  };

  const calculateAiEfficiency = () => {
    let efficiencyMultiplier = 0.82;
    if (aiSystemType === 'agent') {
      efficiencyMultiplier = 0.88;
    } else if (aiSystemType === 'rag') {
      efficiencyMultiplier = 0.75;
    } else {
      efficiencyMultiplier = 0.80;
    }
    
    const weeklyHoursSaved = Math.floor(employees * manualHours * efficiencyMultiplier);
    const hourlyValueUSD = 45;
    const annualSavingsUSD = Math.floor(weeklyHoursSaved * 52 * hourlyValueUSD);
    const implementationTimelineWeeks = aiSystemType === 'agent' ? 6 : aiSystemType === 'rag' ? 4 : 3;

    return {
      weeklyHoursSaved,
      annualSavingsUSD,
      implementationTimelineWeeks,
      hoursSavedPercent: Math.floor(efficiencyMultiplier * 100)
    };
  };

  const renderSandbox = () => {
    // Resolve new support formats to core interactive calculator models
    let resolvedType: 'ecommerce' | 'marketing' | 'webdev' | 'corporate' | 'ai' = 'webdev';
    if (pillar.iconType === 'ecommerce' || pillar.iconType === 'shopify') {
      resolvedType = 'ecommerce';
    } else if (pillar.iconType === 'marketing' || pillar.iconType === 'ads' || pillar.iconType === 'graphic') {
      resolvedType = 'marketing';
    } else if (pillar.iconType === 'corporate') {
      resolvedType = 'corporate';
    } else if (pillar.iconType === 'ai') {
      resolvedType = 'ai';
    } else {
      resolvedType = 'webdev';
    }

    switch (resolvedType) {
      case 'ecommerce': {
        const growth = calculateEcommerceGrowth();
        return (
          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="text-label-md text-secondary-brand uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-secondary-container" />
                Live Middle-East Growth Sandbox &amp; Estimator
              </h4>
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('AED')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'AED' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  AED
                </button>
              </div>
            </div>
            
            <p className="text-xs text-on-surface-variant font-sans mb-5">
              Simulate the direct impact of list optimization, FBA / active warehousing coordination, and regional advertising on Amazon AE/SA &amp; Noon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-5 rounded-2xl border border-white/5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Current Monthly Sales</span>
                    <span className="text-white font-mono font-bold">
                      {currency === 'AED'
                        ? `AED ${Math.round(currentSales * 3.67).toLocaleString()}`
                        : `$${currentSales.toLocaleString()} USD`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="200000"
                    step="5000"
                    value={currentSales}
                    onChange={(e) => setCurrentSales(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Current Blended PPC ROAS</span>
                    <span className="text-white font-mono font-bold">{advertisingRoas}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.1"
                    value={advertisingRoas}
                    onChange={(e) => setAdvertisingRoas(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider block">Estimated Optimized Monthly Volume</span>
                  <div className="text-2xl font-bold font-display text-primary-brand mt-0.5">
                    {currency === 'AED'
                      ? `AED ${Math.round(growth.optimizedSales * 3.67).toLocaleString()}`
                      : `$${growth.optimizedSales.toLocaleString()} USD`}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1 font-sans">Representing a <span className="text-[#a5eeff] font-bold">+35% average list conversion lift</span>.</p>
                </div>
                
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Est. Monthly Profit Delta</span>
                    <span className="text-sm font-semibold font-mono text-emerald-400">
                      {currency === 'AED'
                        ? `+AED ${Math.round(growth.addedProfit * 3.67).toLocaleString()} / mo`
                        : `+$${growth.addedProfit.toLocaleString()} / mo`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Efficiency Score</span>
                    <span className="text-xs font-semibold text-secondary-brand">{growth.efficiencyPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'marketing': {
        const sim = calculateMarketingSim();
        return (
          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="text-label-md text-secondary-brand uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-secondary-container" />
                Campaign Architecture Simulator
              </h4>
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('AED')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'AED' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  AED
                </button>
              </div>
            </div>
            
            <p className="text-xs text-on-surface-variant font-sans mb-5">
              Toggle specific distribution channels, budgets, and target CPAs to preview estimated acquisition performance metrics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-5 rounded-2xl border border-white/5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-2">Campaign Channel</label>
                  <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
                    {(['Google search', 'Meta social', 'TikTok video'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        className={`text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          channel === ch
                            ? 'bg-primary-container text-white'
                            : 'text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {ch.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Monthly Media Budget</span>
                    <span className="text-white font-mono font-bold">
                      {currency === 'AED'
                        ? `AED ${Math.round(adSpend * 3.67).toLocaleString()}`
                        : `$${adSpend.toLocaleString()} USD`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Target Acquisition Cost (CPA)</span>
                    <span className="text-white font-mono font-bold">
                      {currency === 'AED'
                        ? `AED ${Math.round(targetCpa * 3.67).toLocaleString()}`
                        : `$${targetCpa} USD`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="150"
                    step="5"
                    value={targetCpa}
                    onChange={(e) => setTargetCpa(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Estimated Clicks</span>
                    <span className="text-xl font-bold font-display text-white mt-0.5">{sim.estimatedClicks.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Simulated Orders</span>
                    <span className="text-xl font-bold font-display text-white mt-0.5">{sim.simulatedOrders}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/5 flex justify-between items-end mt-2">
                  <div>
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Simulated Gross Return</span>
                    <span className="text-2xl font-bold font-display text-emerald-400">
                      {currency === 'AED'
                        ? `AED ${Math.round(sim.revenueGen * 3.67).toLocaleString()}`
                        : `$${sim.revenueGen.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">ROI Multiplier</span>
                    <span className="text-lg font-bold font-display text-primary-brand">{sim.returnedRoas}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'webdev': {
        const perf = calculateWebPerformance();
        return (
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-label-md text-secondary-brand uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-secondary-container" />
              Dynamic Performance Architect Configurator
            </h4>
            <p className="text-xs text-on-surface-variant font-sans mb-5">
              Orchestrate your bespoke frontend architecture and headless backend pipeline to preview target metrics and browser performance benchmarks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-5 rounded-2xl border border-white/5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-2">Frontend Framework</label>
                  <select
                    value={frontend}
                    onChange={(e) => setFrontend(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-primary-container outline-none text-white appearance-none"
                  >
                    <option value="NextJS">Next.js 15 (App Router Server Components)</option>
                    <option value="Vite React">React 19 Single Page Client-Side SPA</option>
                    <option value="VanillaJS">Ultra-low weight vanilla JS engine</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-2">Headless Data CMS layer</label>
                  <select
                    value={cms}
                    onChange={(e) => setCms(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-primary-container outline-none text-white"
                  >
                    <option value="Headless Contentful">Headless Contentful (CDN Delivered)</option>
                    <option value="Sanity">Sanity.io Realtime GraphQL JSON</option>
                    <option value="WordPress API">Legacy Traditional headless WP Graph API</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-on-surface-variant">Include motion layout & physics animation effects</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={animated}
                      onChange={(e) => setAnimated(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/40 p-2 rounded-xl">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Load Speed</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 mt-1">{perf.loadingTime}s</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-xl">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">SEO Score</span>
                    <span className="text-lg font-bold font-mono text-cyan-300 mt-1">{perf.seoScore}</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-xl">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Core Vitals</span>
                    <span className="text-lg font-bold font-mono text-primary-brand mt-1">{perf.perfScore}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs text-on-surface-variant">
                  <span className="text-[10px] text-outline-brand uppercase tracking-wider font-bold block mb-1">Architecture Recommendation</span>
                  We recommend a statically-generated <span className="text-white font-semibold">Edge API infrastructure</span> pairing edge middleware redirects to guarantee <span className="text-emerald-400 font-semibold">&lt;100ms TTL latency</span> globally.
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'corporate': {
        const fees = calculateCorporateFees();
        return (
          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="text-label-md text-[#b9f1ff] uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-secondary-container" />
                UAE Commercial Setup Planner
              </h4>
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('AED')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'AED' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  AED
                </button>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant font-sans mb-5">
              Draft your company registration structure. Choose specific jurisdictions, estimated visa cards, and main activities to compute government and support fees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-5 rounded-2xl border border-white/5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-1.5">Freezone / Mainland Jurisdiction</label>
                  <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
                    {(['IFZA Freezone', 'Meydan Freezone', 'Dubai Mainland'] as const).map((jur) => (
                      <button
                        key={jur}
                        onClick={() => setJurisdiction(jur)}
                        className={`text-[9px] py-2 rounded-lg font-bold transition-all cursor-pointer ${
                          jurisdiction === jur
                            ? 'bg-primary-container text-white'
                            : 'text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {jur.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-1">Primary Activity</label>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value as any)}
                      className="w-full bg-black/55 border border-white/10 rounded-xl px-2 py-2 text-[11px] outline-none text-white cursor-pointer"
                    >
                      <option value="E-Commerce">E-Commerce Setup</option>
                      <option value="Commercial">Commercial / Trading</option>
                      <option value="Service/Consultancy">Service / Consultant</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant mb-1">
                      <span>Visa Allocation</span>
                      <span className="text-white font-mono font-bold">{visasRequired} Visas</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={visasRequired}
                      onChange={(e) => setVisasRequired(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                    />
                  </div>
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant py-1">
                    <span>Trade License Fee</span>
                    <span>
                      {currency === 'USD'
                        ? `$${Math.round(fees.licenseCost / 3.67).toLocaleString()} USD`
                        : `AED ${fees.licenseCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant py-1 border-t border-white/5">
                    <span>Resident Visas ({visasRequired})</span>
                    <span>
                      {currency === 'USD'
                        ? `$${Math.round(fees.totalVisasCost / 3.67).toLocaleString()} USD`
                        : `AED ${fees.totalVisasCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant py-1 border-t border-white/5">
                    <span>Gov &amp; PRO processing</span>
                    <span>
                      {currency === 'USD' ? `$953 USD` : `AED 3,500`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">Estimated Setup Cost</span>
                    <span className="text-xl font-bold font-display text-white mt-0.5">
                      {currency === 'USD'
                        ? `$${fees.estTotalUSD.toLocaleString()} USD`
                        : `AED ${fees.estTotalAED.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-outline-brand uppercase tracking-wider block">
                      {currency === 'USD' ? 'Base AED value' : 'Base USD value'}
                    </span>
                    <span className="text-sm font-semibold font-mono text-emerald-400">
                      {currency === 'USD'
                        ? `~AED ${fees.estTotalAED.toLocaleString()}`
                        : `~$${fees.estTotalUSD.toLocaleString()} USD`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'ai': {
        const aiSim = calculateAiEfficiency();
        return (
          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="text-label-md text-secondary-brand uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
                Intelligent Workflow &amp; AI Automation Estimator
              </h4>
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('AED')}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === 'AED' ? 'bg-primary-container text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  AED
                </button>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant font-sans mb-5">
              Input your team size and weekly hours spent on manual operations to simulate the efficiency and economic benefits of custom AI automation workflows and cognitive knowledge bases.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/60 p-5 rounded-2xl border border-white/5 font-sans">
              {/* Controls */}
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[11px] text-outline-brand uppercase tracking-widest block mb-2">Automation Focus System</label>
                  <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
                    {(['agent', 'rag', 'workflow'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setAiSystemType(t)}
                        className={`text-[10px] py-1.5 rounded-lg font-bold transition-all capitalize cursor-pointer ${
                          aiSystemType === t
                            ? 'bg-violet-600 text-white'
                            : 'text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {t === 'agent' ? 'AI Agents' : t === 'rag' ? 'Cognitive KB' : 'Auto Workflows'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Team Members Affected</span>
                    <span className="text-white font-mono font-bold">{employees} employees</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={employees}
                    onChange={(e) => setEmployees(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Manual Hours/Week (Per Member)</span>
                    <span className="text-white font-mono font-bold">{manualHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    step="1"
                    value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Weekly Time Saved</span>
                    <span className="text-xl font-bold font-display text-white mt-0.5">{aiSim.weeklyHoursSaved} Hours</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-sans">Efficiency Savings</span>
                    <span className="text-xl font-bold font-display text-violet-400">~{aiSim.hoursSavedPercent}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Annualized Return (Est)</span>
                    <span className="text-2xl font-bold font-display text-emerald-400 font-mono">
                      {currency === 'AED'
                        ? `AED ${Math.round(aiSim.annualSavingsUSD * 3.67).toLocaleString()}`
                        : `$${aiSim.annualSavingsUSD.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-sans">Deploy Timeline</span>
                    <span className="text-xs font-semibold font-mono text-zinc-300">~{aiSim.implementationTimelineWeeks} Weeks</span>
                  </div>
                </div>

                {/* Simulated Neural Terminal Output */}
                <div className="pt-3 border-t border-white/5 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Cognitive Audit Execution Stream</span>
                    <div className="flex items-center gap-1.5 bg-violet-950/20 px-2 py-0.5 rounded-full border border-violet-500/20">
                      <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping"></span>
                      <span className="text-[7.5px] text-violet-300 font-bold uppercase tracking-wider font-mono">Neural Engine</span>
                    </div>
                  </div>
                  <div className="h-28 bg-[#070708]/90 border border-violet-500/10 rounded-xl p-3 font-mono text-[9px] leading-relaxed text-[#b9f1ff]/80 overflow-y-auto space-y-1 select-none">
                    {aiLogs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-violet-500">$</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#111111] rounded-[32px] md:rounded-[48px] border border-white/10 overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Glow ambient circle */}
        <div className="absolute top-0 left-12 w-96 h-96 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="p-6 md:p-10 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] text-outline-brand uppercase font-bold tracking-widest rounded-full">
                Service Capabilities
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Ready to deploy
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                {pillar.title}
              </h3>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                {pillar.description}
              </p>

              {pillar.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {pillar.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-xs text-primary-brand font-bold tracking-wider rounded-full uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {pillar.features && (
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {pillar.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/20 relative aspect-video md:aspect-auto flex items-center justify-center">
              {pillar.imageUrl ? (
                <img
                  src={pillar.imageUrl}
                  alt={pillar.title}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : (
                <div className="p-8 text-center bg-gradient-to-br from-primary-container/20 to-secondary-container/10 w-full h-full flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <Cpu className="w-8 h-8 text-primary-brand animate-float" />
                  </div>
                  <h4 className="font-display text-sm font-semibold text-white">Full Automated Pipeline integration</h4>
                  <p className="text-[11px] text-on-surface-variant max-w-xs mt-1">Leveraging state-of-the-art enterprise technology for premium scalability.</p>
                </div>
              )}
            </div>
          </div>

          {/* Render disciplinary analyzer tool Sandbox */}
          {renderSandbox()}

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[11px] text-outline-brand font-sans text-center sm:text-left">
              Want custom consulting for {pillar.title}? Select this option during checkout format or click below.
            </span>
            <button
              onClick={() => {
                onClose();
                const contactEl = document.getElementById('contact');
                if (contactEl) {
                  contactEl.scrollIntoView({ behavior: 'smooth' });
                  // Find select action
                  const selectEl = document.querySelector('select');
                  if (selectEl) {
                    if (pillar.iconType === 'webdev') selectEl.value = 'Web Design & Development';
                    if (pillar.iconType === 'marketing') selectEl.value = 'Digital Marketing';
                    if (pillar.iconType === 'ecommerce') selectEl.value = 'Amazon & Noon Support';
                    if (pillar.iconType === 'corporate') selectEl.value = 'UAE Corporate Services';
                  }
                }
              }}
              className="px-6 py-3 bg-primary-container hover:bg-opacity-95 text-white font-label-md text-xs font-bold rounded-full flex items-center gap-2 shadow-lg shadow-primary-container/20 transition-all cursor-pointer"
            >
              Initiate Project with this Pillar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
