
import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, X, Heart, Calendar } from 'lucide-react';

interface GratitudeNote {
    id: number;
    text: string;
    date: string;
    color: string;
    rotation: number;
}

const COLORS = [
    'bg-yellow-200 text-yellow-800',
    'bg-pink-200 text-pink-800',
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-purple-200 text-purple-800',
    'bg-orange-200 text-orange-800'
];

const GratitudeJar: React.FC = () => {
    const [notes, setNotes] = useState<GratitudeNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<GratitudeNote | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('gratitudeNotes');
        if (saved) {
            setNotes(JSON.parse(saved));
        }
    }, []);

    const addNote = () => {
        if (!newNote.trim()) return;
        
        const note: GratitudeNote = {
            id: Date.now(),
            text: newNote,
            date: new Date().toLocaleDateString(),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.floor(Math.random() * 20) - 10 // Random rotation between -10 and 10 deg
        };

        const updated = [note, ...notes];
        setNotes(updated);
        localStorage.setItem('gratitudeNotes', JSON.stringify(updated));
        setNewNote('');
        setIsInputOpen(false);
    };

    const deleteNote = (id: number) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        localStorage.setItem('gratitudeNotes', JSON.stringify(updated));
        if (selectedNote?.id === id) setSelectedNote(null);
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
            
            <div className="p-6 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Heart className="w-6 h-6 mr-2 text-pink-500 fill-pink-500" /> Gratitude Jar
                    </h2>
                    <p className="text-slate-500 text-sm">Capture small moments of joy.</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm text-sm font-semibold text-slate-600">
                    {notes.length} Memories Collected
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 z-10">
                {/* The Jar Visual */}
                <div className="relative w-64 h-80 md:w-80 md:h-96 bg-white/20 backdrop-blur-md border-4 border-white/40 rounded-[3rem] shadow-2xl flex items-end justify-center overflow-hidden transition-all duration-500 hover:shadow-indigo-200/50 hover:scale-[1.02] cursor-pointer" onClick={() => setIsInputOpen(true)}>
                    {/* Jar Lid Highlights */}
                    <div className="absolute top-0 w-full h-4 bg-white/30 border-b border-white/20"></div>
                    <div className="absolute top-4 w-[90%] left-[5%] h-2 bg-white/10 rounded-b-xl"></div>
                    
                    {/* Glass Reflection */}
                    <div className="absolute top-10 left-4 w-4 h-64 bg-gradient-to-b from-white/40 to-transparent rounded-full transform -rotate-3 filter blur-sm"></div>

                    {/* Notes Inside */}
                    <div className="w-full h-full p-6 flex flex-col-reverse flex-wrap content-center gap-2 overflow-hidden relative">
                        {notes.slice(0, 15).map((note, i) => (
                            <div 
                                key={note.id}
                                className={`w-12 h-12 md:w-16 md:h-16 ${note.color} rounded shadow-md border border-black/5 transform transition-transform hover:scale-110 cursor-pointer animate-fade-in`}
                                style={{ transform: `rotate(${note.rotation}deg)` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedNote(note); }}
                            >
                                <div className="w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Add Button Floating */}
                <button 
                    onClick={() => setIsInputOpen(true)}
                    className="absolute bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 z-20"
                >
                    <Plus className="w-8 h-8" />
                </button>
            </div>

            {/* Input Modal */}
            {isInputOpen && (
                <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Add to your jar</h3>
                            <button onClick={() => setIsInputOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <textarea 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="I am grateful for..."
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-lg text-slate-700 mb-4"
                            autoFocus
                        />
                        <button 
                            onClick={addNote}
                            disabled={!newNote.trim()}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            Drop in Jar
                        </button>
                    </div>
                </div>
            )}

            {/* View Note Modal */}
            {selectedNote && (
                <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedNote(null)}>
                    <div className={`rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100 relative ${selectedNote.color}`} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 text-black/40 hover:text-black/70">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 mb-4 text-black/50 text-sm font-bold uppercase tracking-wider">
                            <Calendar className="w-4 h-4" /> {selectedNote.date}
                        </div>
                        <p className="text-2xl font-serif leading-relaxed text-black/80 text-center py-4">
                            "{selectedNote.text}"
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button 
                                onClick={() => deleteNote(selectedNote.id)}
                                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                            >
                                Remove Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GratitudeJar;
