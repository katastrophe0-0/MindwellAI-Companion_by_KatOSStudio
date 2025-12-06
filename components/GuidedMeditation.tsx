
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MEDITATION_SCRIPTS } from '../constants';
import { Play, Loader2, StopCircle, Sparkles, BookOpen, Mic, Wand2, Library } from 'lucide-react';

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type MeditationTitle = keyof typeof MEDITATION_SCRIPTS;

const GuidedMeditation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'library' | 'create'>('library');
    const [selectedMeditation, setSelectedMeditation] = useState<MeditationTitle>('5-Minute Mindfulness');
    const [customPrompt, setCustomPrompt] = useState('');
    const [duration, setDuration] = useState(0); // in minutes, 0 = full length
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState('');
    const [currentScript, setCurrentScript] = useState<string>('');
    
    // Player State
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);

    const stopPlayback = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch (e) {
                // Already stopped
            }
        }
    }, []);

    const playEndNotification = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now); // A5 note
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 1.5);
    };

    const fadeOutAndStop = useCallback(() => {
        if (!gainNodeRef.current || !audioContextRef.current) {
            stopPlayback();
            return;
        }
        const gainNode = gainNodeRef.current;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0.0001, now + 3);

        setTimeout(() => {
            playEndNotification();
            stopPlayback();
        }, 3100);

        timerRef.current = null;
    }, [stopPlayback]);

    useEffect(() => {
        return () => {
            stopPlayback();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stopPlayback]);


    const playAudio = (buffer: AudioBuffer) => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } else if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        
        const ctx = audioContextRef.current!;
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Update Duration
        setTotalDuration(buffer.duration);
        startTimeRef.current = ctx.currentTime;

        source.onended = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            setIsPlaying(false);
            setCurrentTime(0);
            sourceRef.current = null;
            gainNodeRef.current = null;
        };

        sourceRef.current = source;
        gainNodeRef.current = gainNode;
        
        source.start();
        setIsPlaying(true);
        
        // Tracking Loop
        const updateProgress = () => {
            if (!ctx) return;
            const now = ctx.currentTime;
            const elapsed = now - startTimeRef.current;
            if (elapsed <= buffer.duration) {
                setCurrentTime(elapsed);
                rafRef.current = requestAnimationFrame(updateProgress);
            }
        };
        rafRef.current = requestAnimationFrame(updateProgress);

        
        if (duration > 0) {
            const durationInMs = duration * 60 * 1000;
            timerRef.current = window.setTimeout(fadeOutAndStop, durationInMs);
        }
    };
    
    const generateAndPlay = async () => {
        if (isPlaying) {
            stopPlayback();
            setIsPlaying(false);
            return;
        }

        // Use cached buffer if available and we are in library mode
        if (activeTab === 'library' && audioBufferRef.current && audioBufferRef.current.duration > 1) {
             playAudio(audioBufferRef.current);
             return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let textToRead = '';

            if (activeTab === 'library') {
                textToRead = MEDITATION_SCRIPTS[selectedMeditation];
                setCurrentScript(textToRead);
            } else {
                if (!customPrompt.trim()) {
                    setError("Please describe your desired meditation setting.");
                    setIsLoading(false);
                    return;
                }
                // Generate the script first
                const scriptResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Write a soothing, sensory-rich guided imagery meditation script based on this prompt: "${customPrompt}". 
                    Include gentle breathing cues. Keep it concise (approx 150-200 words). 
                    Do not include title or instructions, just the spoken words.`,
                });
                textToRead = scriptResponse.text;
                setCurrentScript(textToRead);
            }

            // Generate TTS
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: textToRead }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if(!base64Audio) throw new Error("No audio data received.");
            
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            
            // Only cache if in library mode, otherwise we re-generate
            if (activeTab === 'library') {
                audioBufferRef.current = buffer;
            }
            
            playAudio(buffer);

        } catch (err) {
            console.error("Error generating speech:", err);
            setError("Unable to generate audio. Please check your internet connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Clear audio buffer and stop playback when selection/tab changes
    useEffect(() => {
        stopPlayback();
        setIsPlaying(false);
        if (activeTab === 'library') {
            audioBufferRef.current = null;
            setCurrentScript(MEDITATION_SCRIPTS[selectedMeditation]);
            setTotalDuration(0);
            setCurrentTime(0);
        } else {
            setCurrentScript('');
            setTotalDuration(0);
            setCurrentTime(0);
        }
    }, [selectedMeditation, activeTab, stopPlayback]);

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
             {/* Header */}
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" /> Guided Meditation
                </h2>
                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'library' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Library className="w-4 h-4"/> Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Wand2 className="w-4 h-4"/> AI Generator
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 overflow-hidden shadow-lg border-4 border-indigo-50 relative">
                     <img 
                        src={activeTab === 'library' 
                            ? "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=400&auto=format&fit=crop" 
                            : "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&auto=format&fit=crop"}
                        alt="Meditation" 
                        className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="flex gap-1">
                                <div className="w-1 h-4 bg-white animate-pulse"></div>
                                <div className="w-1 h-6 bg-white animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'library' ? (
                    <div className="w-full max-w-sm space-y-4 animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800">Classic Sessions</h3>
                        <p className="text-slate-500 text-sm mb-4">Select a guided session from our library.</p>
                        
                        <div className="text-left">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Meditation</label>
                            <select 
                                value={selectedMeditation}
                                onChange={(e) => setSelectedMeditation(e.target.value as MeditationTitle)}
                                disabled={isLoading || isPlaying}
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            >
                                {Object.keys(MEDITATION_SCRIPTS).map(title => (
                                    <option key={title} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-sm space-y-4 animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800">Guided Imagery Generator</h3>
                        <p className="text-slate-500 text-sm mb-4">Describe a place or feeling, and AI will guide you there.</p>
                        
                        <div className="text-left">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visualization Prompt</label>
                             <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., Walking barefoot on cool moss in an ancient forest, smelling pine needles..."
                                className="w-full p-3 h-24 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                disabled={isLoading || isPlaying}
                             />
                        </div>
                    </div>
                )}
                
                <div className="w-full max-w-sm mt-4 text-left">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Timer (Optional)</label>
                     <select 
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        disabled={isLoading || isPlaying}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                     >
                        <option value="0">Full Length</option>
                        <option value="5">5 Minutes</option>
                        <option value="10">10 Minutes</option>
                        <option value="15">15 Minutes</option>
                     </select>
                </div>

                <div className="mt-8 flex flex-col items-center w-full max-w-sm">
                    <button 
                        onClick={generateAndPlay} 
                        disabled={isLoading}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-105 ${
                            isPlaying 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? <Loader2 className="w-8 h-8 animate-spin"/> : isPlaying ? <StopCircle className="w-8 h-8"/> : <Play className="w-8 h-8 ml-1"/>}
                    </button>
                    
                    {/* Progress Bar */}
                    <div className={`w-full mt-6 flex items-center gap-3 transition-opacity duration-500 ${totalDuration > 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-xs font-mono text-slate-500 font-medium w-10 text-right">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                            <div 
                                className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-200 ease-linear rounded-full"
                                style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-medium w-10">{formatTime(totalDuration)}</span>
                    </div>

                    <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {isLoading ? (activeTab === 'create' ? 'Generating...' : 'Loading...') : isPlaying ? 'Stop Session' : 'Start Session'}
                    </p>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                
                {currentScript && (activeTab === 'create' || isPlaying) && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 max-w-lg w-full text-left max-h-40 overflow-y-auto custom-scrollbar">
                        <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Script Preview</p>
                        <p className="text-sm text-slate-600 italic leading-relaxed">{currentScript}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuidedMeditation;
