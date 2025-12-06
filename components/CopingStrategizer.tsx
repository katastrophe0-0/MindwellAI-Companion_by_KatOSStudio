
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PremiumLock from './PremiumLock';
import { AppView, SubscriptionTier } from '../types';


const CopingStrategizer: React.FC<{ subscriptionTier: SubscriptionTier; setActiveView: (view: AppView) => void; }> = ({ subscriptionTier, setActiveView }) => {
  const [situation, setSituation] = useState('');
  const [strategy, setStrategy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateStrategy = async () => {
    if (!situation.trim()) {
      setError('Please describe your situation first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setStrategy('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Analyze the following situation and provide a detailed, step-by-step coping strategy. The user is looking for actionable advice and a thoughtful plan. Consider cognitive-behavioral techniques, mindfulness, and problem-solving approaches. Format the response in clear, easy-to-follow Markdown. Situation: "${situation}"`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          temperature: 0.7,
        }
      });
      setStrategy(response.text);
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError('We encountered an issue generating your strategy. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Requires Radiance
  const hasAccess = subscriptionTier === 'radiance';

  if (!hasAccess) {
    return <PremiumLock setActiveView={setActiveView} featureName="Coping Strategizer" requiredTier="radiance" currentTier={subscriptionTier} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Coping Strategizer</h2>
        <p className="text-sm text-slate-500">Describe a challenging situation, and our AI will help you build a thoughtful coping plan.</p>
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-slate-700 mb-1">
            What's on your mind?
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g., I'm feeling overwhelmed at work with a tight deadline and conflicts with a coworker."
            rows={5}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={generateStrategy}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Thinking...
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5 mr-2" />
              Generate My Strategy
            </>
          )}
        </button>
        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
        )}
        {strategy && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-4">
             <h3 className="text-lg font-semibold text-slate-800 mb-2">Your Personalized Coping Strategy</h3>
             <div className="prose prose-sm max-w-none prose-slate">
                <ReactMarkdown>{strategy}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopingStrategizer;
