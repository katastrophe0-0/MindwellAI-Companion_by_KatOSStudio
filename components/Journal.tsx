
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AppView, type JournalEntry, UserProfile } from '../types';
import { BookHeart, Feather, Loader2, Sparkles, Trash2, ListFilter, Mic, MicOff, Tag, Plus, X, AlertTriangle, Edit, Save, Sun, Moon, Wind, Heart, FileText, Wand2 } from 'lucide-react';

interface JournalProps {
    isPremium: boolean;
    setActiveView: (view: AppView) => void;
    userProfile: UserProfile | null;
}

const GUIDED_TEMPLATES = [
    {
        id: 'free',
        label: 'Free Write',
        prompt: 'Free Write',
        icon: Feather,
        template: ''
    },
    {
        id: 'emotional_dive',
        label: 'Deep Dive',
        prompt: 'Emotional Deep Dive',
        icon: Heart,
        template: "What emotion is most present right now?\n\nWhere do I feel it in my body?\n\nWhat is this emotion trying to tell me?\n\nWhat do I need most right now?"
    },
    {
        id: 'self_compassion',
        label: 'Self Compassion',
        prompt: 'Self Compassion',
        icon: Sparkles,
        template: "I am judging myself for...\n\nIf a friend were in this situation, I would tell them...\n\nI can offer myself kindness by..."
    },
    {
        id: 'morning',
        label: 'Morning Intent',
        prompt: 'Morning Intention',
        icon: Sun,
        template: "Today's Intention:\n\nThree things I want to accomplish:\n1. \n2. \n3. \n\nI choose to feel..."
    },
    {
        id: 'evening',
        label: 'Evening Reflection',
        prompt: 'Evening Reflection',
        icon: Moon,
        template: "Highlights of the day:\n\nOne thing I learned:\n\nI am grateful for:\n\nTomorrow, I will..."
    },
    {
        id: 'anxiety',
        label: 'Anxiety Check',
        prompt: 'Anxiety Release',
        icon: Wind,
        template: "What am I feeling right now?\n\nWhat is the worst that could happen?\n\nWhat is the best that could happen?\n\nWhat is most likely to happen?"
    },
    {
        id: 'gratitude',
        label: 'Gratitude',
        prompt: 'Gratitude Practice',
        icon: Heart,
        template: "1. I am grateful for...\n2. A person who helped me...\n3. A small joy I experienced..."
    },
    {
        id: 'stress',
        label: 'Stress Dump',
        prompt: 'Stress Relief',
        icon: FileText,
        template: "What is stressing me out?\n\nIs this within my control?\n\nOne small step I can take right now:"
    }
];

interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onend: () => void;
    onerror: (event: any) => void;
    start: () => void;
    stop: () => void;
}
declare var SpeechRecognition: { new(): SpeechRecognition };
declare var webkitSpeechRecognition: { new(): SpeechRecognition };
interface CustomWindow extends Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
}
declare const window: CustomWindow;


