
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { RefreshCw, MessageSquareQuote, CheckCircle2, Loader2, AlertCircle, ArrowRight, Eye, PenLine } from 'lucide-react';
import { AppView, SubscriptionTier } from '../types';
import PremiumLock from './PremiumLock';
import ReactMarkdown from 'react-markdown';

interface ThoughtReframerProps {
    subscriptionTier: SubscriptionTier;
    setActiveView: (view: AppView) => void;
}

interface ReframeResult {
    distortion: string;
    explanation: string;
    reframes: string[];
}

const DISTORTIONS = [
    "All-or-Nothing Thinking", "Catastrophizing", "Emotional Reasoning", "Mind Reading", 
    "Fortune Telling", "Personalization", "Filtering", "Should Statements"
];

const ThoughtReframer: React.FC<ThoughtReframerProps> = ({ subscriptionTier, setActiveView }) => {
    const [thought, setThought] = useState('');
    const [result, setResult] = useState<ReframeResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');

    const hasAccess = subscriptionTier === 'glow' || subscriptionTier === 'radiance';

    const analyzeThought = async () => {
        if (!thought.trim()) {
            setError("Please enter a thought to analyze.");
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an expert Cognitive Behavioral Therapist (CBT). Analyze the following negative thought:
                """
                ${thought}
                """
                1. Identify the single most likely cognitive distortion.
                2. Explain briefly why this applies.
                3. Provide 3 specific, compassionate, and realistic reframes or alternative thoughts.
                
                Return JSON.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            distortion: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                            reframes: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING } 
                            }
                        },
                        required: ["distortion", "explanation", "reframes"]
                    }
                }
            });

            const data = JSON.parse(response.text);
            setResult(data);
        } catch (err) {
            console.error("Error analyzing thought:", err);
            setError("Unable to analyze thought. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setThought('');
        setResult(null);
        setError('');
        setViewMode('write');
    };

    if (!hasAccess) {
        return <PremiumLock setActiveView={setActiveView} featureName="Thought Reframer" requiredTier="glow" currentTier={subscriptionTier} />;
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <RefreshCw className="w-6 h-6 mr-2 text-indigo-500" /> Thought Reframer
                </h2>
                <p className="text-slate-500">Challenge negative thinking patterns with CBT-based insights.</p>
            </div>

            <div className="p-6 max-w-3xl mx-auto w-full flex-1">
                {!result ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-2">How it works</h3>
                            <p className="text-indigo-800/80 text-sm mb-4">
                                Our minds often play tricks on us, convincing us of things that aren't entirely true. This tool uses AI to identify "Cognitive Distortions" (biased perspectives) and suggests healthier ways to view the situation.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {DISTORTIONS.slice(0, 5).map(d => (
                                    <span key={d} className="text-[10px] bg-white text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">{d}</span>
                                ))}
                                <span className="text-[10px] text-indigo-400 self-center">+ more</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-bold text-slate-700">What is the negative thought troubling you?</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setViewMode('write')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${viewMode === 'write' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <PenLine className="w-3 h-3" /> Write
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('preview')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${viewMode === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Eye className="w-3 h-3" /> Preview
                                    </button>
                                </div>
                            </div>
                            
                            {viewMode === 'write' ? (
                                <div className="relative">
                                    <textarea 
                                        value={thought}
                                        onChange={(e) => setThought(e.target.value)}
                                        placeholder="e.g., 'My friend didn't text me back, so they must hate me.' (Markdown supported)"
                                        className="w-full h-48 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 font-sans"
                                    />
                                    <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium bg-white/80 px-2 py-1 rounded">
                                        Markdown supported
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-48 p-4 border border-slate-200 rounded-xl bg-slate-50 overflow-y-auto">
                                    {thought ? (
                                        <div className="prose prose-sm max-w-none text-slate-700">
                                            <ReactMarkdown>{thought}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic text-sm">Nothing to preview yet...</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button 
                            onClick={analyzeThought}
                            disabled={isLoading || !thought.trim()}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                            Reframe Thought
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        {/* Original Thought */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Original Thought</p>
                            <div className="prose prose-sm max-w-none text-slate-800 italic">
                                <ReactMarkdown>{thought}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-white border-l-4 border-orange-400 p-6 rounded-r-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <h3 className="font-bold text-lg text-slate-800">Distortion: {result.distortion}</h3>
                            </div>
                            <p className="text-slate-600">{result.explanation}</p>
                        </div>

                        {/* Reframes */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                <MessageSquareQuote className="w-5 h-5 mr-2 text-green-500" /> Healthy Perspectives
                            </h3>
                            <div className="grid gap-4">
                                {result.reframes.map((reframe, idx) => (
                                    <div key={idx} className="bg-green-50 p-5 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="text-green-900 font-medium text-sm leading-relaxed">
                                                {reframe}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 text-center">
                            <button 
                                onClick={reset}
                                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center mx-auto"
                            >
                                Analyze Another Thought <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThoughtReframer;
