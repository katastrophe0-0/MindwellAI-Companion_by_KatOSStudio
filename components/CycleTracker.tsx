
import React, { useState, useEffect } from 'react';
import { CycleData } from '../types';
import { Droplet, Calendar, Info, ArrowRight, BrainCircuit, Battery, Moon } from 'lucide-react';

const PHASES = [
  {
    name: 'Menstrual',
    days: [1, 5],
    color: 'bg-red-500',
    mood: 'Inward & Reflective',
    insight: 'Estrogen and progesterone are low. You may feel tired or withdrawn. It’s a natural time for rest and journaling.',
    action: 'Prioritize sleep and gentle movement like walking or stretching.'
  },
  {
    name: 'Follicular',
    days: [6, 13],
    color: 'bg-pink-400',
    mood: 'Energetic & Creative',
    insight: 'Estrogen is rising. Mental clarity and energy usually increase. A great time for brainstorming, learning, and social activities.',
    action: 'Tackle complex tasks or start new habits.'
  },
  {
    name: 'Ovulation',
    days: [14, 17],
    color: 'bg-purple-400',
    mood: 'Confident & Social',
    insight: 'Estrogen peaks and testosterone rises slightly. Verbal skills and confidence are often at their highest.',
    action: 'Schedule important conversations or social gatherings.'
  },
  {
    name: 'Luteal',
    days: [18, 28],
    color: 'bg-indigo-400',
    mood: 'Detailed & Sensitive',
    insight: 'Progesterone rises, which can have a sedating effect but may also trigger anxiety or PMS symptoms as the phase ends. You might feel more critical or detail-oriented.',
    action: 'Be gentle with yourself. Focus on organizing, wrapping up tasks, and self-care.'
  }
];

const CycleTracker: React.FC = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    lastPeriodStart: '',
    cycleLength: 28,
    periodLength: 5
  });
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<typeof PHASES[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cycleData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCycleData(parsed);
      calculateCycle(parsed);
    } else {
      setIsEditing(true);
    }
  }, []);

  const calculateCycle = (data: CycleData) => {
    if (!data.lastPeriodStart) return;

    const start = new Date(data.lastPeriodStart);
    start.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Calculate difference in days
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Modulo cycle length to find current day in cycle (1-based index)
    let dayInCycle = (diffDays % data.cycleLength);
    
    // Adjust logic for 0-index modulo vs 1-based days
    if (dayInCycle <= 0) {
        dayInCycle = dayInCycle + data.cycleLength; // Handle past cycles correctly wrapping
    }
    // If today is exactly start date, it is day 1 (modulo gives 0 usually if divisible, or we handle exact match)
    if (diffDays === 0) dayInCycle = 1;

    // Recalculate robustly:
    // Days since start: 0 -> Day 1
    // Days since start: 1 -> Day 2
    // Formula: (diffDays % length) + 1
    // Example: 0 % 28 = 0 -> +1 = 1. Correct.
    // Example: 27 % 28 = 27 -> +1 = 28. Correct.
    // Example: 28 % 28 = 0 -> +1 = 1. Correct.
    
    // Using robust formula
    dayInCycle = (diffDays % data.cycleLength);
    if (dayInCycle < 0) dayInCycle += data.cycleLength; // Handle future start date quirk if any
    dayInCycle += 1; // 1-based index

    setCurrentDay(dayInCycle);

    // Determine Phase
    // Extend Luteal phase range to cover cycles longer than 28 days for visual mapping
    const adjustedPhases = PHASES.map(p => {
        if (p.name === 'Luteal') return { ...p, days: [p.days[0], 100] }; // Catch-all for end of cycle
        return p;
    });

    const phase = adjustedPhases.find(p => dayInCycle >= p.days[0] && dayInCycle <= p.days[1]);
    setCurrentPhase(phase || PHASES[3]);
  };

  const handleSave = () => {
    if (cycleData.lastPeriodStart) {
      localStorage.setItem('cycleData', JSON.stringify(cycleData));
      calculateCycle(cycleData);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Droplet className="w-6 h-6 mr-2 text-pink-500" /> Cycle & Mind Sync
        </h2>
        <p className="text-slate-500">Understand how your hormonal rhythms influence your mental well-being.</p>
      </div>

      <div className="p-6 space-y-8 max-w-4xl mx-auto w-full">
        
        {/* Status Card */}
        {currentDay && currentPhase && !isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-2 ${currentPhase.color}`}></div>
               <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-2">Current Cycle Day</p>
               <h3 className="text-6xl font-bold text-slate-800 mb-2">{currentDay}</h3>
               <span className={`px-4 py-1 rounded-full text-white font-bold text-sm ${currentPhase.color}`}>
                 {currentPhase.name} Phase
               </span>
               <button onClick={() => setIsEditing(true)} className="mt-6 text-sm text-slate-400 hover:text-indigo-600 underline">Update Log</button>
            </div>

            <div className="space-y-4">
               <h3 className="text-xl font-bold text-slate-800">Mind-Body Insights</h3>
               
               <div className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4 items-start shadow-sm">
                  <div className="bg-indigo-100 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 text-indigo-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Mental State</h4>
                    <p className="text-slate-600 text-sm mt-1">{currentPhase.mood}</p>
                    <p className="text-slate-500 text-xs mt-1">{currentPhase.insight}</p>
                  </div>
               </div>

               <div className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4 items-start shadow-sm">
                  <div className="bg-teal-100 p-2 rounded-lg"><Battery className="w-5 h-5 text-teal-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Recommended Action</h4>
                    <p className="text-slate-600 text-sm mt-1">{currentPhase.action}</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{isEditing ? 'Log Your Cycle' : 'No Data Logged'}</h3>
            <p className="text-slate-500 mb-6">Enter the first day of your last period to get personalized insights.</p>
            
            <div className="max-w-xs mx-auto space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Period Start Date</label>
                <input 
                  type="date" 
                  value={cycleData.lastPeriodStart}
                  onChange={(e) => setCycleData({...cycleData, lastPeriodStart: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Average Cycle Length (Days)</label>
                <input 
                  type="number" 
                  value={cycleData.cycleLength}
                  onChange={(e) => setCycleData({...cycleData, cycleLength: parseInt(e.target.value)})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  min="21" max="45"
                />
              </div>
              <button onClick={handleSave} className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors">
                Save & See Insights
              </button>
            </div>
            {isEditing && currentDay && <button onClick={() => setIsEditing(false)} className="mt-4 text-slate-500 hover:underline">Cancel</button>}
          </div>
        )}

        {/* Educational Section */}
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center"><Info className="w-5 h-5 mr-2 text-indigo-500"/> Understanding Your Phases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {PHASES.map(phase => (
               <div key={phase.name} className={`p-4 rounded-xl border ${currentPhase?.name === phase.name ? 'border-pink-300 bg-pink-50 ring-2 ring-pink-100' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${phase.color}`}></span>
                    <h4 className="font-bold text-slate-800">{phase.name}</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Days {phase.days[0]}-{phase.days[1]}</p>
                  <p className="text-xs text-slate-600 mb-3">{phase.mood}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{phase.insight}</p>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CycleTracker;
