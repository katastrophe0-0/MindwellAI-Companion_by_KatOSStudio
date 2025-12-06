
import React from 'react';
import { Lock, ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';
import { AppView, SubscriptionTier } from '../types';

interface PremiumLockProps {
    featureName: string;
    requiredTier: SubscriptionTier;
    currentTier: SubscriptionTier;
    setActiveView: (view: AppView) => void;
}

const PremiumLock: React.FC<PremiumLockProps> = ({ featureName, requiredTier, setActiveView }) => {
    
    const getTierDetails = (tier: SubscriptionTier) => {
        switch(tier) {
            case 'spark': return { color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200', label: 'Spark', icon: Zap };
            case 'glow': return { color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-200', label: 'Glow', icon: Sparkles };
            case 'radiance': return { color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-200', label: 'Radiance', icon: Crown };
            default: return { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Premium', icon: Lock };
        }
    };

    const details = getTierDetails(requiredTier);
    const Icon = details.icon;

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className={`w-24 h-24 ${details.bg} rounded-full flex items-center justify-center mb-6 border-4 ${details.border} shadow-inner`}>
                <Icon className={`w-12 h-12 ${details.color}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unlock {featureName}</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
                This feature is available exclusively on the <span className={`font-bold ${details.color}`}>{details.label}</span> tier and above. Upgrade to access this tool.
            </p>
            <button
                onClick={() => setActiveView(AppView.Checkout)}
                className={`flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:scale-105 hover:shadow-xl transition-all duration-300`}
            >
                View Plans
                <ArrowRight className="w-5 h-5 ml-2" />
            </button>
        </div>
    );
};

export default PremiumLock;
