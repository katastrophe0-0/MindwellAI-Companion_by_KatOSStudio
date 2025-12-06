import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AppView, MoodLog, UserProfile, CycleData, DashboardConfig } from '../types';
import { MOODS, MOOD_TAGS } from '../constants';
import { BarChart3, BookHeart, ClipboardCheck, Wind, AlertOctagon, ArrowRight, CheckCircle2, Flame, X, Waves, BrainCircuit, Heart, Volume2, Star, Sunrise, Sun, Sunset, Moon, Quote, Sparkles, LayoutDashboard, Zap } from 'lucide-react';

const FOCUS_ACTIVITIES = [
    "Take 5 deep, slow breaths, focusing only on your breathing.",
    "Step outside for a few minutes and notice 3 things in nature.",
    "Write down one thing you are grateful for today.",
    "Do a gentle 5-minute stretch to release tension.",
    "Listen to one of your favorite uplifting songs without distractions.",
    "Drink a full glass of water mindfully.",
    "Jot down a small, positive goal for tomorrow.",
    "Send a short, kind message to a friend or family member.",
    "Tidy up one small area of your space for 2 minutes.",
    "Close your eyes and visualize a place that makes you feel calm and happy."
];

interface DashboardProps {
    setActiveView: (view: AppView) => void;
    userProfile: UserProfile | null;
}

