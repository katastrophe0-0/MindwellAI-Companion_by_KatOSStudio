
import React, { useState, useRef, useEffect } from 'react';
import { Activity, Play, Pause, RotateCcw, User, Heart, Zap, Eye, CheckCircle2 } from 'lucide-react';

const EXERCISES = [
    {
        id: 'shake',
        title: 'The Shake',
        icon: Zap,
        duration: 60,
        description: 'Discharge excess energy and tension by shaking your body vigorously.',
        instructions: [
            'Stand up with your feet hip-width apart.',
            'Start shaking your hands and wrists.',
            'Let the movement travel up your arms to your shoulders.',
            'Bounce on your heels and let your whole body shake.',
            'Exhale loudly through your mouth as you shake.'
        ],
        color: 'bg-orange-500'
    },
    {
        id: 'butterfly',
        title: 'Butterfly Hug',
        icon: Heart,
        duration: 120,
        description: 'A bilateral stimulation technique to process stress and calm the amygdala.',
        instructions: [
            'Cross your arms over your chest.',
            'Hook your thumbs together to form a butterfly shape.',
            'Place your fingertips just below your collarbones.',
            'Alternately tap your hands against your chest: left, right, left, right.',
            'Breathe slowly and deeply while tapping.'
        ],
        color: 'bg-pink-500'
    },
    {
        id: 'orienting',
        title: 'Orienting',
        icon: Eye,
        duration: 90,
        description: 'Connect to safety in your environment to engage the parasympathetic system.',
        instructions: [
            'Sit comfortably and let your eyes wander slowly around the room.',
            'Let your gaze rest on an object that is pleasing or neutral.',
            'Slowly turn your head to look behind you, then back.',
            'Name 3 things you can see, 3 things you can hear, 3 things you can touch.',
            'Feel your feet on the floor.'
        ],
        color: 'bg-teal-500'
    },
    {
        id: 'tapping',
        title: 'Basic Tapping',
        icon: User,
        duration: 180,
        description: 'Gentle tapping on acupressure points to reduce cortisol levels.',
        instructions: [
            'Tap the side of your hand (karate chop point) continuously.',
            'Tap the beginning of your eyebrow.',
            'Tap the side of your eye.',
            'Tap under your eye.',
            'Tap under your nose.',
            'Tap your chin.',
            'Tap your collarbone.',
            'Tap under your arm.'
        ],
        color: 'bg-indigo-500'
    }
];

const SomaticExercises: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES[0] | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setTimeout(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setIsCompleted(true);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const startExercise = (exercise: typeof EXERCISES[0]) => {
        setSelectedExercise(exercise);
        setTimeLeft(exercise.duration);
        setIsActive(false);
        setIsCompleted(false);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        if (selectedExercise) {
            setTimeLeft(selectedExercise.duration);
            setIsActive(false);
            setIsCompleted(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (selectedExercise) {
        return (
            <div className="bg-white rounded-lg shadow-md h-full flex flex-col p-6 animate-fade-in">
                <button 
                    onClick={() => setSelectedExercise(null)}
                    className="self-start text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 flex items-center"
                >
                    ← Back to Exercises
                </button>

                <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
                    <div className={`p-4 rounded-full ${selectedExercise.color} text-white mb-6 shadow-lg`}>
                        <selectedExercise.icon className="w-10 h-10" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedExercise.title}</h2>
                    <p className="text-slate-500 text-center mb-8">{selectedExercise.description}</p>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 w-full mb-8">
                        <h3 className="font-bold text-slate-700 mb-4">Instructions</h3>
                        <ul className="space-y-3">
                            {selectedExercise.instructions.map((step, idx) => (
                                <li key={idx} className="flex items-start text-slate-600">
                                    <span className="bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">{idx + 1}</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center w-full">
                        <div className="text-5xl font-mono font-bold text-slate-800 mb-8 tabular-nums">
                            {formatTime(timeLeft)}
                        </div>

                        {isCompleted ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="flex items-center gap-2 text-green-600 font-bold text-xl mb-4">
                                    <CheckCircle2 className="w-6 h-6" /> Completed
                                </div>
                                <button onClick={() => setSelectedExercise(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-colors">
                                    Choose Another
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    onClick={toggleTimer}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 ${isActive ? 'bg-amber-500' : 'bg-indigo-600'}`}
                                >
                                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                                </button>
                                <button 
                                    onClick={resetTimer}
                                    className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-300 transition-transform hover:scale-105"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col p-6 overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-orange-500" /> Somatic Release
                </h2>
                <p className="text-slate-500">Body-based exercises to regulate your nervous system and release tension.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {EXERCISES.map((exercise) => (
                    <div 
                        key={exercise.id}
                        onClick={() => startExercise(exercise)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${exercise.color} text-white`}>
                                <exercise.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase bg-white px-2 py-1 rounded border border-slate-100">
                                {Math.floor(exercise.duration / 60)} min
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{exercise.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {exercise.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SomaticExercises;
