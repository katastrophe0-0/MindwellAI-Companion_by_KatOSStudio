import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Flame, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';

const TECHNIQUES = {
  'Box Breathing': {
    steps: [
      { label: 'Inhale', duration: 4000, scale: 1.5 },
      { label: 'Hold', duration: 4000, scale: 1.5 },
      { label: 'Exhale', duration: 4000, scale: 1.0 },
      { label: 'Hold', duration: 4000, scale: 1.0 },
    ],
    description: "Reduces stress and improves focus. Inhale 4s, Hold 4s, Exhale 4s, Hold 4s."
  },
  '4-7-8 Relax': {
    steps: [
      { label: 'Inhale', duration: 4000, scale: 1.5 },
      { label: 'Hold', duration: 7000, scale: 1.5 },
      { label: 'Exhale', duration: 8000, scale: 1.0 },
    ],
    description: "Natural tranquilizer for the nervous system. Good for sleep."
  },
  'Coherent': {
    steps: [
      { label: 'Inhale', duration: 5500, scale: 1.5 },
      { label: 'Exhale', duration: 5500, scale: 1.0 },
    ],
    description: "Balances the heart and brain. 5.5s Inhale, 5.5s Exhale."
  }
};

interface BreathingSession {
    date: string; // YYYY-MM-DD
    timestamp: number;
    durationSeconds: number;
    technique: string;
}

