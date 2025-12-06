
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, Square, Bot, AlertCircle } from 'lucide-react';
import PremiumLock from './PremiumLock';
import { AppView, SubscriptionTier } from '../types';

// Base64 encoding/decoding functions
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

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

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const MindfulCompanion: React.FC<{ subscriptionTier: SubscriptionTier; setActiveView: (view: AppView) => void; }> = ({ subscriptionTier, setActiveView }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  const [isError, setIsError] = useState(false);
  const [transcription, setTranscription] = useState<{ user: string, bot: string, history: {speaker: 'user' | 'bot', text: string}[] }>({ user: '', bot: '', history: [] });

  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversation = useCallback(() => {
    setIsActive(false);
    if (!isError) setStatus('Conversation ended.');

    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

  }, [isError]);

  const startConversation = async () => {
    setIsConnecting(true);
    setIsError(false);
    setStatus('Connecting to AI companion...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a warm, empathetic mindfulness coach. Speak calmly and clearly. Your role is to be a supportive, non-judgmental listener. Guide the user gently if they seem distressed, but avoid giving direct advice. Use pauses in your speech to create a calm pacing.",
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('Connected. Start speaking.');
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscription(prev => ({ ...prev, user: prev.user + text }));
            }
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setTranscription(prev => ({...prev, bot: prev.bot + text}));
            }
            if (message.serverContent?.turnComplete) {
                setTranscription(prev => {
                    const fullInput = prev.user;
                    const fullOutput = prev.bot;
                    const newHistory = [...prev.history];
                    if (fullInput.trim()) newHistory.push({ speaker: 'user', text: fullInput });
                    if (fullOutput.trim()) newHistory.push({ speaker: 'bot', text: fullOutput });
                    return { user: '', bot: '', history: newHistory };
                });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current;
              if (!ctx) return;

              try {
                  const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                  
                  // Re-check context validity after async decode
                  if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') return;

                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                  
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(ctx.destination);
                  source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                  });
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
              } catch (e) {
                  console.error("Error decoding/playing audio:", e);
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            setIsError(true);
            setStatus(`Connection interrupted. Please ensure you have a stable internet connection and try again.`);
            stopConversation();
          },
          onclose: () => {
            if (!isError) setStatus('Connection closed.');
            if (isActive) stopConversation();
          },
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsError(true);
      setStatus('Microphone access denied or not found. Please allow microphone permissions in your browser settings.');
      setIsConnecting(false);
    }
  };

  // Requires Glow or Radiance
  const hasAccess = subscriptionTier === 'glow' || subscriptionTier === 'radiance';

  if (!hasAccess) {
    return <PremiumLock setActiveView={setActiveView} featureName="Mindful Companion" requiredTier="glow" currentTier={subscriptionTier} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Mindful Companion</h2>
      <p className="text-slate-500 mb-6">A real-time voice companion to talk things through.</p>
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        <div className={`absolute inset-0 bg-indigo-100 rounded-full ${isActive ? 'animate-ping-slow' : ''}`}></div>
        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-16 h-16 text-indigo-500"/>
        </div>
      </div>
      
      <div className="h-12 mb-4 flex items-center justify-center">
          {isError ? (
               <p className="text-red-600 font-medium flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg text-sm"><AlertCircle className="w-4 h-4"/> {status}</p>
          ) : (
               <p className="text-lg font-medium text-slate-700">{status}</p>
          )}
      </div>

      {!isActive && !isConnecting && (
        <button onClick={startConversation} className="flex items-center justify-center px-8 py-4 bg-green-500 text-white font-bold rounded-full text-lg hover:bg-green-600 transition-all duration-300 shadow-lg">
          <Mic className="w-6 h-6 mr-2" />
          Start Conversation
        </button>
      )}

      {isConnecting && (
        <div className="flex items-center justify-center px-8 py-4 bg-slate-400 text-white font-bold rounded-full text-lg cursor-not-allowed">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Connecting...
        </div>
      )}

      {isActive && (
        <button onClick={stopConversation} className="flex items-center justify-center px-8 py-4 bg-red-500 text-white font-bold rounded-full text-lg hover:bg-red-600 transition-all duration-300 shadow-lg">
          <Square className="w-6 h-6 mr-2" />
          End Conversation
        </button>
      )}

      <div className="w-full max-w-2xl mt-8 bg-slate-50 rounded-lg p-4 h-48 overflow-y-auto text-left text-sm text-slate-600">
          <h4 className="font-semibold text-slate-800 mb-2">Live Transcription</h4>
          {transcription.history.map((item, index) => (
              <p key={index} className={item.speaker === 'user' ? 'font-semibold' : ''}>
                  <span className="capitalize font-bold">{item.speaker}: </span>{item.text}
              </p>
          ))}
           {transcription.user && <p className="font-semibold"><span className="capitalize font-bold">User: </span>{transcription.user}</p>}
           {transcription.bot && <p><span className="capitalize font-bold">Bot: </span>{transcription.bot}</p>}
      </div>

    </div>
  );
};

export default MindfulCompanion;
