
import React, { useState, useEffect } from 'react';
import { MoodLog } from '../types';
import { MOODS, MOOD_TAGS } from '../constants';
import { Calendar, TrendingUp, BarChart3, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MoodTracker: React.FC = () => {
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayLog, setSelectedDayLog] = useState<MoodLog | null>(null);
    const [activeTab, setActiveTab] = useState<'calendar' | 'trends'>('calendar');
    
    // Logging Modal State
    const [isLogging, setIsLogging] = useState(false);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        const storedLogs = localStorage.getItem('moodLogs');
        if (storedLogs) {
            setMoodLogs(JSON.parse(storedLogs));
        }
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    const getLogForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return moodLogs.find(log => log.date === dateStr);
    };

    const getStats = () => {
        const currentMonthLogs = moodLogs.filter(log => {
            const d = new Date(log.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const total = currentMonthLogs.length;
        if (total === 0) return { avg: 0, bestTag: '-' };

        const avg = currentMonthLogs.reduce((acc, curr) => acc + curr.mood, 0) / total;
        
        const tagCounts: Record<string, number> = {};
        currentMonthLogs.forEach(log => {
            log.tags?.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
        });
        
        let bestTag = '-';
        let maxCount = 0;
        Object.entries(tagCounts).forEach(([t, count]) => {
            if (count > maxCount) { maxCount = count; bestTag = t; }
        });

        return { avg: avg.toFixed(1), bestTag, total };
    };

    const stats = getStats();

    // Logging Logic
    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const saveMoodLog = () => {
        if (selectedMood === null) return;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: MoodLog = { date: todayStr, mood: selectedMood, tags: selectedTags };
        
        // Update local state and localStorage
        const updatedLogs = moodLogs.filter(log => log.date !== todayStr).concat(newLog);
        setMoodLogs(updatedLogs);
        localStorage.setItem('moodLogs', JSON.stringify(updatedLogs));
        
        setIsLogging(false);
        setSelectedMood(null);
        setSelectedTags([]);
    };

    const hasLoggedToday = moodLogs.some(log => log.date === new Date().toISOString().split('T')[0]);

    // Chart Data Generation
    const getChartPoints = () => {
        const points = [];
        const today = new Date();
        const daysToShow = 14;
        
        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = moodLogs.find(l => l.date === dateStr);
            if (log) {
                // X coordinate: 0 to 100 based on index
                const x = (100 / (daysToShow - 1)) * (daysToShow - 1 - i);
                // Y coordinate: 100 (bottom) to 0 (top). Mood 1=90, Mood 5=10
                const y = 100 - ((log.mood - 1) / 4) * 90 - 5; 
                points.push(`${x},${y}`);
            }
        }
        return points.length > 1 ? points.join(' L ') : '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" /> Mood Analytics
                    </h2>
                    <p className="text-sm text-slate-500">Track your emotional well-being over time.</p>
                </div>
                {!hasLoggedToday && (
                    <button 
                        onClick={() => setIsLogging(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                    >
                        Log Today
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-slate-100">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Avg Mood</p>
                    <p className="text-2xl font-bold text-indigo-700">{stats.avg} <span className="text-sm font-medium text-indigo-400">/ 5</span></p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 text-center">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">Total Logs</p>
                    <p className="text-2xl font-bold text-pink-700">{stats.total}</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 text-center">
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Top Tag</p>
                    <p className="text-xl font-bold text-teal-700 truncate px-2">{stats.bestTag}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-2">
                <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Calendar className="w-4 h-4 inline mr-2"/>Calendar
                </button>
                <button 
                    onClick={() => setActiveTab('trends')}
                    className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'trends' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2"/>Trends
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {activeTab === 'calendar' ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
                            <h3 className="text-xl font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</h3>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2 text-center mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-xs font-bold text-slate-400 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const log = getLogForDay(day);
                                const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                                
                                return (
                                    <div 
                                        key={day}
                                        onClick={() => log && setSelectedDayLog(log)}
                                        className={`
                                            aspect-square rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-105
                                            ${log ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-60'}
                                            ${isToday ? 'ring-2 ring-indigo-500' : ''}
                                        `}
                                    >
                                        <span className={`absolute top-1 left-2 text-[10px] font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                                        {log ? (
                                            <>
                                                <div className="text-2xl">{MOODS[log.mood - 1].emoji}</div>
                                                <div className={`w-full h-1.5 absolute bottom-0 rounded-b-xl ${MOODS[log.mood - 1].color}`}></div>
                                            </>
                                        ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <h3 className="text-lg font-bold text-slate-800 mb-6">Last 14 Days Trend</h3>
                             <div className="h-64 w-full relative">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                     {/* Grid */}
                                     {[1, 2, 3, 4, 5].map(level => {
                                         const y = 100 - ((level - 1) / 4) * 90 - 5;
                                         return (
                                             <g key={level}>
                                                <line x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                                                <text x="-2" y={y + 1} textAnchor="end" className="text-[3px] fill-slate-400" style={{ fontSize: '3px' }}>{MOODS[level-1].label}</text>
                                             </g>
                                         );
                                     })}
                                     
                                     {/* Line */}
                                     <path d={`M ${getChartPoints()}`} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                     
                                     {/* Points */}
                                     {Array.from({length: 14}).map((_, i) => {
                                         const d = new Date();
                                         d.setDate(d.getDate() - (13 - i));
                                         const dateStr = d.toISOString().split('T')[0];
                                         const log = moodLogs.find(l => l.date === dateStr);
                                         if (!log) return null;
                                         
                                         const x = (100 / 13) * i;
                                         const y = 100 - ((log.mood - 1) / 4) * 90 - 5;
                                         
                                         return (
                                             <circle key={i} cx={x} cy={y} r="1.5" className="fill-white stroke-indigo-600" strokeWidth="0.5" />
                                         )
                                     })}
                                </svg>
                             </div>
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Logs</h3>
                            <div className="space-y-3">
                                {moodLogs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(log => (
                                    <div key={log.date} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-slate-50`}>
                                                {MOODS[log.mood - 1].emoji}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-xs text-slate-500 font-bold">{MOODS[log.mood - 1].label}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {log.tags?.map(t => (
                                                <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Day Log Modal */}
            {selectedDayLog && (
                <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedDayLog(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{new Date(selectedDayLog.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</h3>
                            </div>
                            <button onClick={() => setSelectedDayLog(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                        </div>
                        
                        <div className="flex flex-col items-center mb-8">
                             <span className="text-6xl mb-4">{MOODS[selectedDayLog.mood - 1].emoji}</span>
                             <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${MOODS[selectedDayLog.mood - 1].color} bg-opacity-20 text-slate-800`}>
                                {MOODS[selectedDayLog.mood - 1].label}
                             </span>
                        </div>

                        {selectedDayLog.tags && selectedDayLog.tags.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Impact Factors</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDayLog.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logging Modal */}
            {isLogging && (
                <div className="absolute inset-0 z-40 bg-white flex flex-col animate-fade-in">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-800">Log Mood for Today</h3>
                        <button onClick={() => setIsLogging(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-500"/></button>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
                        {!selectedMood ? (
                            <div className="w-full max-w-md">
                                <p className="text-center text-slate-600 mb-8 text-lg">How are you feeling?</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {MOODS.map(mood => (
                                        <button 
                                            key={mood.level} 
                                            onClick={() => setSelectedMood(mood.level)}
                                            className="flex flex-col items-center p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <span className="text-4xl mb-2 transform group-hover:scale-110 transition-transform">{mood.emoji}</span>
                                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">{mood.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-md animate-fade-in">
                                <div className="flex items-center gap-4 mb-8 justify-center">
                                    <span className="text-5xl">{MOODS[selectedMood - 1].emoji}</span>
                                    <div>
                                        <p className="font-bold text-slate-800 text-xl">{MOODS[selectedMood - 1].label}</p>
                                        <button onClick={() => setSelectedMood(null)} className="text-sm text-indigo-600 hover:underline">Change</button>
                                    </div>
                                </div>

                                <p className="text-slate-600 font-semibold mb-3">What's affecting your mood?</p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {MOOD_TAGS.map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedTags.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={saveMoodLog}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Save Log
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoodTracker;