const BreathingExercise: React.FC = () => {
  const [activeTechnique, setActiveTechnique] = useState<keyof typeof TECHNIQUES>('Box Breathing');
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [instruction, setInstruction] = useState('Ready');
  const [duration, setDuration] = useState(500);
  
  // History & Stats State
  const [history, setHistory] = useState<BreathingSession[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  
  const currentPattern = TECHNIQUES[activeTechnique];

  // Load history and calculate stats
  useEffect(() => {
      const savedHistory = localStorage.getItem('breathingHistory');
      if (savedHistory) {
          const parsed: BreathingSession[] = JSON.parse(savedHistory);
          setHistory(parsed);
          calculateStats(parsed);
      }
  }, []);

  const calculateStats = (sessions: BreathingSession[]) => {
      // Total Minutes
      const totalSecs = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      setTotalMinutes(Math.floor(totalSecs / 60));

      // Streak Calculation
      if (sessions.length === 0) {
          setStreak(0);
          return;
      }
      
      const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let currentStreak = 0;
      let checkDate = uniqueDates[0] === today ? today : yesterday;
      
      // If the most recent entry isn't today or yesterday, streak is broken (unless array empty)
      if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
          setStreak(0);
          return;
      }

      for (const date of uniqueDates) {
          if (date === checkDate) {
              currentStreak++;
              const prevDate = new Date(checkDate);
              prevDate.setDate(prevDate.getDate() - 1);
              checkDate = prevDate.toISOString().split('T')[0];
          } else {
              break;
          }
      }
      setStreak(currentStreak);
  };

  const saveSession = (durationSecs: number) => {
      if (durationSecs < 30) return; // Only log sessions > 30 seconds

      const newSession: BreathingSession = {
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          durationSeconds: durationSecs,
          technique: activeTechnique
      };
      
      const updatedHistory = [...history, newSession];
      setHistory(updatedHistory);
      localStorage.setItem('breathingHistory', JSON.stringify(updatedHistory));
      calculateStats(updatedHistory);
  };

  useEffect(() => {
    let timeoutId: number;

    if (isActive) {
      const step = currentPattern.steps[currentStepIndex];
      setInstruction(step.label);
      setScale(step.scale);
      setDuration(step.duration);

      timeoutId = window.setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % currentPattern.steps.length);
      }, step.duration);
    } else {
      setInstruction('Ready');
      setScale(1);
      setDuration(500);
      setCurrentStepIndex(0);
    }

    return () => clearTimeout(timeoutId);
  }, [isActive, currentStepIndex, activeTechnique, currentPattern.steps]);

  // Handle component unmount or navigation away
  useEffect(() => {
      return () => {
          if (sessionStartTimeRef.current && isActive) {
               const end = Date.now();
               const seconds = Math.floor((end - sessionStartTimeRef.current) / 1000);
               saveSession(seconds);
          }
      };
  }, [isActive]);

  // Reset when technique changes
  useEffect(() => {
    if (isActive && sessionStartTimeRef.current) {
        const end = Date.now();
        const seconds = Math.floor((end - sessionStartTimeRef.current) / 1000);
        saveSession(seconds);
        sessionStartTimeRef.current = null;
    }
    setIsActive(false);
    setCurrentStepIndex(0);
  }, [activeTechnique]);

  const toggleSession = () => {
      if (isActive) {
          // Stopping
          if (sessionStartTimeRef.current) {
              const end = Date.now();
              const seconds = Math.floor((end - sessionStartTimeRef.current) / 1000);
              saveSession(seconds);
              sessionStartTimeRef.current = null;
          }
          setIsActive(false);
      } else {
          // Starting
          sessionStartTimeRef.current = Date.now();
          setIsActive(true);
      }
  };

  const resetSession = () => {
      if (isActive && sessionStartTimeRef.current) {
           const end = Date.now();
           const seconds = Math.floor((end - sessionStartTimeRef.current) / 1000);
           saveSession(seconds);
      }
      sessionStartTimeRef.current = null;
      setIsActive(false);
      setCurrentStepIndex(0);
  };

  // Helper for Last 7 Days Visualization
  const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const hasActivity = history.some(h => h.date === dateStr);
          days.push({ date: dateStr, dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }), hasActivity });
      }
      return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 h-full flex flex-col items-center p-8 animate-fade-in overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
            <Wind className="w-6 h-6 mr-2 text-teal-500"/> Breathing Exercises
        </h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
            Follow the visual guide to regulate your nervous system.
        </p>

        <div className="flex gap-2 mb-10 overflow-x-auto w-full justify-center pb-2">
            {Object.keys(TECHNIQUES).map(tech => (
                <button
                    key={tech}
                    onClick={() => setActiveTechnique(tech as any)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                        activeTechnique === tech 
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-200 scale-105' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {tech}
                </button>
            ))}
        </div>

        <div className="relative flex items-center justify-center w-80 h-80 mb-12 flex-shrink-0">
            {/* Outer Rings for decorative purpose */}
            <div className="absolute w-full h-full border border-teal-100/50 rounded-full"></div>
            <div className="absolute w-3/4 h-3/4 border border-teal-100/50 rounded-full"></div>

            {/* Blooming Layers */}
            <div 
                className="absolute rounded-full bg-teal-200/30 blur-xl mix-blend-multiply transition-all ease-in-out"
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${isActive ? 1.2 : 0.6})`,
                    transitionDuration: `${duration}ms`
                }}
            ></div>
            <div 
                className="absolute rounded-full bg-emerald-200/30 blur-lg mix-blend-multiply transition-all ease-in-out"
                style={{
                    width: '90%',
                    height: '90%',
                    transform: `scale(${isActive ? 1.1 : 0.7})`,
                    transitionDuration: `${duration}ms`
                }}
            ></div>

            {/* Main Circle */}
            <div 
                className="relative bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl transition-all ease-in-out z-10"
                style={{
                    width: '160px',
                    height: '160px',
                    transform: `scale(${scale})`,
                    transitionDuration: `${duration}ms`,
                    boxShadow: isActive ? '0 25px 50px -12px rgba(20, 184, 166, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="text-center text-white">
                    <p className="text-2xl font-bold tracking-wide">{instruction}</p>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex gap-8 mb-12">
             {!isActive ? (
                <button onClick={toggleSession} className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-teal-200 hover:bg-teal-700 transition-all transform hover:scale-110 active:scale-95">
                    <Play className="w-8 h-8 ml-1"/>
                </button>
             ) : (
                <button onClick={toggleSession} className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all transform hover:scale-110 active:scale-95">
                    <Pause className="w-8 h-8"/>
                </button>
             )}
             <button onClick={resetSession} className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-lg hover:text-slate-600 hover:border-slate-300 transition-all transform hover:scale-110 active:scale-95">
                <RotateCcw className="w-6 h-6"/>
             </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <div className="bg-orange-100 p-2.5 rounded-xl"><Flame className="w-6 h-6 text-orange-500"/></div>
                 <div>
                     <p className="text-2xl font-bold text-slate-800">{streak}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Day Streak</p>
                 </div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <div className="bg-blue-100 p-2.5 rounded-xl"><Clock className="w-6 h-6 text-blue-500"/></div>
                 <div>
                     <p className="text-2xl font-bold text-slate-800">{totalMinutes}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Minutes</p>
                 </div>
             </div>
        </div>
        
        {/* Weekly Activity */}
        <div className="w-full max-w-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center"><CalendarDays className="w-4 h-4 mr-2"/> Recent Activity</h3>
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                {last7Days.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${day.hasActivity ? 'bg-teal-500 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-300'}`}>
                            {day.hasActivity ? <CheckCircle2 className="w-5 h-5"/> : day.dayName[0]}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{day.dayName}</span>
                    </div>
                ))}
            </div>
        </div>

    </div>
  );
};

export default BreathingExercise;