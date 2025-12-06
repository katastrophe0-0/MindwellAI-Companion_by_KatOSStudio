
import React, { useState, useEffect } from 'react';
import type { QuizQuestion, QuizResult, QuizLog } from '../types';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, ASRS_QUESTIONS, ISI_QUESTIONS, PTSD_QUESTIONS, MDQ_QUESTIONS, MSI_BPD_QUESTIONS, OCI_R_QUESTIONS } from '../constants';
import { CheckCircle, AlertTriangle, Zap, Moon, ShieldAlert, Activity, HeartCrack, Repeat, History, BarChart3, ChevronDown, Calendar, TrendingUp, TrendingDown, Minus, CloudRain, Wind, FileText, X, ArrowLeft } from 'lucide-react';

const getPhq9Result = (score: number): QuizResult => {
  if (score <= 4) return { score, level: 'Minimal depression', interpretation: 'Your score suggests you may be experiencing minimal or no symptoms of depression. Continue monitoring your mood.' };
  if (score <= 9) return { score, level: 'Mild depression', interpretation: 'Your score suggests you may be experiencing mild symptoms of depression. It could be helpful to talk to a friend, family member, or professional.' };
  if (score <= 14) return { score, level: 'Moderate depression', interpretation: 'Your score suggests you may be experiencing moderate symptoms of depression. Seeking professional consultation is recommended.' };
  if (score <= 19) return { score, level: 'Moderately severe depression', interpretation: 'Your score suggests you may be experiencing moderately severe symptoms of depression. It is highly recommended to seek professional help.' };
  return { score, level: 'Severe depression', interpretation: 'Your score suggests you may be experiencing severe symptoms of depression. Please seek professional help immediately.' };
};

const getGad7Result = (score: number): QuizResult => {
    if (score <= 4) return { score, level: 'Minimal anxiety', interpretation: 'Your score suggests you are experiencing minimal to no anxiety.' };
    if (score <= 9) return { score, level: 'Mild anxiety', interpretation: 'Your score suggests you may be experiencing mild anxiety. Consider mindfulness techniques or talking to someone you trust.' };
    if (score <= 14) return { score, level: 'Moderate anxiety', interpretation: 'Your score suggests you may be experiencing moderate anxiety. Professional consultation could be beneficial.' };
    return { score, level: 'Severe anxiety', interpretation: 'Your score suggests you may be experiencing severe anxiety. It is highly recommended to seek professional help.' };
};

const getAsrsResult = (score: number): QuizResult => {
    if (score <= 9) return { score, level: 'Unlikely ADHD', interpretation: 'Your symptoms are not consistent with ADHD. However, if you have concerns, consult a professional.' };
    if (score <= 13) return { score, level: 'Possible ADHD', interpretation: 'You have some symptoms that may be consistent with ADHD. It might be worth discussing with a healthcare provider.' };
    return { score, level: 'Likely ADHD', interpretation: 'Your score suggests symptoms highly consistent with ADHD. We recommend seeking a professional evaluation.' };
};

const getIsiResult = (score: number): QuizResult => {
    if (score <= 7) return { score, level: 'No significant insomnia', interpretation: 'Your sleep patterns appear healthy.' };
    if (score <= 14) return { score, level: 'Subthreshold insomnia', interpretation: 'You may be experiencing some mild sleep difficulties.' };
    if (score <= 21) return { score, level: 'Clinical insomnia (Moderate)', interpretation: 'Your score suggests moderate insomnia. Consider sleep hygiene practices or professional advice.' };
    return { score, level: 'Clinical insomnia (Severe)', interpretation: 'Your score suggests severe insomnia. It is highly recommended to consult a sleep specialist.' };
};

const getPtsdResult = (score: number): QuizResult => {
    if (score < 3) return { score, level: 'Negative Screen', interpretation: 'Your responses do not currently suggest PTSD. However, if you are distressed by past events, support is available.' };
    return { score, level: 'Positive Screen', interpretation: 'Your score suggests you may be experiencing symptoms of PTSD. Please consult a mental health professional for a full assessment.' };
};

const getMdqResult = (score: number): QuizResult => {
    if (score >= 7) return { score, level: 'Positive Screen', interpretation: 'You answered "Yes" to 7 or more items. If these symptoms happened during the same time period and caused problems, this suggests a likelihood of Bipolar Disorder. Please consult a psychiatrist for a full evaluation.' };
    return { score, level: 'Negative Screen', interpretation: 'Your responses do not suggest Bipolar Disorder at this time. However, if you are concerned about your mood swings, please consult a professional.' };
};

