
import React, { useState } from 'react';
import { ArrowRight, Check, Droplet } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const GOALS = [
  { id: 'anxiety', label: 'Reduce Anxiety', emoji: '😌' },
  { id: 'sleep', label: 'Improve Sleep', emoji: '😴' },
  { id: 'focus', label: 'Better Focus', emoji: '🎯' },
  { id: 'mood', label: 'Boost Mood', emoji: '☀️' },
  { id: 'stress', label: 'Manage Stress', emoji: '🌱' },
];

const CHALLENGES = [
  'Work Stress', 'Relationship Issues', 'Insomnia', 'Loneliness', 'Health Concerns', 'Financial Stress'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [enableCycleTracking, setEnableCycleTracking] = useState(false);

  const handleGoalToggle = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleChallengeToggle = (challenge: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challenge) ? prev.filter(c => c !== challenge) : [...prev, challenge]
    );
  };

  const finishOnboarding = () => {
    const profile: UserProfile = {
      name,
      goals: selectedGoals,
      challenges: selectedChallenges,
      onboardingCompleted: true,
      enableCycleTracking,
      subscriptionTier: 'free',
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-8">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 shadow-md">
                <img 
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop" 
                    alt="Peaceful Wellness" 
                    className="w-full h-full object-cover"
                />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome to MindWell</h1>
            <p className="text-slate-600">Let's get to know you better to personalize your journey.</p>
            <div className="text-left">
              <label className="block text-sm font-medium text-slate-700 mb-2">What should we call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Next Step <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">What brings you here?</h2>
              <p className="text-slate-600">Select your primary goals (choose all that apply).</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    selectedGoals.includes(goal.id)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="font-semibold text-lg flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span> {goal.label}
                  </span>
                  {selectedGoals.includes(goal.id) && <Check className="w-6 h-6 text-indigo-600" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={selectedGoals.length === 0}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Current Challenges</h2>
              <p className="text-slate-600">What are you navigating right now?</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {CHALLENGES.map(challenge => (
                <button
                  key={challenge}
                  onClick={() => handleChallengeToggle(challenge)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedChallenges.includes(challenge)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {challenge}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between bg-pink-50 p-4 rounded-xl border border-pink-100 cursor-pointer" onClick={() => setEnableCycleTracking(!enableCycleTracking)}>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm text-pink-500">
                  <Droplet size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">Track Menstrual Cycle?</p>
                  <p className="text-xs text-slate-500">Get hormonal insights & mood predictions.</p>
                </div>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableCycleTracking ? 'bg-pink-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableCycleTracking ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button
              onClick={finishOnboarding}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors mt-4"
            >
              Start My Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