const WellnessPulse: React.FC<{ moodLogged: boolean, habitDone: boolean, journaled: boolean }> = ({ moodLogged, habitDone, journaled }) => {
    const completedCount = [moodLogged, habitDone, journaled].filter(Boolean).length;
    const percentage = (completedCount / 3) * 100;
    
    // Calculate stroke dashoffset for a circle with r=40 (circumference ≈ 251.3)
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 z-10">Daily Pulse</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                </svg>
                {/* Progress Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle 
                        cx="64" 
                        cy="64" 
                        r="40" 
                        stroke="#6366f1" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                     <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
                </div>
                {percentage === 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-green-500/10 rounded-full animate-ping-slow"></div>
                    </div>
                )}
            </div>
            <div className="flex gap-2 mt-6 z-10">
                <div className={`w-2 h-2 rounded-full ${moodLogged ? 'bg-indigo-500' : 'bg-slate-200'}`} title="Mood Logged"></div>
                <div className={`w-2 h-2 rounded-full ${habitDone ? 'bg-indigo-500' : 'bg-slate-200'}`} title="Habit Done"></div>
                <div className={`w-2 h-2 rounded-full ${journaled ? 'bg-indigo-500' : 'bg-slate-200'}`} title="Journaled"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50 z-0"></div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ setActiveView, userProfile }) => {
    const [quote, setQuote] = useState({ text: '', author: '' });
    const [isLoadingQuote, setIsLoadingQuote] = useState(true);
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [hasLoggedToday, setHasLoggedToday] = useState(false);
    const [hasJournaledToday, setHasJournaledToday] = useState(false);
    
    // Mood Tagging State
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showTagSelector, setShowTagSelector] = useState(false);

    // Habit State
    const [habitCompleted, setHabitCompleted] = useState(false);
    const [habitStreak, setHabitStreak] = useState(0);

    // Chart Interaction
    const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
    
    // Configuration
    const config: DashboardConfig = userProfile?.dashboardConfig || {
        showQuote: true,
        showMoodChart: true,
        showHabitTracker: true,
        showWellnessPulse: true,
        showQuickLinks: true
    };

    // Feature flags
    const breathingEnabled = userProfile?.enableBreathing !== false;
    const meditationEnabled = userProfile?.enableMeditation !== false;
    const astrologyEnabled = userProfile?.enableAstrology === true;

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    const getGreeting = () => {
        const time = getTimeOfDay();
        const greeting = time === 'morning' ? 'Good morning' : time === 'afternoon' ? 'Good afternoon' : 'Good evening';
        return userProfile?.name ? `${greeting}, ${userProfile.name}` : greeting;
    };

    const GreetingIcon = () => {
        const time = getTimeOfDay();
        switch(time) {
            case 'morning': return <Sunrise className="w-8 h-8 text-amber-500 animate-float"/>;
            case 'afternoon': return <Sun className="w-8 h-8 text-orange-500 animate-float"/>;
            case 'evening': return <Sunset className="w-8 h-8 text-indigo-400 animate-float"/>;
            default: return <Moon className="w-8 h-8 text-indigo-300 animate-float"/>;
        }
    }

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoadingQuote(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: 'Generate a short, uplifting, and insightful quote about mental well-being. Return JSON.',
                    config: {
                      responseMimeType: "application/json",
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          author: { type: Type.STRING },
                        },
                        required: ["text", "author"],
                      },
                   },
                });
                const parsed = JSON.parse(response.text);
                setQuote({ text: parsed.text, author: parsed.author });
            } catch (error) {
                setQuote({ text: "The only journey is the one within.", author: "Rainer Maria Rilke" });
            } finally {
                setIsLoadingQuote(false);
            }
        };

        const loadData = () => {
            const todayStr = new Date().toISOString().split('T')[0];

            // Load Moods
            const storedLogs = localStorage.getItem('moodLogs');
            const logs: MoodLog[] = storedLogs ? JSON.parse(storedLogs) : [];
            setMoodLogs(logs);
            setHasLoggedToday(logs.some(log => log.date === todayStr));

            // Load Journal
            const storedEntries = localStorage.getItem('journalEntries');
            if(storedEntries) {
                const entries = JSON.parse(storedEntries);
                setHasJournaledToday(entries.some((e: any) => e.date.startsWith(todayStr)));
            }

            // Load Habit
            const storedHabitData = localStorage.getItem('habitData');
            if (storedHabitData) {
                const { lastCompletedDate, streak } = JSON.parse(storedHabitData);
                setHabitStreak(streak);
                if (lastCompletedDate === todayStr) {
                    setHabitCompleted(true);
                }
            }
        }

        if (config.showQuote) fetchQuote();
        loadData();
    }, [userProfile, config.showQuote]);

    const handleMoodSelect = (level: number) => {
        setSelectedMood(level);
        setShowTagSelector(true);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const saveMoodLog = () => {
        if (selectedMood === null) return;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: MoodLog = { date: todayStr, mood: selectedMood, tags: selectedTags };
        const updatedLogs = moodLogs.filter(log => log.date !== todayStr).concat(newLog);
        
        localStorage.setItem('moodLogs', JSON.stringify(updatedLogs));
        setMoodLogs(updatedLogs);
        setHasLoggedToday(true);
        setShowTagSelector(false);
        setSelectedMood(null);
        setSelectedTags([]);
    };

    const completeHabit = () => {
        if (habitCompleted) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        const storedHabitData = localStorage.getItem('habitData');
        
        if (storedHabitData) {
            const { lastCompletedDate, streak } = JSON.parse(storedHabitData);
            if (lastCompletedDate === yesterdayStr) {
                newStreak = streak + 1;
            } else if (lastCompletedDate === todayStr) {
                newStreak = streak; // Should handle via state, but safety check
            }
        }

        localStorage.setItem('habitData', JSON.stringify({
            lastCompletedDate: todayStr,
            streak: newStreak
        }));

        setHabitStreak(newStreak);
        setHabitCompleted(true);
    };
    
    const getRecentMoods = () => {
        const recent = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = moodLogs.find(l => l.date === dateStr);
            recent.push({ 
                date: dateStr, 
                mood: log?.mood, 
                tags: log?.tags || [],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }
        return recent;
    };

    const getRecommendedAction = () => {
        const defaults = { label: 'Check In', view: AppView.Journal, icon: BookHeart, desc: 'Write down your thoughts', gradient: 'from-pink-500 to-rose-500' };

        if (!userProfile) return { ...defaults, label: 'Meditate', view: AppView.Meditation, icon: Waves, gradient: 'from-purple-500 to-indigo-500' };
        
        if (userProfile.goals.includes('anxiety') && breathingEnabled) return { label: 'Breathe', view: AppView.Breathing, icon: Wind, desc: 'Calm your nervous system', gradient: 'from-teal-400 to-emerald-500' };
        if (userProfile.goals.includes('sleep') && meditationEnabled) return { label: 'Sleep Aid', view: AppView.Meditation, icon: Waves, desc: 'Wind down for rest', gradient: 'from-indigo-900 to-slate-900' };
        if (userProfile.goals.includes('focus')) return { label: 'Focus Mode', view: AppView.Strategizer, icon: BrainCircuit, desc: 'Clear your mind', gradient: 'from-orange-400 to-amber-500' };
        
        return defaults;
    };

    const recommendation = getRecommendedAction();
    const todaysFocus = FOCUS_ACTIVITIES[Math.floor(Date.now() / 86400000) % FOCUS_ACTIVITIES.length];
    const recentMoods = getRecentMoods();
    const hasChartData = recentMoods.some(day => day.mood);

    // Chart logic
    const getChartY = (mood: number) => {
        return 90 - ((mood - 1) / 4) * 80;
    };

    const generateChartPath = () => {
        const points = recentMoods.map((day, index) => {
            if (!day.mood) return null;
            const x = (index / (recentMoods.length - 1)) * 100;
            const y = getChartY(day.mood);
            return `${x},${y}`;
        }).filter(p => p !== null);

        if (points.length < 2) return '';
        return `M ${points.join(' L ')}`;
    };

    const generateAreaPath = () => {
        const line = generateChartPath();
        if (!line) return '';
        const validIndices = recentMoods.map((d, i) => d.mood ? i : -1).filter(i => i !== -1);
        if (validIndices.length < 2) return '';
        
        const firstX = (validIndices[0] / (recentMoods.length - 1)) * 100;
        const lastX = (validIndices[validIndices.length - 1] / (recentMoods.length - 1)) * 100;

        return `${line} L ${lastX},100 L ${firstX},100 Z`;
    };

    // Prepare quick links
    const quickLinks = [
        { view: AppView.Journal, label: 'Journal', icon: BookHeart, gradient: 'bg-gradient-to-br from-pink-400 to-rose-500', enabled: true },
        { view: AppView.Soundscapes, label: 'Sonic Sanctuary', icon: Volume2, gradient: 'bg-gradient-to-br from-indigo-400 to-blue-500', enabled: true },
        { view: AppView.GratitudeJar, label: 'Gratitude Jar', icon: Heart, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500', enabled: true },
        { view: AppView.Breathing, label: 'Breathe', icon: Wind, gradient: 'bg-gradient-to-br from-teal-400 to-emerald-500', enabled: breathingEnabled },
        { view: AppView.Meditation, label: 'Meditate', icon: Waves, gradient: 'bg-gradient-to-br from-purple-400 to-violet-500', enabled: meditationEnabled },
        { view: AppView.Astrology, label: 'Horoscope', icon: Star, gradient: 'bg-gradient-to-br from-yellow-400 to-amber-500', enabled: astrologyEnabled },
    ].filter(link => link.enabled);

    return (
        <div className="space-y-8 pb-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center pr-2 gap-4">
                <div className="flex items-center gap-4">
                    <GreetingIcon />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 font-serif tracking-tight flex items-center gap-2">
                            {getGreeting()} 
                            {userProfile?.avatar && <span className="text-3xl animate-fade-in">{userProfile.avatar}</span>}
                        </h2>
                        <p className="text-slate-500 font-medium">Your personalized path to balance.</p>
                    </div>
                </div>
                <button onClick={() => setActiveView(AppView.Emergency)} className="bg-red-50 text-red-500 p-3 rounded-full hover:bg-red-100 transition-colors shadow-sm border border-red-100 group self-end md:self-auto" title="Emergency Plan">
                    <AlertOctagon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
            </header>
    
            {/* Top Grid: Configurable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quote Card */}
                {config.showQuote && (
                    <div className="md:col-span-2 relative rounded-3xl shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-center group glass-card border-none ring-1 ring-white/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90 transition-all duration-700 group-hover:scale-105"></div>
                        <div 
                            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1000&auto=format&fit=crop')` }}
                        />
                        
                        <div className="relative z-10 p-10 text-white">
                             <Quote className="w-10 h-10 text-white/40 mb-4" />
                            {isLoadingQuote ? (
                                <div className="space-y-3 max-w-lg">
                                    <div className="h-6 w-3/4 bg-white/20 animate-pulse rounded-full"></div>
                                    <div className="h-4 w-1/2 bg-white/20 animate-pulse rounded-full"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-2xl md:text-3xl font-serif leading-relaxed drop-shadow-sm font-medium">"{quote.text}"</p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-px w-8 bg-white/50"></div>
                                        <p className="font-semibold text-white/90 uppercase text-xs tracking-widest">{quote.author}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                 {/* Recommendation Card */}
                 <div 
                    className={`relative rounded-3xl p-8 flex flex-col justify-between cursor-pointer shadow-lg transition-all duration-300 group overflow-hidden bg-white border border-slate-100 hover:shadow-2xl hover:-translate-y-1 ${!config.showQuote ? 'md:col-span-1' : ''}`}
                    onClick={() => setActiveView(recommendation.view)}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${recommendation.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${recommendation.gradient} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <recommendation.icon className="w-6 h-6"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">Recommended</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{recommendation.desc || 'Based on your goals'}</p>
                    </div>

                    <div className="relative z-10 mt-8 flex items-center justify-between">
                         <span className="font-bold text-lg text-slate-800 group-hover:translate-x-1 transition-transform">{recommendation.label}</span>
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4"/>
                         </div>
                    </div>
                </div>

                {/* Optional Wellness Pulse (conditionally rendered) */}
                {config.showWellnessPulse && (
                    <div className="md:col-span-1">
                        <WellnessPulse moodLogged={hasLoggedToday} habitDone={habitCompleted} journaled={hasJournaledToday} />
                    </div>
                )}
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mood Tracker */}
                {config.showMoodChart && (
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><BarChart3 className="w-4 h-4"/></div>
                            Mood Trends
                        </h3>
                        <button onClick={() => setActiveView(AppView.MoodTracker)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 transition-colors">
                           Details
                        </button>
                    </div>
                    
                    {!hasLoggedToday && !showTagSelector && (
                        <div className="flex justify-between items-center mb-6 px-2">
                            {MOODS.map(mood => (
                                <button key={mood.level} onClick={() => handleMoodSelect(mood.level)} className="flex flex-col items-center group transition-transform hover:-translate-y-2">
                                    <span className="text-4xl filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-125">{mood.emoji}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!hasLoggedToday && showTagSelector && (
                        <div className="mb-6 animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-bold text-slate-700">What's impacting you?</p>
                                <button onClick={() => setShowTagSelector(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm"><X className="w-4 h-4"/></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {MOOD_TAGS.map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${selectedTags.includes(tag) ? 'bg-indigo-500 text-white border-indigo-500 shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <button onClick={saveMoodLog} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Log Mood
                            </button>
                        </div>
                    )}

                    {hasLoggedToday && (
                        <div className="mb-6 p-6 bg-green-50 text-green-700 rounded-2xl text-center flex flex-col items-center justify-center border border-green-100/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <CheckCircle2 className="w-10 h-10 mb-3 text-green-500 relative z-10"/>
                            <p className="font-bold text-lg relative z-10">Mood logged for today</p>
                            <p className="text-sm text-green-600/80 relative z-10">Great job checking in with yourself.</p>
                        </div>
                    )}
                    
                    {/* Chart Area */}
                    <div className="relative mt-auto h-48 w-full bg-white rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
                        {hasChartData ? (
                            <div className="absolute inset-0">
                                {/* SVG Chart */}
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Grid Lines */}
                                    {[1, 2, 3, 4, 5].map(level => {
                                        const y = getChartY(level);
                                        return <line key={level} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />;
                                    })}

                                    {/* Trend Line */}
                                    <path d={generateAreaPath()} fill="url(#chartGradient)" stroke="none" />
                                    <path d={generateChartPath()} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter="drop-shadow(0 2px 2px rgba(99, 102, 241, 0.3))" />
                                    
                                    {/* Dots */}
                                    {recentMoods.map((day, i) => {
                                        if (!day.mood) return null;
                                        const x = (i / (recentMoods.length - 1)) * 100;
                                        const y = getChartY(day.mood);
                                        return (
                                            <circle key={i} cx={x} cy={y} r="2" fill="white" stroke="#4f46e5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                                        )
                                    })}
                                </svg>

                                {/* Interaction Overlay */}
                                <div className="absolute inset-0 flex justify-between px-2">
                                    {recentMoods.map((day, i) => (
                                        <div 
                                            key={i} 
                                            className="relative flex-1 flex flex-col justify-end items-center cursor-pointer group pb-2"
                                            onMouseEnter={() => setHoveredDayIndex(i)}
                                            onMouseLeave={() => setHoveredDayIndex(null)}
                                        >
                                            {/* Axis Label */}
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{day.day[0]}</span>

                                            {/* Point Highlight */}
                                            {day.mood && (
                                                <>
                                                    <div 
                                                        className="absolute w-3 h-3 bg-indigo-600 rounded-full shadow-md z-10 transition-transform scale-0 group-hover:scale-100 origin-center"
                                                        style={{ bottom: `${100 - getChartY(day.mood)}%`, marginBottom: '16px', transform: 'translateX(-50%)' }} 
                                                    />
                                                    
                                                    {/* Tooltip */}
                                                    {hoveredDayIndex === i && (
                                                        <div className="absolute bottom-full mb-8 z-30 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl w-[120px] -translate-x-1/2 left-1/2 transform animate-fade-in border border-slate-700 pointer-events-none">
                                                            <p className="font-bold text-[10px] text-slate-400 mb-1">{day.fullDate}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{MOODS[day.mood - 1].emoji}</span>
                                                                <span className="font-bold">{MOODS[day.mood - 1].label}</span>
                                                            </div>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm italic bg-slate-50">
                                No mood data recorded yet
                            </div>
                        )}
                    </div>
                </div>
                )}

                <div className="flex flex-col gap-6 h-full">
                    {/* Today's Focus / Habit Tracker */}
                    {config.showHabitTracker && (
                    <div className={`p-6 rounded-3xl border flex items-start gap-5 transition-all duration-500 shadow-sm ${habitCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100' : 'bg-white border-white/50'}`}>
                        <div className={`p-4 rounded-2xl shadow-sm flex-shrink-0 transition-colors ${habitCompleted ? 'bg-white text-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                            {habitCompleted ? <CheckCircle2 className="w-6 h-6"/> : <ClipboardCheck className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-lg ${habitCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>Daily Micro-Habit</h3>
                                {habitStreak > 0 && (
                                    <div className="flex items-center text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 shadow-sm">
                                        <Flame className="w-3 h-3 mr-1 fill-orange-500 animate-pulse"/> {habitStreak} Day Streak
                                    </div>
                                )}
                            </div>
                            <p className={`text-sm mb-4 leading-relaxed ${habitCompleted ? 'text-emerald-700 line-through opacity-70' : 'text-slate-600'}`}>{todaysFocus}</p>
                            {!habitCompleted ? (
                                <button onClick={completeHabit} className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-md">
                                    Mark Complete
                                </button>
                            ) : (
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Completed! Keep it up!</p>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Quick Access Grid */}
                    {config.showQuickLinks && (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {quickLinks.slice(0, 4).map((link) => (
                            <div 
                                key={link.view} 
                                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center gap-3 hover:border-indigo-200 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1 hover:bg-slate-50/50" 
                                onClick={() => setActiveView(link.view)}
                            >
                                <div className={`w-12 h-12 rounded-2xl ${link.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <link.icon className="w-6 h-6"/>
                                </div>
                                <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{link.label}</span>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;