const getMsiBpdResult = (score: number): QuizResult => {
    if (score >= 7) return { score, level: 'Positive Screen', interpretation: 'Your score suggests a likelihood of Borderline Personality Disorder (BPD). It is recommended to speak with a mental health professional for a comprehensive assessment.' };
    return { score, level: 'Negative Screen', interpretation: 'Your responses do not currently suggest Borderline Personality Disorder. If you struggle with emotional regulation, therapy can still be very beneficial.' };
};

const getOciRResult = (score: number): QuizResult => {
    if (score >= 21) return { score, level: 'Likely OCD', interpretation: 'Your score suggests the presence of Obsessive-Compulsive Disorder (OCD) symptoms. It is recommended to seek a professional evaluation for diagnosis and treatment.' };
    return { score, level: 'Unlikely OCD', interpretation: 'Your score does not suggest significant OCD symptoms. However, if you have specific obsessions or compulsions that bother you, a professional can help.' };
};

interface QuizProps {
    quizId: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    getResult: (score: number) => QuizResult;
    onSave: (log: QuizLog) => void;
    onCancel: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quizId, title, description, questions, getResult, onSave, onCancel }) => {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleOptionChange = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const totalScore = answers.reduce((acc, val) => acc + (val > -1 ? val : 0), 0);
    const calculatedResult = getResult(totalScore);
    
    const maxScore = questions.reduce((acc, q) => acc + Math.max(...q.values), 0);

    const log: QuizLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        quizId,
        quizLabel: title,
        score: totalScore,
        maxScore,
        level: calculatedResult.level
    };

    setResult(calculatedResult);
    onSave(log);
  };

  const resetQuiz = () => {
      setAnswers(Array(questions.length).fill(-1));
      setResult(null);
  }

  const allAnswered = answers.every(a => a !== -1);

  if (result) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in border border-slate-200">
            <button onClick={onCancel} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Assessments
            </button>
            <div className="text-center mb-8">
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">{title} Result</h3>
                 <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                     {new Date().toLocaleDateString()}
                 </div>
            </div>

            <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl mb-6 border border-indigo-100 shadow-inner">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Score</p>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold text-indigo-600">{result.score}</span>
                </div>
                <p className="text-xl font-bold text-indigo-800 mt-2">{result.level}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500"/> Interpretation</h4>
                <p className="text-slate-600 leading-relaxed">{result.interpretation}</p>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl mb-6 text-sm border border-green-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Result saved to your history.</span>
            </div>

            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                    Done
                </button>
                <button onClick={resetQuiz} className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    Retake Quiz
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600"/>
        </button>
        <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      
      <div className="space-y-8 flex-1 overflow-y-auto pr-2 pb-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="animate-fade-in" style={{ animationDelay: `${qIndex * 0.05}s` }}>
            <p className="font-semibold text-slate-800 mb-3 text-lg">{qIndex + 1}. {q.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((option, oIndex) => (
                <label key={oIndex} className={`flex items-center space-x-3 cursor-pointer p-4 border rounded-xl transition-all ${answers[qIndex] === q.values[oIndex] ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[qIndex] === q.values[oIndex] ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {answers[qIndex] === q.values[oIndex] && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                  </div>
                  <span className={answers[qIndex] === q.values[oIndex] ? 'text-indigo-900 font-medium' : 'text-slate-600'}>{option}</span>
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === q.values[oIndex]}
                    onChange={() => handleOptionChange(qIndex, q.values[oIndex])}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-slate-100 mt-auto bg-white">
        <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01]"
        >
            Calculate Results
        </button>
      </div>
    </div>
  );
};


const Quizzes: React.FC = () => {
    const [view, setView] = useState<'assessments' | 'history' | 'active'>('assessments');
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [historyLogs, setHistoryLogs] = useState<QuizLog[]>([]);
    
    // Filter States
    const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
    
    // Interaction States
    const [hoveredPoint, setHoveredPoint] = useState<{id: number, x: number, y: number} | null>(null);

    useEffect(() => {
        const storedLogs = localStorage.getItem('quizHistory');
        if (storedLogs) {
            setHistoryLogs(JSON.parse(storedLogs));
        }
    }, []);

    const handleSaveLog = (log: QuizLog) => {
        const updatedLogs = [log, ...historyLogs];
        setHistoryLogs(updatedLogs);
        localStorage.setItem('quizHistory', JSON.stringify(updatedLogs));
    };
    
    const quizzes = [
        { 
            id: 'phq9', 
            label: 'Depression', 
            fullLabel: 'Depression (PHQ-9)', 
            icon: CloudRain,
            color: 'bg-blue-500',
            description: "A standard tool to monitor the severity of depression symptoms over the last 2 weeks.",
            questions: PHQ9_QUESTIONS,
            getResult: getPhq9Result
        },
        { 
            id: 'gad7', 
            label: 'Anxiety', 
            fullLabel: 'Anxiety (GAD-7)', 
            icon: Wind,
            color: 'bg-teal-500',
            description: "A screening tool for Generalized Anxiety Disorder and symptom severity.",
            questions: GAD7_QUESTIONS,
            getResult: getGad7Result
        },
        { 
            id: 'mdq', 
            label: 'Bipolar', 
            fullLabel: 'Bipolar (MDQ)', 
            icon: Activity,
            color: 'bg-orange-500',
            description: "Screens for Bipolar Spectrum Disorder symptoms and history.",
            questions: MDQ_QUESTIONS,
            getResult: getMdqResult
        },
        { 
            id: 'msi_bpd', 
            label: 'BPD', 
            fullLabel: 'Borderline Personality (MSI-BPD)', 
            icon: HeartCrack,
            color: 'bg-pink-500',
            description: "Screens for traits associated with Borderline Personality Disorder.",
            questions: MSI_BPD_QUESTIONS,
            getResult: getMsiBpdResult
        },
        { 
            id: 'oci_r', 
            label: 'OCD', 
            fullLabel: 'OCD (OCI-R)', 
            icon: Repeat,
            color: 'bg-purple-500',
            description: "Assesses symptoms of Obsessive-Compulsive Disorder.",
            questions: OCI_R_QUESTIONS,
            getResult: getOciRResult
        },
        { 
            id: 'asrs', 
            label: 'ADHD', 
            fullLabel: 'ADHD (ASRS-v1.1)', 
            icon: Zap,
            color: 'bg-yellow-500',
            description: "Screens for adult ADHD symptoms.",
            questions: ASRS_QUESTIONS,
            getResult: getAsrsResult
        },
        { 
            id: 'isi', 
            label: 'Sleep', 
            fullLabel: 'Insomnia (ISI)', 
            icon: Moon,
            color: 'bg-indigo-500',
            description: "Measures the nature, severity, and impact of insomnia.",
            questions: ISI_QUESTIONS,
            getResult: getIsiResult
        },
        { 
            id: 'ptsd', 
            label: 'PTSD', 
            fullLabel: 'PTSD (PC-PTSD-5)', 
            icon: ShieldAlert,
            color: 'bg-red-500',
            description: "Screens for Post-Traumatic Stress Disorder symptoms.",
            questions: PTSD_QUESTIONS,
            getResult: getPtsdResult
        },
    ] as const;

    const startQuiz = (id: string) => {
        setActiveQuizId(id);
        setView('active');
    };

    // Filter Logic
    const filteredLogs = historyLogs.filter(log => {
        // Filter by Type
        if (selectedHistoryFilter !== 'all' && log.quizId !== selectedHistoryFilter) return false;
        
        // Filter by Date
        const logDate = new Date(log.date).getTime();
        if (dateRange.start) {
            const start = new Date(dateRange.start).getTime();
            if (logDate < start) return false;
        }
        if (dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            if (logDate > end.getTime()) return false;
        }

        return true;
    });

    // Chart Data Helper
    const getChartData = (quizId: string) => {
        const targetId = quizId === 'all' ? 'phq9' : quizId;
        
        const logs = historyLogs
            .filter(l => l.quizId === targetId)
            .filter(l => {
                const d = new Date(l.date).getTime();
                if (dateRange.start && d < new Date(dateRange.start).getTime()) return false;
                if (dateRange.end) {
                    const e = new Date(dateRange.end);
                    e.setHours(23,59,59);
                    if (d > e.getTime()) return false;
                }
                return true;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (logs.length === 0) return null;
        
        // Slice last 10 if no date range specified to keep chart readable
        const displayLogs = (dateRange.start || dateRange.end) ? logs : logs.slice(-10);
        if (displayLogs.length === 0) return null;
        
        const maxScore = displayLogs[0].maxScore || 27; // Fallback

        // Points for SVG Polyline
        const points = displayLogs.map((log, index) => {
            const x = displayLogs.length === 1 ? 50 : (index / (displayLogs.length - 1)) * 100;
            const y = 100 - (log.score / maxScore) * 80 - 10; // Padding
            return `${x},${y}`;
        }).join(' ');

        // Area Path
        const areaPath = displayLogs.length === 1 
            ? `50,${100 - (displayLogs[0].score / maxScore) * 80 - 10} 50,100` // Vertical line for single point
            : `M ${points} L 100,100 L 0,100 Z`.replace(/,/g, ' '); // simple close for SVG path

        // Polyline points format: "x,y x,y"
        const linePoints = points.split(' ').join(' ');

        return { points: linePoints, areaPath, logs: displayLogs, maxScore, quizLabel: quizzes.find(q=>q.id===targetId)?.label || targetId };
    }

    const calculateTrend = (logs: QuizLog[]) => {
        if (logs.length < 2) return null;
        const recent = logs.slice(-3); 
        const first = recent[0].score;
        const last = recent[recent.length-1].score;
        const diff = last - first;
        
        if (diff < 0) return { direction: 'improving', text: 'Improving', sub: 'Scores are trending down.', icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50' };
        if (diff > 0) return { direction: 'worsening', text: 'Increasing', sub: 'Scores are trending up.', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' };
        return { direction: 'stable', text: 'Stable', sub: 'Scores are consistent.', icon: Minus, color: 'text-blue-600', bg: 'bg-blue-50' };
    }

    // Determine what to show on chart
    const chartQuizId = selectedHistoryFilter === 'all' ? 'phq9' : selectedHistoryFilter;
    const chartData = getChartData(chartQuizId);
    const trend = chartData ? calculateTrend(chartData.logs) : null;
    const activeQuizInfo = quizzes.find(q => q.id === activeQuizId);

    if (view === 'active' && activeQuizInfo) {
        return (
            <Quiz 
                quizId={activeQuizInfo.id}
                title={activeQuizInfo.fullLabel}
                description={activeQuizInfo.description}
                questions={activeQuizInfo.questions}
                getResult={activeQuizInfo.getResult}
                onSave={handleSaveLog}
                onCancel={() => setView('assessments')}
            />
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden animate-fade-in">
            {/* Header with Tabs */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-indigo-500" /> Mental Health Screenings
                    </h2>
                    <p className="text-sm text-slate-500">Clinically-validated tools to check your well-being.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 self-start md:self-auto">
                    <button 
                        onClick={() => setView('assessments')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${view === 'assessments' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Assessments
                    </button>
                    <button 
                        onClick={() => setView('history')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${view === 'history' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        History & Trends
                    </button>
                </div>
            </div>

            {view === 'assessments' ? (
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quizzes.map(quiz => (
                            <button 
                                key={quiz.id}
                                onClick={() => startQuiz(quiz.id)}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all text-left flex flex-col h-full group"
                            >
                                <div className={`w-12 h-12 rounded-xl ${quiz.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                    <quiz.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-700">{quiz.label}</h3>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{quiz.fullLabel}</p>
                                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{quiz.description}</p>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3 text-sm text-yellow-800">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p><strong>Note:</strong> These assessments are for educational and screening purposes only. They are not a diagnostic tool and do not replace professional medical advice.</p>
                    </div>
                </div>
            ) : (
                /* HISTORY VIEW */
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assessment Type</label>
                            <div className="relative">
                                <select 
                                    value={selectedHistoryFilter}
                                    onChange={(e) => setSelectedHistoryFilter(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="all">All Assessments</option>
                                    {quizzes.map(q => <option key={q.id} value={q.id}>{q.fullLabel}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none"/>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                             <div className="relative">
                                <input 
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none"/>
                             </div>
                        </div>
                        <div className="flex-1 w-full">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                             <div className="relative">
                                <input 
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none"/>
                             </div>
                        </div>
                        <button 
                            onClick={() => { setSelectedHistoryFilter('all'); setDateRange({start:'', end:''}); }}
                            className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm whitespace-nowrap"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Charts & Trends */}
                    {chartData ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                                            {chartData.quizLabel} Trends
                                        </h3>
                                        <p className="text-xs text-slate-400 uppercase font-bold mt-1">
                                            {dateRange.start ? 'Custom Range' : 'Last 10 Entries'}
                                        </p>
                                    </div>
                                    {trend && (
                                        <div className={`px-4 py-2 rounded-lg ${trend.bg} flex items-center gap-3`}>
                                            <div className={`p-1.5 bg-white rounded-full shadow-sm`}>
                                                <trend.icon className={`w-4 h-4 ${trend.color}`} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${trend.color}`}>{trend.text}</p>
                                                <p className="text-[10px] text-slate-500">{trend.sub}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="h-64 w-full relative">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Grid Lines */}
                                        {[0, 25, 50, 75, 100].map(y => (
                                            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                                        ))}

                                        {/* Chart Area */}
                                        <path d={chartData.areaPath} fill="url(#chartGradient)" stroke="none" />
                                        
                                        {/* Chart Line */}
                                        {chartData.logs.length > 1 && (
                                            <polyline 
                                                points={chartData.points.replace(/,/g, ' ')} 
                                                fill="none" 
                                                stroke="#6366f1" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                vectorEffect="non-scaling-stroke"
                                            />
                                        )}
                                        
                                        {/* Data Points */}
                                        {chartData.logs.map((log, i) => {
                                            const x = chartData.logs.length === 1 ? 50 : (i / (chartData.logs.length - 1)) * 100;
                                            const y = 100 - (log.score / chartData.maxScore) * 80 - 10;
                                            return (
                                                <circle 
                                                    key={i} 
                                                    cx={x} 
                                                    cy={y} 
                                                    r="2" 
                                                    className="fill-white stroke-indigo-600 hover:scale-150 transition-transform cursor-pointer hover:stroke-[1px]" 
                                                    strokeWidth="0.5"
                                                    onMouseEnter={() => setHoveredPoint({ id: log.id, x, y })}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                />
                                            )
                                        })}
                                    </svg>
                                    
                                    {/* Tooltip */}
                                    {hoveredPoint && (() => {
                                        const log = chartData.logs.find(l => l.id === hoveredPoint.id);
                                        if (!log) return null;
                                        
                                        return (
                                            <div 
                                                className="absolute z-20 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity duration-200"
                                                style={{ 
                                                    left: `${hoveredPoint.x}%`, 
                                                    top: `${hoveredPoint.y}%`,
                                                    marginTop: '-12px' 
                                                }}
                                            >
                                                <div className="font-bold mb-1">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-indigo-300 font-bold text-lg">{log.score}</span>
                                                    <span className="text-slate-400 text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">{log.level}</span>
                                                </div>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-800"></div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                            
                            {/* Key Stats */}
                            <div className="space-y-4">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Latest Score</p>
                                    <p className="text-3xl font-bold text-slate-800">{chartData.logs[chartData.logs.length-1].score}</p>
                                    <p className="text-sm font-medium text-indigo-600 mt-1">{chartData.logs[chartData.logs.length-1].level}</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entries (Range)</p>
                                    <p className="text-3xl font-bold text-slate-800">{chartData.logs.length}</p>
                                </div>
                                <div className="bg-indigo-600 p-5 rounded-xl shadow-md text-white">
                                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Check-in</p>
                                    <p className="font-medium text-sm">Consistent tracking helps identify patterns. Great job logging!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center mb-8">
                            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
                            <p className="text-slate-500 font-medium">No chart data available for the selected filter.</p>
                            <p className="text-sm text-slate-400">Try selecting a specific assessment type or logging more results.</p>
                        </div>
                    )}

                    {/* Detailed Log List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                             <History className="w-5 h-5 text-indigo-500"/> Detailed Logs
                        </div>
                        {filteredLogs.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${quizzes.find(q=>q.id===log.quizId)?.color || 'bg-slate-400'}`}></span>
                                                <p className="font-bold text-slate-800">{log.quizLabel}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right">
                                                <p className="font-bold text-indigo-700 text-lg">{log.score}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                                            </div>
                                            <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 max-w-[140px] truncate">
                                                {log.level}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 italic">
                                No logs found matching your filters.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quizzes;
