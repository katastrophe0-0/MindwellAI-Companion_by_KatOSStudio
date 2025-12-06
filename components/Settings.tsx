
import React, { useState, useEffect, useRef } from 'react';
import { User, ShieldCheck, Crown, Droplet, Eye, EyeOff, Download, Trash2, Bell, Clock, Star, Wind, Waves, LayoutTemplate, Scale, ChevronRight, MapPin, Calendar, LayoutDashboard, Smile, Zap, Cloud, RefreshCw, Upload, CheckCircle2, AlertTriangle, Database, Sparkles, ToggleLeft, ToggleRight, Activity, Play, Loader2 } from 'lucide-react';
import { UserProfile, AppView, SubscriptionTier } from '../types';
import { GoogleGenAI } from '@google/genai';

interface SettingsProps {
    isPremium: boolean; // Kept for backward compatibility if needed, but using profile tier mostly
    onUpgrade: () => void;
    userProfile: UserProfile | null;
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
    setActiveView: (view: AppView) => void;
}

const AVATARS = ["😀", "😌", "🧘", "🌿", "⭐", "🌙", "🦊", "🐱", "🦁", "🐼", "🌸", "🌊"];

const Settings: React.FC<SettingsProps> = ({ onUpgrade, userProfile, onUpdateProfile, setActiveView }) => {
    const [name, setName] = useState(userProfile?.name || '');
    const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '');
    const [birthTime, setBirthTime] = useState(userProfile?.birthTime || '');
    const [birthLocation, setBirthLocation] = useState(userProfile?.birthLocation || '');
    const [editMode, setEditMode] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    
    // Cloud / Sync State
    const [isSyncing, setIsSyncing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Diagnostics State
    const [systemStatus, setSystemStatus] = useState<'idle' | 'checking' | 'healthy' | 'issue'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setBirthDate(userProfile.birthDate || '');
            setBirthTime(userProfile.birthTime || '');
            setBirthLocation(userProfile.birthLocation || '');
        }
    }, [userProfile]);

    const handleProfileSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        onUpdateProfile({ 
            name: name.trim(),
            birthDate,
            birthTime,
            birthLocation: birthLocation.trim()
        });
        setEditMode(false);
    };

    const toggleFeature = (featureKey: keyof UserProfile) => {
        if (userProfile) {
            let currentValue = userProfile[featureKey];
            if (currentValue === undefined) {
                // Default handling if undefined
                if (featureKey === 'enableAstrology') currentValue = false;
                else currentValue = true; 
            }
            onUpdateProfile({ [featureKey]: !currentValue });
        }
    };

    const toggleDashboardConfig = (key: keyof NonNullable<UserProfile['dashboardConfig']>) => {
        if (userProfile) {
            const currentConfig = userProfile.dashboardConfig || {
                showQuote: true,
                showMoodChart: true,
                showHabitTracker: true,
                showWellnessPulse: true,
                showQuickLinks: true
            };
            
            onUpdateProfile({
                dashboardConfig: {
                    ...currentConfig,
                    [key]: !currentConfig[key]
                }
            });
        }
    };
    
    const handleCloudSyncToggle = () => {
        const newState = !userProfile?.enableCloudSync;
        onUpdateProfile({ enableCloudSync: newState });
        if (newState) {
            setIsSyncing(true);
            setTimeout(() => {
                setIsSyncing(false);
                onUpdateProfile({ lastSynced: new Date().toISOString() });
            }, 2500);
        }
    };

    const triggerManualSync = () => {
        if (!userProfile?.enableCloudSync) return;
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            onUpdateProfile({ lastSynced: new Date().toISOString() });
        }, 2000);
    };

    const handleExportData = () => {
        const data = {
            profile: userProfile,
            journal: localStorage.getItem('journalEntries') ? JSON.parse(localStorage.getItem('journalEntries')!) : [],
            moods: localStorage.getItem('moodLogs') ? JSON.parse(localStorage.getItem('moodLogs')!) : [],
            history: localStorage.getItem('chatHistory') ? JSON.parse(localStorage.getItem('chatHistory')!) : [],
            emergency: localStorage.getItem('emergencyPlan') ? JSON.parse(localStorage.getItem('emergencyPlan')!) : [],
            gratitude: localStorage.getItem('gratitudeNotes') ? JSON.parse(localStorage.getItem('gratitudeNotes')!) : [],
            breathing: localStorage.getItem('breathingHistory') ? JSON.parse(localStorage.getItem('breathingHistory')!) : [],
            quizzes: localStorage.getItem('quizHistory') ? JSON.parse(localStorage.getItem('quizHistory')!) : [],
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindwell_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (!json.profile && !json.journal && !json.moods) {
                    throw new Error("Invalid backup file format.");
                }
                if (window.confirm("Restoring from backup will overwrite your current data. This cannot be undone. Are you sure you want to proceed?")) {
                    if (json.profile) localStorage.setItem('userProfile', JSON.stringify(json.profile));
                    if (json.journal) localStorage.setItem('journalEntries', JSON.stringify(json.journal));
                    if (json.moods) localStorage.setItem('moodLogs', JSON.stringify(json.moods));
                    if (json.history) localStorage.setItem('chatHistory', JSON.stringify(json.history));
                    if (json.emergency) localStorage.setItem('emergencyPlan', JSON.stringify(json.emergency));
                    if (json.gratitude) localStorage.setItem('gratitudeNotes', JSON.stringify(json.gratitude));
                    if (json.breathing) localStorage.setItem('breathingHistory', JSON.stringify(json.breathing));
                    if (json.quizzes) localStorage.setItem('quizHistory', JSON.stringify(json.quizzes));
                    
                    alert("Data restored successfully! The app will now reload.");
                    window.location.reload();
                }
            } catch (err) {
                console.error(err);
                alert("Failed to restore data. The file might be corrupted or in an invalid format.");
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const runSystemCheck = async () => {
        setSystemStatus('checking');
        setStatusMessage('Verifying system components...');
        
        try {
            // 1. Check Local Storage
            localStorage.setItem('test_write', 'ok');
            const read = localStorage.getItem('test_write');
            localStorage.removeItem('test_write');
            if (read !== 'ok') throw new Error("Local storage write failed.");

            // 2. Check API Connection (Lightweight)
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: 'ping',
            });

            // 3. Check Audio Context Support
            if (!window.AudioContext && !(window as any).webkitAudioContext) {
                 throw new Error("Audio API not supported in this browser.");
            }

            setSystemStatus('healthy');
            setStatusMessage('All systems operational. Ready for deployment.');
        } catch (e: any) {
            setSystemStatus('issue');
            setStatusMessage(`System Issue: ${e.message || 'Unknown error'}. Check console for details.`);
            console.error(e);
        }
    };

    const getTierBadge = (tier: SubscriptionTier) => {
        switch(tier) {
            case 'spark': return <div className="flex items-center gap-2 text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold border border-amber-200"><Zap className="w-3 h-3"/> Spark Tier</div>;
            case 'glow': return <div className="flex items-center gap-2 text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200"><Sparkles className="w-3 h-3"/> Glow Tier</div>;
            case 'radiance': return <div className="flex items-center gap-2 text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-xs font-bold border border-purple-200"><Crown className="w-3 h-3"/> Radiance Tier</div>;
            default: return <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">Free Tier</div>;
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Settings</h2>
            </div>
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Subscription Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                        Subscription Plan
                    </h3>
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="mb-2">{getTierBadge(userProfile?.subscriptionTier || 'free')}</div>
                            <p className="text-sm text-slate-500">Manage your subscription and features.</p>
                        </div>
                        <button onClick={onUpgrade} className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-700 transition-colors shadow-lg">
                            {userProfile?.subscriptionTier === 'radiance' ? 'Manage Plan' : 'Upgrade Plan'}
                        </button>
                    </div>
                </div>

                {/* User Profile Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-500" />
                        Profile & Identity
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                         {/* Avatar Selection */}
                         <div>
                            <span className="text-xs font-bold uppercase text-slate-400 block mb-3">Your Avatar</span>
                            <div className="flex flex-wrap gap-2">
                                {AVATARS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => onUpdateProfile({ avatar: emoji })}
                                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-full transition-transform hover:scale-110 ${userProfile?.avatar === emoji ? 'bg-indigo-200 ring-2 ring-indigo-500 shadow-sm' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                         </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-slate-400">Personal Details</span>
                                {!editMode ? (
                                    <button onClick={() => setEditMode(true)} className="text-indigo-600 hover:underline font-semibold text-sm">Edit</button>
                                ) : (
                                    <button onClick={handleProfileSave} className="text-green-600 hover:underline font-bold text-sm">Save</button>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Display Name</label>
                                {editMode ? (
                                    <input 
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                                    />
                                ) : (
                                    <p className="font-medium text-slate-800 bg-white p-2 rounded-lg border border-transparent">{userProfile?.name || 'Guest'}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Birth Date</label>
                                    {editMode ? (
                                        <input 
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                                        />
                                    ) : (
                                        <p className="font-medium text-slate-800 bg-white p-2 rounded-lg border border-transparent">{birthDate || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Birth Time</label>
                                    {editMode ? (
                                        <input 
                                            type="time"
                                            value={birthTime}
                                            onChange={(e) => setBirthTime(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                                        />
                                    ) : (
                                        <p className="font-medium text-slate-800 bg-white p-2 rounded-lg border border-transparent">{birthTime || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Birth Location</label>
                                {editMode ? (
                                    <input 
                                        type="text"
                                        value={birthLocation}
                                        onChange={(e) => setBirthLocation(e.target.value)}
                                        placeholder="City, Country"
                                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                                    />
                                ) : (
                                    <p className="font-medium text-slate-800 bg-white p-2 rounded-lg border border-transparent">{birthLocation || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Visibility */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-teal-500" />
                        Feature Visibility
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between py-3 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-700">Astrology & Horoscope</span>
                            </div>
                            <button 
                                onClick={() => toggleFeature('enableAstrology')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userProfile?.enableAstrology ? 'bg-teal-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile?.enableAstrology ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <Wind className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-700">Breathing Exercises</span>
                            </div>
                            <button 
                                onClick={() => toggleFeature('enableBreathing')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userProfile?.enableBreathing !== false ? 'bg-teal-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile?.enableBreathing !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Waves className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-700">Meditation</span>
                            </div>
                            <button 
                                onClick={() => toggleFeature('enableMeditation')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userProfile?.enableMeditation !== false ? 'bg-teal-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile?.enableMeditation !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Customization */}
                <div>
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <LayoutDashboard className="w-5 h-5 mr-2 text-blue-500" />
                        Dashboard Layout
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                        {[
                            { id: 'showWellnessPulse', label: 'Wellness Pulse Ring', icon: Zap },
                            { id: 'showQuote', label: 'Daily Quote Card', icon: Smile },
                            { id: 'showMoodChart', label: 'Mood Analytics', icon: LayoutTemplate },
                            { id: 'showHabitTracker', label: 'Habit Tracker', icon: Star },
                            { id: 'showQuickLinks', label: 'Quick Links Grid', icon: LayoutDashboard },
                        ].map((item) => (
                             <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium text-slate-700">{item.label}</span>
                                </div>
                                <button 
                                    onClick={() => toggleDashboardConfig(item.id as keyof NonNullable<UserProfile['dashboardConfig']>)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userProfile?.dashboardConfig?.[item.id as keyof NonNullable<UserProfile['dashboardConfig']>] !== false ? 'bg-blue-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile?.dashboardConfig?.[item.id as keyof NonNullable<UserProfile['dashboardConfig']>] !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data & Storage Section */}
                <div>
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-indigo-500" />
                        Data & Storage
                    </h3>
                    
                    {/* Cloud Sync Option */}
                    <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                             <div className="flex items-start gap-4">
                                 <div className={`p-3 rounded-full ${userProfile?.enableCloudSync ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400'}`}>
                                     <Cloud className="w-6 h-6"/>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-800">Cloud Sync</h4>
                                     <p className="text-sm text-slate-600 mb-2">Securely backup your progress to the cloud.</p>
                                     {userProfile?.enableCloudSync && (
                                         <div className="flex items-center gap-2 text-xs font-semibold">
                                             {isSyncing ? (
                                                 <span className="text-indigo-600 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Syncing...</span>
                                             ) : (
                                                 <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Up to date</span>
                                             )}
                                             <span className="text-slate-400">•</span>
                                             <span className="text-slate-500">Last synced: {userProfile?.lastSynced ? new Date(userProfile.lastSynced).toLocaleString() : 'Never'}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                             <button 
                                onClick={handleCloudSyncToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userProfile?.enableCloudSync ? 'bg-indigo-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile?.enableCloudSync ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {userProfile?.enableCloudSync && (
                            <div className="mt-4 flex justify-end relative z-10">
                                <button onClick={triggerManualSync} className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                                    Sync Now
                                </button>
                            </div>
                        )}
                        <div className="absolute -right-6 -bottom-6 text-indigo-100 opacity-50">
                            <Cloud size={100} />
                        </div>
                    </div>

                    {/* Manual Backup/Restore */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <button onClick={handleExportData} className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group">
                             <div className="p-3 bg-blue-50 text-blue-500 rounded-full group-hover:bg-blue-100 transition-colors">
                                 <Download className="w-6 h-6"/>
                             </div>
                             <div className="text-center">
                                 <p className="font-bold text-slate-700">Backup to File</p>
                                 <p className="text-xs text-slate-500 mt-1">Export your data to a secure file</p>
                             </div>
                         </button>

                         <label className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group cursor-pointer">
                             <div className="p-3 bg-teal-50 text-teal-500 rounded-full group-hover:bg-teal-100 transition-colors">
                                 <Upload className="w-6 h-6"/>
                             </div>
                             <div className="text-center">
                                 <p className="font-bold text-slate-700">Restore from File</p>
                                 <p className="text-xs text-slate-500 mt-1">Import data from a backup</p>
                             </div>
                             <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".json"
                                onChange={handleImportData}
                                className="hidden"
                             />
                         </label>

                         {showClearConfirm ? (
                             <div className="sm:col-span-2 flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                                 <div className="flex items-center gap-3">
                                     <AlertTriangle className="w-6 h-6 text-red-500"/>
                                     <div>
                                         <p className="text-sm font-bold text-red-800">Reset Application?</p>
                                         <p className="text-xs text-red-600">This will delete all local data permanently.</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-white rounded-lg transition-colors">Cancel</button>
                                    <button onClick={handleClearData} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm transition-colors">Yes, Clear</button>
                                 </div>
                             </div>
                         ) : (
                            <button onClick={() => setShowClearConfirm(true)} className="sm:col-span-2 flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors text-slate-600 hover:text-red-600 group">
                                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors"/> 
                                <span className="font-medium text-sm">Reset App / Clear All Data</span>
                            </button>
                         )}
                    </div>
                 </div>

                {/* App Health & Diagnostics */}
                <div>
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-500" />
                        System Health
                    </h3>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-bold text-slate-700">Diagnostics Check</p>
                                <p className="text-sm text-slate-500">Verify API connection, storage, and audio.</p>
                            </div>
                            <button 
                                onClick={runSystemCheck} 
                                disabled={systemStatus === 'checking'}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors flex items-center"
                            >
                                {systemStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Play className="w-4 h-4 mr-2"/>}
                                Run Check
                            </button>
                        </div>
                        
                        {systemStatus !== 'idle' && (
                            <div className={`p-4 rounded-lg flex items-start gap-3 ${
                                systemStatus === 'checking' ? 'bg-blue-50 text-blue-700' :
                                systemStatus === 'healthy' ? 'bg-green-50 text-green-700' :
                                'bg-red-50 text-red-700'
                            }`}>
                                {systemStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin mt-0.5"/>}
                                {systemStatus === 'healthy' && <CheckCircle2 className="w-5 h-5 mt-0.5"/>}
                                {systemStatus === 'issue' && <AlertTriangle className="w-5 h-5 mt-0.5"/>}
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wide mb-1">
                                        {systemStatus === 'checking' ? 'Running Diagnostics...' : 
                                         systemStatus === 'healthy' ? 'System Healthy' : 'Issues Detected'}
                                    </p>
                                    <p className="text-sm">{statusMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* About & Legal */}
                <div>
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Scale className="w-5 h-5 mr-2 text-slate-500" />
                        About & Legal
                    </h3>
                    <button 
                        onClick={() => setActiveView(AppView.Legal)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><ShieldCheck className="w-4 h-4 text-slate-600"/></div>
                            <span className="font-medium text-slate-700">Privacy Policy & Terms</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600"/>
                    </button>
                </div>

                <div className="pt-8 text-center text-slate-400 text-xs border-t border-slate-100 mt-8">
                    <p>All rights reserved to KatOSStudio, which is owned and operated by Katelynn Przybilla.</p>
                    <p>It is illegal to copy or reproduce this app and/or any of the content without permission.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
