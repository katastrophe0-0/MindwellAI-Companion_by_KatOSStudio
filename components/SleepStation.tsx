
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Moon, Star, Cloud, Play, Pause, Loader2, Sparkles, Volume2, BookOpen } from 'lucide-react';
import PremiumLock from './PremiumLock';
import { AppView, SubscriptionTier } from '../types';

interface SleepStationProps {
    subscriptionTier: SubscriptionTier;
    setActiveView: (view: AppView) => void;
}

const STORY_THEMES = [
    "A walk through an ancient forest",
    "Floating on a cloud at sunset",
    "A cozy cabin in the snowy mountains",
    "A gentle stream in a secret garden",
    "Stargazing from a quiet hilltop"
];

// Audio decoding helpers
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

const SleepStation: React.FC<SleepStationProps> = ({ subscriptionTier, setActiveView }) => {
    const [topic, setTopic] = useState('');
    const [storyText, setStoryText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [status, setStatus] = useState('');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (sourceRef.current) sourceRef.current.stop();
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const generateAndPlayStory = async () => {
        if (!topic.trim()) return;
        
        setIsGenerating(true);
        setStatus('Weaving your story...');
        setStoryText('');
        if (sourceRef.current) sourceRef.current.stop();
        setIsPlaying(false);
        pausedAtRef.current = 0;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // Step 1: Generate Text
            const textResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Write a soothing, sleep-inducing bedtime story about: ${topic}. 
                Use sensory details, calming language, and slow pacing. 
                Keep it around 150-200 words. 
                Do not include a title, just the story.`,
            });
            
            const generatedText = textResponse.text;
            setStoryText(generatedText);
            setStatus('Preparing voice...');

            // Step 2: Generate Audio
            const audioResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: generatedText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, calming voice
                        },
                    },
                },
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio generated");

            // Step 3: Decode and Play
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            audioBufferRef.current = buffer;
            
            playAudio(buffer, 0);
            setStatus('');

        } catch (error) {
            console.error("Sleep Station Error:", error);
            setStatus('Something disturbed the peace. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const playAudio = (buffer: AudioBuffer, startOffset: number) => {
        if (!audioContextRef.current) return;
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0, startOffset);
        
        startTimeRef.current = audioContextRef.current.currentTime - startOffset;
        sourceRef.current = source;
        setIsPlaying(true);

        source.onended = () => {
             // Basic check to see if it ended naturally or was stopped
             if (audioContextRef.current && (audioContextRef.current.currentTime - startTimeRef.current >= buffer.duration)) {
                 setIsPlaying(false);
                 pausedAtRef.current = 0;
             }
        };
    };

    const togglePlayback = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;

        if (isPlaying) {
            sourceRef.current?.stop();
            pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
            setIsPlaying(false);
        } else {
            playAudio(audioBufferRef.current, pausedAtRef.current);
        }
    };

    const hasAccess = subscriptionTier === 'radiance';

    if (!hasAccess) {
        return <PremiumLock setActiveView={setActiveView} featureName="Sleep Station" requiredTier="radiance" currentTier={subscriptionTier} />;
    }

    return (
        <div className="bg-slate-900 text-slate-100 rounded-lg shadow-2xl h-full flex flex-col overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-10 left-10 text-slate-800 opacity-20"><Moon size={120} /></div>
            <div className="absolute bottom-20 right-10 text-slate-800 opacity-20"><Cloud size={150} /></div>
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i} 
                    className="absolute rounded-full bg-white opacity-40 animate-pulse"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                />
            ))}

            <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif flex items-center gap-3">
                        <Sparkles className="text-indigo-400" /> Sleep Station
                    </h2>
                    <div className="px-3 py-1 bg-indigo-900/50 rounded-full border border-indigo-500/30 text-xs font-semibold text-indigo-200">
                        Dark Mode Active
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8">
                    {!storyText && !isGenerating ? (
                        <div className="w-full space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-light text-indigo-100">Drift off to a custom story.</h3>
                                <p className="text-slate-400">Choose a theme or enter your own to begin.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {STORY_THEMES.map(theme => (
                                    <button 
                                        key={theme}
                                        onClick={() => setTopic(theme)}
                                        className={`p-4 text-left rounded-xl border transition-all ${topic === theme ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Or type your own (e.g., A cozy bakery on a rainy day)"
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <button 
                                    onClick={generateAndPlayStory}
                                    disabled={!topic.trim()}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Begin
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full text-center space-y-8 animate-fade-in">
                            {isGenerating ? (
                                <div className="py-12 flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
                                    <p className="text-lg font-light text-indigo-200 animate-pulse">{status}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-48 h-48 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-2xl relative">
                                        {isPlaying && <div className="absolute inset-0 rounded-full border-2 border-indigo-500 animate-ping-slow opacity-50"></div>}
                                        <button 
                                            onClick={togglePlayback}
                                            className="w-full h-full rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors group z-10"
                                        >
                                            {isPlaying ? <Pause className="w-16 h-16 text-indigo-400 group-hover:text-indigo-300" /> : <Play className="w-16 h-16 text-indigo-400 group-hover:text-indigo-300 ml-2" />}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
                                        <h4 className="flex items-center justify-center gap-2 text-indigo-300 mb-4 text-sm font-bold uppercase tracking-wider">
                                            <BookOpen className="w-4 h-4"/> Story Text
                                        </h4>
                                        <p className="text-slate-300 leading-relaxed font-serif text-lg text-justify">
                                            {storyText}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => { setStoryText(''); setTopic(''); }}
                                        className="text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors"
                                    >
                                        Create New Story
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SleepStation;
