
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Zap, Mountain, Activity, Waves, Power } from 'lucide-react';

const AUDIO_CTX_OPTIONS = { sampleRate: 44100 };

const Soundscapes: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // State for individual volumes (0-1)
    const [volumes, setVolumes] = useState({
        white: 0,
        pink: 0,
        brown: 0,
        binauralBeta: 0, // Focus
        binauralTheta: 0, // Relax
    });

    const nodesRef = useRef<{
        white: GainNode | null;
        pink: GainNode | null;
        brown: GainNode | null;
        binauralBeta: GainNode | null;
        binauralTheta: GainNode | null;
        masterGain: GainNode | null;
    }>({ white: null, pink: null, brown: null, binauralBeta: null, binauralTheta: null, masterGain: null });

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(AUDIO_CTX_OPTIONS);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        setIsPlaying(true);
        setupNodes();
        drawVisualizer();
    };

    const createNoiseBuffer = (ctx: AudioContext) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const createPinkNoiseNode = (ctx: AudioContext) => {
        const bufferSize = 4096;
        const node = ctx.createScriptProcessor(bufferSize, 1, 1);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        node.onaudioprocess = (e) => {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        };
        return node;
    }

    const createBrownNoiseNode = (ctx: AudioContext) => {
        const bufferSize = 4096;
        const node = ctx.createScriptProcessor(bufferSize, 1, 1);
        let lastOut = 0;
        node.onaudioprocess = (e) => {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            }
        };
        return node;
    }

    const setupNodes = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || nodesRef.current.white) return; // Already setup

        // Master setup for visualizer
        const masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
        
        nodesRef.current.masterGain = masterGain;
        analyserRef.current = analyser;

        // White Noise
        const whiteBuffer = createNoiseBuffer(ctx);
        const whiteSource = ctx.createBufferSource();
        whiteSource.buffer = whiteBuffer;
        whiteSource.loop = true;
        const whiteGain = ctx.createGain();
        whiteGain.gain.value = 0;
        whiteSource.connect(whiteGain).connect(masterGain);
        whiteSource.start();
        nodesRef.current.white = whiteGain;

        // Pink Noise
        const pinkSource = createPinkNoiseNode(ctx);
        const pinkGain = ctx.createGain();
        pinkGain.gain.value = 0;
        pinkSource.connect(pinkGain).connect(masterGain);
        nodesRef.current.pink = pinkGain;

        // Brown Noise
        const brownSource = createBrownNoiseNode(ctx);
        const brownGain = ctx.createGain();
        brownGain.gain.value = 0;
        brownSource.connect(brownGain).connect(masterGain);
        nodesRef.current.brown = brownGain;

        // Binaural Beta (Focus - 200Hz base, 14Hz beat)
        const betaGain = ctx.createGain();
        betaGain.gain.value = 0;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        osc1.frequency.value = 200;
        osc2.frequency.value = 214; 
        osc1.connect(merger, 0, 0); // Left
        osc2.connect(merger, 0, 1); // Right
        merger.connect(betaGain).connect(masterGain);
        osc1.start();
        osc2.start();
        nodesRef.current.binauralBeta = betaGain;

        // Binaural Theta (Relax - 200Hz base, 6Hz beat)
        const thetaGain = ctx.createGain();
        thetaGain.gain.value = 0;
        const osc3 = ctx.createOscillator();
        const osc4 = ctx.createOscillator();
        const merger2 = ctx.createChannelMerger(2);
        osc3.frequency.value = 200;
        osc4.frequency.value = 206; 
        osc3.connect(merger2, 0, 0); // Left
        osc4.connect(merger2, 0, 1); // Right
        merger2.connect(thetaGain).connect(masterGain);
        osc3.start();
        osc4.start();
        nodesRef.current.binauralTheta = thetaGain;
    };
    
    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const renderFrame = () => {
            if (!isPlaying) return;
            animationFrameRef.current = requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#818cf8'); // Indigo 400
            gradient.addColorStop(1, '#c084fc'); // Purple 400
            
            ctx.fillStyle = gradient;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;
                
                // Draw rounded bars
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 4);
                ctx.fill();
                
                x += barWidth + 2;
            }
        }
        
        // Ensure canvas size matches display size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        renderFrame();
        
        return () => window.removeEventListener('resize', resizeCanvas);
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioCtxRef.current?.suspend();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setIsPlaying(false);
        } else {
            initAudio();
        }
    };

    const handleVolumeChange = (type: keyof typeof volumes, val: number) => {
        setVolumes(prev => ({ ...prev, [type]: val }));
        if (!audioCtxRef.current) initAudio(); // Start context on slider interaction if not started
        
        const gainNode = nodesRef.current[type];
        if (gainNode) {
            // Smooth transition
            gainNode.gain.setTargetAtTime(val, audioCtxRef.current!.currentTime, 0.1);
        }
    };

    const presets = [
        { name: "Deep Focus", set: { white: 0.1, brown: 0.3, binauralBeta: 0.2, pink: 0, binauralTheta: 0 } },
        { name: "Rainy Cafe", set: { pink: 0.4, brown: 0.2, white: 0, binauralBeta: 0, binauralTheta: 0 } },
        { name: "Meditation", set: { white: 0, brown: 0.1, pink: 0.1, binauralTheta: 0.3, binauralBeta: 0 } },
        { name: "Silence", set: { white: 0, brown: 0, pink: 0, binauralTheta: 0, binauralBeta: 0 } },
    ];

    const applyPreset = (preset: typeof presets[0]) => {
        setVolumes(preset.set);
        if (!audioCtxRef.current) initAudio();
        
        Object.entries(preset.set).forEach(([key, val]) => {
            const k = key as keyof typeof volumes;
            const node = nodesRef.current[k];
            if (node && audioCtxRef.current) {
                node.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.5);
            }
        });
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            audioCtxRef.current?.close();
        };
    }, []);

    const SoundControl = ({ label, type, icon: Icon, color }: any) => (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-700">{label}</span>
                    <span className="text-xs font-mono text-slate-400">{Math.round(volumes[type as keyof typeof volumes] * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="0.5" // Cap max volume to prevent clipping when mixed
                    step="0.01" 
                    value={volumes[type as keyof typeof volumes]} 
                    onChange={(e) => handleVolumeChange(type, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
             {/* Header */}
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg mb-6">
                 <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Waves className="w-6 h-6 text-indigo-400"/> Sonic Sanctuary</h2>
                    <p className="text-slate-400 text-sm">Mix your perfect ambient environment.</p>
                 </div>
                 <button 
                    onClick={togglePlay} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                >
                    <Power className="w-6 h-6" />
                </button>
             </div>

             <div className="px-6 pb-6 space-y-8 max-w-4xl mx-auto w-full">
                {/* Visualizer */}
                <div className="h-32 w-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden relative">
                     {!isPlaying && <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">Press Power to Start Visualization</div>}
                     <canvas ref={canvasRef} className="w-full h-full" />
                </div>

                {/* Presets */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Mixes</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {presets.map(p => (
                            <button 
                                key={p.name}
                                onClick={() => applyPreset(p)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors whitespace-nowrap"
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SoundControl label="White Noise (Focus)" type="white" icon={Zap} color="bg-slate-400" />
                    <SoundControl label="Pink Noise (Rain)" type="pink" icon={CloudRain} color="bg-pink-400" />
                    <SoundControl label="Brown Noise (Deep)" type="brown" icon={Mountain} color="bg-amber-700" />
                    <SoundControl label="Beta Waves (Alert)" type="binauralBeta" icon={Activity} color="bg-blue-500" />
                    <SoundControl label="Theta Waves (Relax)" type="binauralTheta" icon={Volume2} color="bg-purple-500" />
                </div>
             </div>
        </div>
    );
};

export default Soundscapes;
