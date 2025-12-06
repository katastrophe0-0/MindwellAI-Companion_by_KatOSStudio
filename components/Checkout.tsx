
import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, ArrowLeft, Loader2, AlertCircle, Zap, Sparkles, Crown, Star } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface CheckoutProps {
  onComplete: (tier: SubscriptionTier) => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onComplete, onCancel }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('glow'); // Default to middle tier
  const [step, setStep] = useState<'selection' | 'payment'>('selection');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const tiers = [
      {
          id: 'spark',
          name: 'Spark',
          price: '1.99',
          color: 'amber',
          icon: Zap,
          features: ['Advanced Mood Trends', 'Unlimited Cycle Tracking', 'Save Affirmations']
      },
      {
          id: 'glow',
          name: 'Glow',
          price: '4.99',
          color: 'indigo',
          icon: Sparkles,
          popular: true,
          features: ['Everything in Spark', 'Mindful Voice Companion', 'Chatbot History', 'Thought Reframer']
      },
      {
          id: 'radiance',
          name: 'Radiance',
          price: '9.99',
          color: 'purple',
          icon: Crown,
          features: ['Everything in Glow', 'Video Vision Boards', 'AI Image Generator', 'Sleep Station Stories', 'Coping Strategizer']
      }
  ];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        onComplete(selectedTier);
    } catch (err: any) {
        setError('Payment failed. Please try again.');
        setIsProcessing(false);
    }
  };

  if (step === 'selection') {
      return (
        <div className="bg-slate-50 rounded-lg shadow-md h-full flex flex-col overflow-hidden animate-fade-in relative">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            <div className="p-4 flex items-center gap-4 z-10">
                <button onClick={onCancel} className="p-2 bg-white/80 hover:bg-white rounded-full transition-all text-slate-600 shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800">Choose Your Plan</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Invest in Your Well-being</h1>
                    <p className="text-slate-500">Unlock the full potential of your AI companion.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-end">
                    {tiers.map((tier) => {
                        const Icon = tier.icon;
                        const isSelected = selectedTier === tier.id;
                        return (
                            <div 
                                key={tier.id}
                                onClick={() => setSelectedTier(tier.id as SubscriptionTier)}
                                className={`
                                    relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 flex flex-col h-full
                                    ${isSelected 
                                        ? `border-${tier.color}-500 bg-white shadow-xl transform scale-105 z-20` 
                                        : 'border-white bg-white/60 hover:bg-white hover:border-slate-200 shadow-sm opacity-90 hover:opacity-100'
                                    }
                                `}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" /> Most Popular
                                    </div>
                                )}
                                
                                <div className={`w-12 h-12 rounded-xl bg-${tier.color}-100 flex items-center justify-center mb-4`}>
                                    <Icon className={`w-6 h-6 text-${tier.color}-600`} />
                                </div>

                                <h3 className={`text-xl font-bold text-slate-800 mb-1`}>MindWell {tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-bold text-slate-900">${tier.price}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {tier.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className={`w-4 h-4 text-${tier.color}-500 flex-shrink-0 mt-0.5`} />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    className={`w-full py-3 rounded-xl font-bold transition-colors ${isSelected ? `bg-${tier.color}-600 text-white shadow-lg` : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {isSelected ? 'Selected' : 'Choose Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <button 
                        onClick={() => setStep('payment')}
                        className="bg-slate-900 text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95"
                    >
                        Continue to Payment
                    </button>
                    <p className="text-xs text-slate-400 mt-4">Secure payment powered by Stripe. Cancel anytime.</p>
                </div>
            </div>
        </div>
      );
  }

  const selectedTierDetails = tiers.find(t => t.id === selectedTier);

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
            <button onClick={() => setStep('selection')} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Secure Checkout
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                <div className={`bg-${selectedTierDetails?.color}-50 border border-${selectedTierDetails?.color}-200 p-6 rounded-2xl mb-8 flex justify-between items-center`}>
                    <div>
                        <p className={`text-xs font-bold text-${selectedTierDetails?.color}-600 uppercase tracking-wider`}>Selected Plan</p>
                        <h3 className="text-xl font-bold text-slate-800">MindWell {selectedTierDetails?.name}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">${selectedTierDetails?.price}</p>
                        <p className="text-xs text-slate-500">per month</p>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50" disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                            <input type="text" placeholder="MM/YY" className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50" disabled />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVC</label>
                            <input type="text" placeholder="123" className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50" disabled />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-100 rounded-lg text-xs text-slate-500 text-center mb-4">
                        * Demo Mode: No real payment processing will occur.
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4"/> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2`}
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Confirm Subscription'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Checkout;
