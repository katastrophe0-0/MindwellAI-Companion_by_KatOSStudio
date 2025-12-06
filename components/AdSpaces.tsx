
import React from 'react';
import { Sparkles, Crown, Zap, ExternalLink } from 'lucide-react';
import { SubscriptionTier } from '../types';

export const ExternalAdBanner: React.FC = () => {
  return (
    <div className="w-full mt-8 p-4 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 relative overflow-hidden min-h-[100px]">
        <div className="absolute top-1 right-2 text-[10px] uppercase font-bold tracking-widest text-slate-300">Advertisement</div>
        <div className="flex items-center gap-3 opacity-70">
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium text-sm">Space reserved for Google Ads / Partners</span>
        </div>
        <div className="mt-2 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300 w-2/3 animate-pulse"></div>
        </div>
    </div>
  );
};

export const HouseAd: React.FC<{ onUpgrade: () => void, currentTier: SubscriptionTier }> = ({ onUpgrade, currentTier }) => {
    if (currentTier === 'radiance') return null;

    const isFree = currentTier === 'free';

    return (
        <div className="mx-4 mt-auto mb-4 p-5 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-colors"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-amber-300">
                    {isFree ? <Crown className="w-5 h-5 fill-current" /> : <Sparkles className="w-5 h-5" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{isFree ? 'Go Premium' : 'Upgrade Plan'}</span>
                </div>
                
                <h3 className="font-bold text-lg leading-tight mb-2">
                    {isFree ? 'Unlock the full experience.' : 'Get the Radiance advantage.'}
                </h3>
                
                <p className="text-indigo-200 text-xs mb-4 leading-relaxed">
                    {isFree 
                        ? 'Get unlimited AI chat, sleep stories, and advanced insights.' 
                        : 'Access video generation, deep coping strategies, and more.'}
                </p>

                <button 
                    onClick={onUpgrade}
                    className="w-full py-2.5 bg-white text-indigo-900 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    <Zap className="w-4 h-4 fill-indigo-900" />
                    {isFree ? 'Start Free Trial' : 'Upgrade Now'}
                </button>
            </div>
        </div>
    );
};
