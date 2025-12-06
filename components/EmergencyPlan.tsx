
import React, { useState, useEffect } from 'react';
import { Phone, Heart, Activity, Plus, Trash2, AlertOctagon } from 'lucide-react';
import { EmergencyPlanItem } from '../types';

const DEFAULT_ITEMS: EmergencyPlanItem[] = [
    { id: '1', type: 'contact', label: 'Crisis Lifeline', value: '988' },
    { id: '2', type: 'mantra', label: 'Coping Statement', value: 'This feeling is temporary. I am safe.' },
    { id: '3', type: 'activity', label: 'Calming Action', value: 'Drink a glass of cold water.' }
];

const EmergencyPlan: React.FC = () => {
    const [items, setItems] = useState<EmergencyPlanItem[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newItem, setNewItem] = useState<Partial<EmergencyPlanItem>>({ type: 'contact', label: '', value: '' });

    useEffect(() => {
        const saved = localStorage.getItem('emergencyPlan');
        if (saved) {
            setItems(JSON.parse(saved));
        } else {
            setItems(DEFAULT_ITEMS);
        }
    }, []);

    const saveItems = (newItems: EmergencyPlanItem[]) => {
        setItems(newItems);
        localStorage.setItem('emergencyPlan', JSON.stringify(newItems));
    };

    const handleAddItem = () => {
        if (newItem.label && newItem.value) {
            const item: EmergencyPlanItem = {
                id: Date.now().toString(),
                type: newItem.type as any,
                label: newItem.label!,
                value: newItem.value!
            };
            saveItems([...items, item]);
            setNewItem({ type: 'contact', label: '', value: '' });
            setIsEditing(false);
        }
    };

    const handleDelete = (id: string) => {
        saveItems(items.filter(i => i.id !== id));
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'contact': return <Phone className="w-5 h-5 text-green-500"/>;
            case 'mantra': return <Heart className="w-5 h-5 text-pink-500"/>;
            case 'activity': return <Activity className="w-5 h-5 text-blue-500"/>;
            default: return <Activity className="w-5 h-5"/>;
        }
    };

    const getInputPlaceholder = (field: 'label' | 'value') => {
        switch (newItem.type) {
            case 'contact':
                return field === 'label' ? "Name (e.g., Mom, Best Friend)" : "Phone Number (e.g., 555-0123)";
            case 'mantra':
                return field === 'label' ? "Title (e.g., Anxiety Relief)" : "Mantra Text (e.g., I am calm)";
            default:
                return field === 'label' ? "Activity Name" : "Description / Instructions";
        }
    };

    const getInputLabel = (field: 'label' | 'value') => {
        switch (newItem.type) {
            case 'contact':
                return field === 'label' ? "Contact Name" : "Phone Number";
            case 'mantra':
                return field === 'label' ? "Title" : "Mantra";
            default:
                return field === 'label' ? "Label" : "Value";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col p-6">
            <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <AlertOctagon className="w-7 h-7 mr-2"/> Emergency Coping Plan
                    </h2>
                    <p className="text-slate-500 text-sm">Your personal toolkit for difficult moments.</p>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="text-indigo-600 text-sm font-bold hover:underline">
                    {isEditing ? 'Done' : 'Edit Plan'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-center p-4 bg-slate-50 rounded-xl border-l-4 border-slate-300 hover:shadow-md transition-shadow">
                        <div className="mr-4 p-3 bg-white rounded-full shadow-sm">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-800">{item.label}</p>
                            {item.type === 'contact' ? (
                                <a href={`tel:${item.value}`} className="text-indigo-600 font-mono text-lg font-bold hover:underline">{item.value}</a>
                            ) : (
                                <p className="text-slate-600">{item.value}</p>
                            )}
                        </div>
                        {isEditing && (
                            <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500 p-2">
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 animate-fade-in">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">Add New Item</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Item Type</label>
                                <select 
                                    value={newItem.type} 
                                    onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                                    className="w-full p-2 rounded border bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="contact">Contact (Friend, Family, Helpline)</option>
                                    <option value="activity">Calming Activity</option>
                                    <option value="mantra">Mantra / Reminder</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">{getInputLabel('label')}</label>
                                <input 
                                    type="text" 
                                    placeholder={getInputPlaceholder('label')} 
                                    value={newItem.label}
                                    onChange={e => setNewItem({...newItem, label: e.target.value})}
                                    className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">{getInputLabel('value')}</label>
                                <input 
                                    type={newItem.type === 'contact' ? "tel" : "text"} 
                                    placeholder={getInputPlaceholder('value')}
                                    value={newItem.value}
                                    onChange={e => setNewItem({...newItem, value: e.target.value})}
                                    className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <button 
                                onClick={handleAddItem} 
                                disabled={!newItem.label || !newItem.value}
                                className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-4 h-4 inline mr-1"/> Add Item
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-red-800 font-bold mb-2">Immediate Help</p>
                <a href="tel:988" className="block w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                    Call 988 (Suicide & Crisis Lifeline)
                </a>
            </div>
        </div>
    );
};

export default EmergencyPlan;
