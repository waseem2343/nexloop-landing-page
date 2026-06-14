/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { Sparkles, Terminal, Copy, Shield, FileCheck, RefreshCw, Send, CheckCircle2, Loader2, Mail, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  selectedService?: string;
  setSelectedService?: (val: string) => void;
}

export default function ContactForm({ selectedService, setSelectedService }: ContactFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localService, setLocalService] = useState('Web Design & Development');
  const service = selectedService !== undefined ? selectedService : localService;
  const setService = setSelectedService !== undefined ? setSelectedService : setLocalService;
  const [message, setMessage] = useState('');
  const [autoDispatchedId, setAutoDispatchedId] = useState<string | null>(null);

  // Timeline / Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Proposal State
  const [proposalCurrency, setProposalCurrency] = useState<'USD' | 'AED'>('USD');
  const [proposalData, setProposalData] = useState<{
    id: string;
    timeline: string;
    estCostUsd: string;
    estCostAed: string;
    architectureType: string;
    phases: string[];
  } | null>(null);

  // Background Web Submission State
  const [apiStatus, setApiStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<{
    success: boolean;
    loggedLocally?: boolean;
    emailSent?: boolean;
    warning?: string;
    proposalId?: string;
  } | null>(null);

  const steps = [
    { label: 'Analyzing Digital DNA...', desc: 'Verifying user inputs and mapping brand requirements.' },
    { label: 'Orchestrating Strategic Pillars...', desc: 'Matching technical nodes with specialized industry experts.' },
    { label: 'Structuring Loop Specifications...', desc: 'Compiling cost models, performance indexes, and roadmap timelines.' },
    { label: 'Synthesizing Custom Proposal...', desc: 'Baking high-contrast glass architectures.' }
  ];

  const handleClaimBlueprint = () => {
    if (!proposalData) return;
    const subject = encodeURIComponent(`[Nexloop Client Proposal ${proposalData.id}]: ${service}`);
    const body = encodeURIComponent(
      `Hello Nexloop Team,\n\n` +
      `I would like to initiate a Project Loop with you.\n\n` +
      `----------------------------------------\n` +
      `CLIENT DETAILS:\n` +
      `- Name: ${fullName}\n` +
      `- Email: ${email}\n` +
      `- Phone Number: ${countryCode} ${phoneNumber}\n` +
      `- Service of Interest: ${service}\n` +
      `- Message: ${message || 'No additional message.'}\n\n` +
      `PROPOSAL DATA:\n` +
      `- Proposal ID: ${proposalData.id}\n` +
      `- Estimated Delivery: ${proposalData.timeline}\n` +
      `- Cost Allocation (USD): ${proposalData.estCostUsd}\n` +
      `- Cost Allocation (AED): ${proposalData.estCostAed}\n` +
      `- Architecture Stack Core: ${proposalData.architectureType}\n\n` +
      `TAILORED EXECUTION PHASES:\n` +
      proposalData.phases.map((p, idx) => `[Phase ${idx + 1}] ${p}`).join('\n') + `\n` +
      `----------------------------------------\n\n` +
      `Best regards,\n` +
      `${fullName}`
    );
    const mailtoUrl = `mailto:business@nexlooplive.com?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  useEffect(() => {
    if (submissionComplete && proposalData && autoDispatchedId !== proposalData.id) {
      setAutoDispatchedId(proposalData.id);
      setApiStatus('sending');

      // Directly dispatch parameters through the website backend
      const payload = {
        fullName,
        email,
        countryCode,
        phoneNumber,
        service,
        message,
        proposalData
      };

      fetch('/api/send-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error('API server returned error code');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setApiStatus('success');
          setApiResponse(data);
        } else {
          setApiStatus('error');
        }
      })
      .catch((err) => {
        console.error('Error submitting web proposal:', err);
        setApiStatus('error');
      });
    }
  }, [submissionComplete, proposalData, autoDispatchedId, service, fullName, email, countryCode, phoneNumber, message]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber) {
      alert('Please fill out Name, Email, and Phone Number to process the Project Loop.');
      return;
    }

    setIsSubmitting(true);
    setActiveStep(0);
  };

  useEffect(() => {
    if (!isSubmitting) return;

    if (activeStep < steps.length) {
      const timer = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Completed, load the dynamic prop specs
      const proposalId = `NL-${Math.floor(100000 + Math.random() * 900000)}`;
      let timeline = '4-6 Weeks';
      let estCostUsd = '$15,000 - $22,000 USD';
      let estCostAed = 'AED 55,000 - 81,000';
      let architectureType = 'NextJS Headless Core';
      let phases = [
        'Complete Competitive Audit & UX Wireframes',
        'Headless API Architecture & 100 SEO Score deployment',
        'Continuous Sprint optimization and secure regional handover'
      ];

      if (service === 'Digital Marketing') {
        timeline = 'Ongoing / Monthly retainer';
        estCostUsd = '$2,500 - $4,500 / month';
        estCostAed = 'AED 9,200 - 16,500 / month';
        architectureType = 'ROAS-Driven Omni Distribution';
        phases = [
          'Pixel Integration & attribution auditer setup',
          'A/B Creative modeling and landing optimization rollout',
          'Bi-weekly scaling sprints and direct CRM pipeline feedback'
        ];
      } else if (service === 'Amazon & Noon Support') {
        timeline = '8-12 Weeks startup';
        estCostUsd = '$8,500 - $14,000 setup';
        estCostAed = 'AED 31,000 - 51,500 setup';
        architectureType = 'Full Regional FBA & Listing Optimization';
        phases = [
          'Catalog diagnostic and regional trademark auditer mapping',
          'Keyword rich A+ copywriting and professional rendering',
          'PPC bid automated triggers and fulfillment coordination setup'
        ];
      } else if (service === 'UAE Corporate Services') {
        timeline = '12 - 18 Days setup';
        estCostUsd = '$5,000 - $8,700 USD';
        estCostAed = 'AED 18,500 - 32,000 (Gov + PRO)';
        architectureType = 'Fully Licensed Corporate Entity';
        phases = [
          'Name approval and security clearance registration',
          'Articles of Association drafting and office lease assistance',
          'Establishment Card issuance and resident golden visa processing'
        ];
      } else if (service === 'Mobile App Development') {
        timeline = '8-12 Weeks';
        estCostUsd = '$24,000 - $38,000 USD';
        estCostAed = 'AED 88,000 - 139,500';
        architectureType = 'React Native & Fastlane Continuous deployment';
        phases = [
          'Wireframe flow discovery and offline sync architecture setup',
          'Native engine integrations and secure API token pairing',
          'Internal TestFlight beta and direct Apple & Play Store publishing'
        ];
      } else if (service === 'POS Development') {
        timeline = '6-8 Weeks';
        estCostUsd = '$18,000 - $28,000 USD';
        estCostAed = 'AED 66,000 - 103,000';
        architectureType = 'LocalSQLite & cloud syncing POS Terminal';
        phases = [
          'Hardware protocol specification audits and barcode pairing',
          'Offline transaction safety buffer state and sync module deployment',
          'Direct printer/scanner terminal integration and staff stress testing'
        ];
      } else if (service === 'Graphic Designing') {
        timeline = '3-4 Weeks';
        estCostUsd = '$3,500 - $6,500 USD';
        estCostAed = 'AED 13,000 - 24,000';
        architectureType = 'Creative Brand Book & Identity Suite';
        phases = [
          'Brand ethos moodboarding and typographic pairing options',
          'Creative logomark iterations and production vector guidelines',
          'Digital assets package compilation and raw source file dispatch'
        ];
      } else if (service === 'Shopify Development') {
        timeline = '4-6 Weeks';
        estCostUsd = '$9,500 - $16,000 USD';
        estCostAed = 'AED 35,000 - 59,000';
        architectureType = 'Custom Shopify Liquid / Hydrogen core';
        phases = [
          'Theme concept optimization alignment with inventory metrics',
          'Checkout speed optimizations and custom app connector setup',
          'Payment integrations validation, custom pixel testing, and launch'
        ];
      } else if (service === 'Meta, Google, Snapchat & TikTok Ads Management') {
        timeline = 'Monthly Retainer';
        estCostUsd = '$3,000 - $5,500 / month';
        estCostAed = 'AED 11,000 - 20,000 / month';
        architectureType = 'Strategic Multi-Channel ROI Ads Engine';
        phases = [
          'Unified attribution set diagnostics and legacy audit',
          'Creative ad copies rendering and A/B audience sets seeding',
          'Bi-weekly spend optimizing sprints and performance reporting'
        ];
      } else if (service === 'AI Based Automation Systems') {
        timeline = '4-6 Weeks';
        estCostUsd = '$12,000 - $18,500 USD';
        estCostAed = 'AED 44,000 - 68,000';
        architectureType = 'Gemini AI Agent & Custom Workflow Engine';
        phases = [
          'Detailed operational task-logging audit and pipeline discovery',
          'Deploy secure cognitive retrieval indices (RAG) and automated tool triggers',
          'Intelligent failover testing, workflow validation, and client team onboarding'
        ];
      }

      setProposalData({
        id: proposalId,
        timeline,
        estCostUsd,
        estCostAed,
        architectureType,
        phases
      });
      setIsSubmitting(false);
      setSubmissionComplete(true);
    }
  }, [isSubmitting, activeStep]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setMessage('');
    setSubmissionComplete(false);
    setProposalData(null);
    setApiStatus('idle');
    setApiResponse(null);
    setAutoDispatchedId(null);
  };

  return (
    <div className="glass-card rounded-[40px] md:rounded-[48px] p-8 md:p-16 relative overflow-hidden" id="contact-inner">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-[80px] -mr-32 -mt-32"></div>

      {!isSubmitting && !submissionComplete ? (
        <>
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-3 text-[11px] text-primary-brand font-medium tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-secondary-container" /> Connect with us
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Ready to Dominate?
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              The future doesn't wait. Let's build your premium digital legacy together with custom analytics-driven engineering.
            </p>
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold text-outline-brand px-1 uppercase tracking-wider">Full Name</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold text-outline-brand px-1 uppercase tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-sm"
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold text-outline-brand px-1 uppercase tracking-wider">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-[#111111] border border-white/10 rounded-2xl pl-4 pr-9 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-xs cursor-pointer appearance-none min-w-[115px]"
                    >
                      <option value="+971" className="bg-[#111111] text-white">UAE (+971)</option>
                      <option value="+966" className="bg-[#111111] text-white">KSA (+966)</option>
                      <option value="+974" className="bg-[#111111] text-white">Qatar (+974)</option>
                      <option value="+968" className="bg-[#111111] text-white">Oman (+968)</option>
                      <option value="+965" className="bg-[#111111] text-white">Kuwait (+965)</option>
                      <option value="+973" className="bg-[#111111] text-white">Bahrain (+973)</option>
                      <option value="+44" className="bg-[#111111] text-white">UK (+44)</option>
                      <option value="+1" className="bg-[#111111] text-white">US (+1)</option>
                      <option value="+92" className="bg-[#111111] text-white">PK (+92)</option>
                      <option value="+91" className="bg-[#111111] text-white">IN (+91)</option>
                      <option value="+65" className="bg-[#111111] text-white">SG (+65)</option>
                      <option value="+61" className="bg-[#111111] text-white">AU (+61)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 min-w-0 bg-[#070708]/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-sm"
                    placeholder="50 123 4567"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-outline-brand px-1 uppercase tracking-wider">Service Interest</label>
              <div className="relative">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-sm appearance-none cursor-pointer"
                >
                  <option value="Web Design & Development">Web Design &amp; Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="POS Development">POS Development</option>
                  <option value="Shopify Development">Shopify Development</option>
                  <option value="AI Based Automation Systems">AI Based Automation Systems</option>
                  <option value="Graphic Designing">Graphic Designing &amp; Branding</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Meta, Google, Snapchat & TikTok Ads Management">Meta, Google, Snapchat &amp; TikTok Ads Management</option>
                  <option value="Amazon & Noon Support">Amazon &amp; Noon Support</option>
                  <option value="UAE Corporate Services">UAE Corporate Services</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-brand text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-outline-brand px-1 uppercase tracking-wider">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-white text-sm resize-none"
                placeholder="Tell us about your project goals..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-container hover:bg-opacity-95 text-on-primary-container py-5 rounded-2xl font-display font-medium text-lg hover:shadow-2xl hover:shadow-primary-container/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Send className="w-5 h-5" />
              Initiate Project Loop
            </button>

            <div className="flex flex-col gap-3 pt-8 border-t border-white/5 text-xs text-outline-brand font-mono text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <span className="text-zinc-500">Or reach out directly:</span>
                <a 
                  href="https://wa.me/971528131539" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
                >
                  <svg className="w-4 h-4 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.112.551 4.168 1.597 5.98L.057 24l6.163-1.619C7.946 23.407 9.946 24 12.004 24c6.629 0 12.004-5.373 12.004-12S18.633 0 12.004 0zm0 22.016c-1.848 0-3.662-.496-5.242-1.436l-.375-.222-3.64.955.973-3.551-.243-.388c-1.034-1.644-1.58-3.548-1.58-5.373 0-5.484 4.463-9.947 9.948-9.947 5.481 0 9.94 4.461 9.94 9.947 0 5.485-4.46 9.948-9.94 9.948zm5.459-7.447c-.299-.15-1.772-.875-2.046-.975-.274-.1-.474-.15-.673.15-.199.301-.772.975-.947 1.175-.175.2-.35.225-.65.075-1.683-.842-2.793-1.417-3.903-3.321-.295-.503.295-.467.844-1.564.088-.175.044-.329-.022-.479-.066-.15-.573-1.38-.785-1.89-.208-.5-.456-.431-.623-.44h-.534c-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083 0 1.229.894 2.417 1.019 2.584.125.166 1.759 2.686 4.26 3.766.595.257 1.06.41 1.423.525.598.19 1.144.163 1.575.099.48-.072 1.523-.622 1.739-1.222.217-.6.217-1.113.153-1.222-.064-.11-.237-.175-.536-.325z" />
                  </svg>
                  +971 52 813 1539
                </a>
                <span className="text-white/10 hidden sm:inline">|</span>
                <a 
                  href="mailto:business@nexlooplive.com" 
                  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 hover:underline transition-all"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-[2] text-violet-400 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  business@nexlooplive.com
                </a>
              </div>
              <div className="text-zinc-500 text-[11px] mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>UAE Office: Business Center Sharjah, SPC Freezone, Sharjah, UAE</span>
              </div>
            </div>
          </form>
        </>
      ) : isSubmitting ? (
        /* High-Craft Interactive System Loading Timeline */
        <div className="py-12 flex flex-col items-center justify-center relative z-10 text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/11 rounded-2xl flex items-center justify-center mb-8 relative">
            <RefreshCw className="w-8 h-8 text-secondary-container animate-spin" />
            <div className="absolute -inset-1 bg-[#0066ff]/20 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>

          <h3 className="font-display text-2xl font-bold tracking-tight mb-2 text-white">
            Synthesizing Your Custom Loop...
          </h3>
          <p className="text-on-surface-variant max-w-md text-xs mb-10">
            Please wait while the Nexloop Algorithm processes your parameters against our real-time regional execution frameworks.
          </p>

          <div className="max-w-xl w-full text-left space-y-4">
            {steps.map((step, index) => {
              const isPast = activeStep > index;
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  className={`flex gap-4 p-3.5 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-container/10 border-primary-container/30 translate-x-2'
                      : isPast
                      ? 'bg-white/5 border-white/5 opacity-60'
                      : 'border-transparent opacity-30'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-secondary-container animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                      {step.label}
                    </h4>
                    {isActive && <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{step.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Minimalist Success Window reflecting Direct Submission */
        <div className="relative z-10 flex flex-col items-center justify-center py-16 md:py-24 text-center animate-fade-in" id="success-popup-box">
          
          {/* Animated Ambient Glow */}
          <div className="absolute inset-0 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Core Interactive Success Circle */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
            </div>
            <div className="absolute -inset-2 bg-emerald-500/20 rounded-full -z-10 blur-slate opacity-50"></div>
          </div>

          <div className="max-w-xl px-4">
            <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Thank You!
            </h3>
            
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
              Thanks, <span className="text-emerald-450 text-emerald-400 font-bold">{fullName}</span>. Your request has been successfully submitted. We will contact you soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