const Journal: React.FC<JournalProps> = ({ isPremium, setActiveView, userProfile }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(GUIDED_TEMPLATES[0].prompt);
    const [activeTemplateId, setActiveTemplateId] = useState('free');
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    
    // Voice & Tag State
    const [isListening, setIsListening] = useState(false);
    const [currentTags, setCurrentTags] = useState<string[]>([]);
    const [newTagInput, setNewTagInput] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    
    // Edit State
    const [isEditingEntry, setIsEditingEntry] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editPrompt, setEditPrompt] = useState('');
    const [editTags, setEditTags] = useState<string[]>([]);
    const [editNewTagInput, setEditNewTagInput] = useState('');

    // Delete Confirmation State
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    
    const currentEntryRef = useRef(currentEntry);
    currentEntryRef.current = currentEntry;

    useEffect(() => {
        const loadedEntries = localStorage.getItem('journalEntries');
        if (loadedEntries) {
            setEntries(JSON.parse(loadedEntries));
        }
        const loadedDraft = localStorage.getItem('journalDraft');
        if (loadedDraft) {
            setCurrentEntry(loadedDraft);
        }
    }, []);

    // Reset editing state when switching entries
    useEffect(() => {
        setIsEditingEntry(false);
    }, [selectedEntry?.id]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                     // Append with a space if needed
                    setCurrentEntry(prev => {
                        const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                        return prev + spacer + finalTranscript;
                    });
                }
            };
            
            recognition.onend = () => setIsListening(false);
            recognition.onerror = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    useEffect(() => {
        if (selectedEntry) return;
        const intervalId = setInterval(() => {
            if (currentEntryRef.current && currentEntryRef.current.trim()) {
                 setAutoSaveStatus('Saving...');
                 localStorage.setItem('journalDraft', currentEntryRef.current);
                 setTimeout(() => setAutoSaveStatus('Saved'), 500);
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [selectedEntry]);

    const applyTemplate = (templateId: string) => {
        const template = GUIDED_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        // Check if user has typed something that isn't the previous template
        const prevTemplate = GUIDED_TEMPLATES.find(t => t.id === activeTemplateId);
        const hasCustomText = currentEntry.trim() !== '' && currentEntry !== prevTemplate?.template;

        if (hasCustomText) {
            if (!window.confirm("Changing templates will overwrite your current text. Continue?")) {
                return;
            }
        }

        setActiveTemplateId(templateId);
        setSelectedPrompt(template.prompt);
        setCurrentEntry(template.template);
    };

    const generateAiPrompt = async () => {
        setIsGeneratingPrompt(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "Generate a single, deep, introspective journaling prompt for emotional reflection. It should be open-ended and thought-provoking. Do not use quotes.",
            });
            
            const promptText = response.text.trim();
            
            // Check if there is existing content that isn't just the prompt label
            if (currentEntry.trim() !== '' && currentEntry !== selectedPrompt && !window.confirm("Replace current text with new prompt?")) {
                 setIsGeneratingPrompt(false);
                 return;
            }

            setSelectedPrompt("AI Reflection");
            setCurrentEntry(promptText + "\n\n");
            setActiveTemplateId('ai');
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const saveEntry = () => {
        if (!currentEntry.trim()) return;
        const newEntry: JournalEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            content: currentEntry,
            prompt: selectedPrompt !== "Free Write" ? selectedPrompt : undefined,
            tags: currentTags
        };
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        
        // Reset to Free Write
        setCurrentEntry('');
        setCurrentTags([]);
        setActiveTemplateId('free');
        setSelectedPrompt('Free Write');
        
        localStorage.removeItem('journalDraft');
        setAutoSaveStatus('');
    };

    const confirmDelete = () => {
        if (entryToDelete === null) return;
        const updatedEntries = entries.filter(e => e.id !== entryToDelete);
        setEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        if(selectedEntry?.id === entryToDelete) setSelectedEntry(null);
        setEntryToDelete(null);
    };
    
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTagInput.trim()) {
            e.preventDefault();
            if (!currentTags.includes(newTagInput.trim())) {
                setCurrentTags([...currentTags, newTagInput.trim()]);
            }
            setNewTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    };

    // Edit Handlers
    const startEditing = () => {
        if (!selectedEntry) return;
        setEditContent(selectedEntry.content);
        setEditPrompt(selectedEntry.prompt || "Free Write");
        setEditTags(selectedEntry.tags || []);
        setIsEditingEntry(true);
    };

    const cancelEditing = () => {
        setIsEditingEntry(false);
    };

    const saveEditedEntry = () => {
        if (!selectedEntry || !editContent.trim()) return;
        
        const updatedEntry: JournalEntry = {
            ...selectedEntry,
            content: editContent,
            prompt: editPrompt !== "Free Write" ? editPrompt : undefined,
            tags: editTags
        };

        const updatedEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
        setEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        setSelectedEntry(updatedEntry);
        setIsEditingEntry(false);
    };

    const handleEditAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && editNewTagInput.trim()) {
            e.preventDefault();
            if (!editTags.includes(editNewTagInput.trim())) {
                setEditTags([...editTags, editNewTagInput.trim()]);
            }
            setEditNewTagInput('');
        }
    };

    const removeEditTag = (tagToRemove: string) => {
        setEditTags(editTags.filter(tag => tag !== tagToRemove));
    };

    const handleAnalyze = async (entry: JournalEntry) => {
        if (!entry) return;
        setIsAnalyzing(true);
        setAnalysisError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze this journal entry for the user. Entry: "${entry.content}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            reflection: { type: Type.STRING, description: "Compassionate, non-clinical reflection." },
                            sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative", "Mixed"] },
                            themes: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["reflection", "sentiment", "themes"]
                    }
                }
            });
            
            const result = JSON.parse(response.text);
            
            const updatedEntry = { 
                ...entry, 
                analysis: result.reflection,
                sentiment: result.sentiment,
                themes: result.themes
            };

            const updatedEntries = entries.map(e => e.id === entry.id ? updatedEntry : e);
            setEntries(updatedEntries);
            setSelectedEntry(updatedEntry);
            localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        } catch (error) {
            setAnalysisError("Unable to analyze entry. Please check your connection and try again.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    const blurClass = userProfile?.preferences?.blurJournalPreviews ? 'blur-[3px] group-hover:blur-none transition-all duration-300' : '';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-6rem)] relative">
            {/* Delete Confirmation Modal */}
            {entryToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Delete Entry?</h3>
                        </div>
                        <p className="text-slate-600 mb-6">This action cannot be undone. Are you sure you want to delete this journal entry?</p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setEntryToDelete(null)} 
                                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entry List */}
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center"><BookHeart className="w-5 h-5 mr-2 text-indigo-500" /> My Journal</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {entries.map(entry => (
                        <div key={entry.id} onClick={() => setSelectedEntry(entry)} className={`group p-3 rounded-lg cursor-pointer border transition-all ${selectedEntry?.id === entry.id ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEntryToDelete(entry.id); }} 
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                            {entry.prompt && <p className="text-xs font-medium text-indigo-600 mb-1 line-clamp-1">{entry.prompt}</p>}
                            <p className={`text-sm text-slate-700 line-clamp-2 ${blurClass}`}>{entry.content}</p>
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {entry.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {entries.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No entries yet. Start writing!</div>}
                </div>
            </div>

            {/* Editor / Viewer */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                {selectedEntry ? (
                    <div className="flex-1 flex flex-col h-full relative z-10 bg-white">
                        {isEditingEntry ? (
                            /* EDIT MODE */
                            <>
                                <div className="p-4 border-b border-slate-200 flex flex-col gap-3 bg-slate-50">
                                     <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-700">Editing Entry</h3>
                                        <div className="flex gap-2">
                                             <button onClick={cancelEditing} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                                                Cancel
                                             </button>
                                             <button onClick={saveEditedEntry} disabled={!editContent.trim()} className="px-3 py-1.5 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center">
                                                <Save className="w-4 h-4 mr-1.5"/> Save Changes
                                             </button>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <ListFilter className="w-5 h-5 text-slate-400"/>
                                         <select 
                                             value={editPrompt} 
                                             onChange={(e) => setEditPrompt(e.target.value)}
                                             className="bg-transparent font-medium text-slate-700 text-sm focus:outline-none w-full cursor-pointer"
                                         >
                                             {GUIDED_TEMPLATES.map(t => <option key={t.id} value={t.prompt}>{t.label}</option>)}
                                         </select>
                                     </div>
                                     <div className="flex flex-wrap items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-400" />
                                        {editTags.map(tag => (
                                            <span key={tag} className="flex items-center text-xs bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600">
                                                {tag}
                                                <button onClick={() => removeEditTag(tag)} className="ml-1 text-slate-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={editNewTagInput}
                                            onChange={(e) => setEditNewTagInput(e.target.value)}
                                            onKeyDown={handleEditAddTag}
                                            placeholder="Add tag + Enter"
                                            className="text-xs bg-transparent outline-none min-w-[100px] placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full h-full resize-none focus:outline-none text-lg text-slate-800 leading-relaxed"
                                    />
                                </div>
                            </>
                        ) : (
                            /* VIEW MODE */
                            <>
                                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                    <div>
                                        <p className="text-sm text-slate-500">{new Date(selectedEntry.date).toLocaleString()}</p>
                                        {selectedEntry.prompt && <p className="text-sm font-semibold text-indigo-700 mt-1">{selectedEntry.prompt}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={startEditing} className="text-sm font-bold text-slate-600 flex items-center hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4 mr-2"/> Edit
                                        </button>
                                        <button onClick={() => setSelectedEntry(null)} className="text-sm font-bold text-indigo-600 flex items-center hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                            <Feather className="w-4 h-4 mr-2"/> New Entry
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <div className="prose prose-slate max-w-none">
                                        <p className="whitespace-pre-wrap text-slate-800 text-lg leading-relaxed">{selectedEntry.content}</p>
                                    </div>
                                    {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                        <div className="flex gap-2 mt-6 flex-wrap">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            {selectedEntry.tags.map(tag => (
                                                <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* AI Reflection Area */}
                                <div className="p-4 bg-indigo-50 border-t border-indigo-100">
                                    {selectedEntry.analysis ? (
                                        <div className="animate-fade-in">
                                            <h4 className="text-sm font-bold text-indigo-800 mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2"/> AI Analysis & Reflection</h4>
                                            
                                            {(selectedEntry.sentiment || (selectedEntry.themes && selectedEntry.themes.length > 0)) && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {selectedEntry.sentiment && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                            selectedEntry.sentiment === 'Positive' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            selectedEntry.sentiment === 'Negative' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}>
                                                            {selectedEntry.sentiment}
                                                        </span>
                                                    )}
                                                    {selectedEntry.themes?.map(theme => (
                                                        <span key={theme} className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                                            {theme}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-sm text-indigo-700 italic">{selectedEntry.analysis}</p>
                                        </div>
                                    ) : (
                                        isPremium ? (
                                            <button onClick={() => handleAnalyze(selectedEntry)} disabled={isAnalyzing} className="flex items-center justify-center w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                                                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>} Generate AI Analysis
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between text-sm text-slate-500">
                                                <span>Unlock AI insights with Premium</span>
                                                <button onClick={() => setActiveView(AppView.Settings)} className="font-bold text-indigo-600 hover:underline">Upgrade</button>
                                            </div>
                                        )
                                    )}
                                    {analysisError && <p className="text-xs text-red-500 mt-2">{analysisError}</p>}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    /* CREATION MODE (Default) */
                    <div className="flex-1 flex flex-col h-full relative">
                        {/* Background Image for Empty State */}
                         <div 
                            className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop')` }}
                        />

                        {/* Templates Toolbar */}
                        <div className="p-3 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm relative z-10">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guided Templates</p>
                                <button 
                                    onClick={generateAiPrompt}
                                    disabled={isGeneratingPrompt}
                                    className="text-[10px] font-bold text-indigo-600 flex items-center hover:bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingPrompt ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
                                    Generate AI Prompt
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {GUIDED_TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => applyTemplate(template.id)}
                                        className={`flex-shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                            activeTemplateId === template.id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <template.icon className="w-3 h-3 mr-1.5" />
                                        {template.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metadata Toolbar */}
                        <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-sm relative z-10">
                            <Tag className="w-4 h-4 text-slate-400" />
                            {currentTags.map(tag => (
                                <span key={tag} className="flex items-center text-xs bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 text-slate-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tag + Enter"
                                className="text-xs bg-transparent outline-none min-w-[100px] placeholder-slate-400"
                            />
                        </div>
                        
                        <div className="flex-1 relative z-10">
                            <textarea
                                value={currentEntry}
                                onChange={(e) => setCurrentEntry(e.target.value)}
                                placeholder={selectedPrompt === "Free Write" ? "How are you feeling today?" : "Type your response here..."}
                                className="w-full h-full p-6 resize-none focus:outline-none text-lg text-slate-800 leading-relaxed bg-transparent"
                            />
                            {/* Mic Button */}
                            <button 
                                onClick={toggleListening}
                                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                title={isListening ? "Stop listening" : "Start voice typing"}
                            >
                                {isListening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
                            </button>
                        </div>

                        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-sm relative z-10">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-600">{selectedPrompt}</span>
                                <span className="text-[10px] text-slate-400 italic">{autoSaveStatus} {isListening && "• Listening..."}</span>
                            </div>
                            <button onClick={saveEntry} disabled={!currentEntry.trim()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                Save Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Journal;
