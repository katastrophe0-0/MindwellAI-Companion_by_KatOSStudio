
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Heart, RefreshCw, Copy, Bookmark, BookmarkMinus } from 'lucide-react';
import { UserProfile, SubscriptionTier, AppView } from '../types';
import PremiumLock from './PremiumLock';

interface AffirmationDeckProps {
    userProfile: UserProfile | null;
    subscriptionTier: SubscriptionTier;
    setActiveView: (view: AppView) => void;
}

const AffirmationDeck: React.FC<AffirmationDeckProps> = ({ userProfile, subscriptionTier, setActiveView }) => {
    const [currentAffirmation, setCurrentAffirmation] = useState<string>('');
    const [savedAffirmations, setSavedAffirmations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'deck' | 'saved'>('deck');

    // Requires Spark
    const hasAccess = subscriptionTier !== 'free';

    useEffect(() => {
        const saved = localStorage.getItem('savedAffirmations');
        if (saved) {
            setSavedAffirmations(JSON.parse(saved));
        }
        generateAffirmation();
    }, []);

    const generateAffirmation = async () => {
        if (!hasAccess) return;
        
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let prompt = "Generate a short, powerful, first-person positive affirmation.";
            
            if (userProfile) {
                const context = [];
                if (userProfile.goals.length > 0) context.push(`goals: ${userProfile.goals.join(', ')}`);
                if (userProfile.challenges.length > 0) context.push(`challenges: ${userProfile.challenges.join(', ')}`);
                if (context.length > 0) {
                    prompt += ` Tailor it to someone with these ${context.join(' and ')}. Keep it under 20 words.`;
                }
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const text = response.text.replace(/^["']|["']$/g, ''); // Remove quotes if present
            setCurrentAffirmation(text);
        } catch (error) {
            setCurrentAffirmation("I am capable of handling whatever comes my way.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSave = (text: string) => {
        let updated;
        if (savedAffirmations.includes(text)) {
            updated = savedAffirmations.filter(a => a !== text);
        } else {
            updated = [text, ...savedAffirmations];
        }
        setSavedAffirmations(updated);
        localStorage.setItem('savedAffirmations', JSON.stringify(updated));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!hasAccess) {
        return <PremiumLock setActiveView={setActiveView} featureName="Daily Affirmations" requiredTier="spark" currentTier={subscriptionTier} />;
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> Daily Affirmations
                </h2>
                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button 
                        onClick={() => setView('deck')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'deck' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Generate
                    </button>
                    <button 
                        onClick={() => setView('saved')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'saved' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Collection ({savedAffirmations.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 flex flex-col items-center">
                {view === 'deck' ? (
                    <div className="w-full max-w-md my-auto flex flex-col gap-6">
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center text-white transform transition-transform hover:scale-[1.01]">
                            <div className="absolute top-4 right-4">
                                <Sparkles className="w-6 h-6 text-yellow-300 opacity-50" />
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <Heart className="w-6 h-6 text-pink-300 opacity-50" />
                            </div>
                            
                            {isLoading ? (
                                <div className="animate-pulse space-y-4 w-full">
                                    <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
                                </div>
                            ) : (
                                <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed drop-shadow-sm">
                                    "{currentAffirmation}"
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => toggleSave(currentAffirmation)}
                                disabled={isLoading}
                                className={`p-4 rounded-full shadow-md transition-all hover:scale-110 ${savedAffirmations.includes(currentAffirmation) ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-400 hover:text-pink-500'}`}
                                title="Save to collection"
                            >
                                <Heart className={`w-6 h-6 ${savedAffirmations.includes(currentAffirmation) ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                                onClick={generateAffirmation}
                                disabled={isLoading}
                                className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all hover:scale-105 flex items-center"
                            >
                                <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                New Card
                            </button>
                            <button 
                                onClick={() => copyToClipboard(currentAffirmation)}
                                disabled={isLoading}
                                className="p-4 bg-white text-slate-400 rounded-full shadow-md hover:text-indigo-600 transition-all hover:scale-110"
                                title="Copy text"
                            >
                                <Copy className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl space-y-4">
                        {savedAffirmations.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No saved affirmations yet.</p>
                                <button onClick={() => setView('deck')} className="text-indigo-600 font-bold hover:underline mt-2">Go generate some!</button>
                            </div>
                        ) : (
                            savedAffirmations.map((text, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center group hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in"
                                    style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
                                >
                                    <p className="text-lg text-slate-700 font-medium italic">"{text}"</p>
                                    <button 
                                        onClick={() => toggleSave(text)}
                                        className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove"
                                    >
                                        <BookmarkMinus className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AffirmationDeck;
