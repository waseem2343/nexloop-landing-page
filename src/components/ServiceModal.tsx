/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, ArrowRight, ShieldCheck, Cpu, Database, Landmark, Palette, Smartphone, Sparkles, ShoppingBag, Megaphone, Target, ShoppingCart, Code } from 'lucide-react';
import { StrategicPillar } from '../types';

interface ServiceModalProps {
  pillar: StrategicPillar | null;
  onClose: () => void;
  setSelectedService?: (val: string) => void;
}

const mapPillarToServiceValue = (pillarId: string): string => {
  switch (pillarId) {
    case 'amazon-noon': return 'Amazon & Noon Support';
    case 'digital-marketing': return 'Digital Marketing';
    case 'web-design-dev': return 'Web Design & Development';
    case 'uae-corporate': return 'UAE Corporate Services';
    case 'mobile-app-dev': return 'Mobile App Development';
    case 'pos-dev': return 'POS Development';
    case 'shopify-dev': return 'Shopify Development';
    case 'graphic-designing': return 'Graphic Designing';
    case 'ads-management': return 'Meta, Google, Snapchat & TikTok Ads Management';
    case 'ai-automation': return 'AI Based Automation Systems';
    default: return 'Web Design & Development';
  }
};

const getPillarIcon = (iconType: string) => {
  const iconProps = { className: "w-8 h-8 text-primary-brand" };
  switch (iconType) {
    case 'ecommerce':   return <ShoppingCart {...iconProps} />;
    case 'shopify':     return <ShoppingBag className="w-8 h-8 text-emerald-400" />;
    case 'marketing':   return <Megaphone className="w-8 h-8 text-[#a5eeff]" />;
    case 'ads':         return <Target className="w-8 h-8 text-amber-400" />;
    case 'webdev':      return <Code className="w-8 h-8 text-[#0066ff]" />;
    case 'mobile':      return <Smartphone className="w-8 h-8 text-purple-400" />;
    case 'pos':         return <Cpu className="w-8 h-8 text-[#ce93d8]" />;
    case 'graphic':     return <Palette className="w-8 h-8 text-rose-400" />;
    case 'corporate':   return <Landmark className="w-8 h-8 text-amber-500" />;
    case 'ai':          return <Sparkles className="w-8 h-8 text-violet-400" />;
    default:            return <Database {...iconProps} />;
  }
};

export default function ServiceModal({ pillar, onClose, setSelectedService }: ServiceModalProps) {
  if (!pillar) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#111111] rounded-[32px] md:rounded-[48px] border border-white/10 overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]" id="service-modal-inner">
        
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
              className="p-2 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white rounded-full transition-all cursor-pointer"
              id="close-service-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {getPillarIcon(pillar.iconType)}
                </div>
                <h3 className="font-display text-2xl md:text-3.5xl font-bold text-white mb-4 leading-tight">
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
              </div>

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

            <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/20 relative aspect-video md:aspect-auto flex items-center justify-center min-h-[240px]">
              {pillar.imageUrl ? (
                <img
                  src={pillar.imageUrl}
                  alt={pillar.title}
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 text-center bg-gradient-to-br from-primary-container/20 to-secondary-container/10 w-full h-full flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <Cpu className="w-8 h-8 text-primary-brand animate-float" />
                  </div>
                  <h4 className="font-display text-sm font-semibold text-white">Full-Scale Regional Integration</h4>
                  <p className="text-[11px] text-on-surface-variant max-w-xs mt-1">Leveraging state-of-the-art technology for elite compliance and performance.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Redirection Footer */}
          <div className="bg-gradient-to-r from-primary-container/15 to-secondary-container/5 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
            <div className="text-left">
              <h4 className="text-sm font-bold text-white mb-1 font-display">Configure Service Blueprint</h4>
              <p className="text-xs text-on-surface-variant max-w-xl">
                Ready to map brand execution criteria for <span className="text-white font-semibold">{pillar.title}</span>? Select this service option to fill in your project specification loop constraints.
              </p>
            </div>
            <button
              onClick={() => {
                const serviceValue = mapPillarToServiceValue(pillar.id);
                if (setSelectedService) {
                  setSelectedService(serviceValue);
                }
                onClose();
                const contactEl = document.getElementById('contact');
                if (contactEl) {
                  contactEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3 bg-primary-container hover:bg-opacity-95 text-white font-label-md text-xs font-bold rounded-full flex items-center gap-2 shadow-lg shadow-primary-container/20 hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
              id="initiate-project-pillar"
            >
              Initiate Project Form
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
