
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, UserProfile, AppView, SubscriptionTier } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { SendHorizonal, Bot, Star, Mic, AlertCircle } from 'lucide-react';
import PremiumLock from './PremiumLock';

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

const Chatbot: React.FC<{ subscriptionTier: SubscriptionTier; setActiveView: (view: AppView) => void; userProfile: UserProfile | null }> = ({ subscriptionTier, setActiveView, userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasAccess = subscriptionTier === 'glow' || subscriptionTier === 'radiance';

  useEffect(() => {
    if (!hasAccess) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => setInput(event.results[0][0].transcript);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [hasAccess]);

  useEffect(() => {
    if (!hasAccess) return;

    const initializeChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        let loadedHistory: ChatMessage[] = [];
        
        // Chat history is available for Glow+
        const storedHistory = localStorage.getItem('chatHistory');
        if (storedHistory) {
            try {
                loadedHistory = JSON.parse(storedHistory);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
        
        const geminiHistory = loadedHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let systemInstruction = "You are a friendly, empathetic mental health companion. I'm here to support you on your mental wellness journey. Your goal is to listen actively, validate feelings, and offer gentle support. Use Socratic questioning to help reframe thoughts, but ensure your tone remains warm and encouraging, not clinical. Do NOT provide medical diagnoses. Keep responses concise and conversational.";

        if (userProfile) {
            const goals = userProfile.goals && userProfile.goals.length > 0 ? userProfile.goals.join(', ') : 'general well-being';
            const challenges = userProfile.challenges && userProfile.challenges.length > 0 ? userProfile.challenges.join(', ') : 'daily stressors';
            systemInstruction = `The user's name is ${userProfile.name}. Their goals are: ${goals}. Their current challenges are: ${challenges}. ${systemInstruction}`;
        }

        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: geminiHistory,
          config: {
            systemInstruction: systemInstruction,
          },
        });
        setChat(chatSession);

        if (loadedHistory.length > 0) {
            setMessages(loadedHistory);
        } else {
            let welcomeMsg = "Hello! I'm here to listen. How are you feeling today?";
            
            if (userProfile?.name) {
                const goalMap: Record<string, string> = {
                    'anxiety': 'manage anxiety',
                    'sleep': 'improve sleep',
                    'focus': 'improve focus',
                    'mood': 'uplift your mood',
                    'stress': 'reduce stress'
                };
                
                const goals = userProfile.goals || [];
                if (goals.length > 0) {
                     const mappedGoals = goals.slice(0, 2).map(g => goalMap[g] || g);
                     const goalText = mappedGoals.join(' and ');
                     welcomeMsg = `Hi ${userProfile.name}, I'm here to help you ${goalText}. How are you feeling right now?`;
                } else {
                     welcomeMsg = `Hi ${userProfile.name}, I'm here to support your mental wellness. How are you feeling right now?`;
                }
            }
            setMessages([{ sender: 'bot', text: welcomeMsg }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting to the server. Please check your internet connection and refresh the page." }]);
      }
    };
    initializeChat();
  }, [hasAccess, userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if(hasAccess && messages.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages, hasAccess]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !chat) return;
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: input });
      let botResponse = '';
      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      for await (const chunk of responseStream) {
        botResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = botResponse;
            return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "I couldn't send your message. Please check your internet connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  if (!hasAccess) {
      return <PremiumLock setActiveView={setActiveView} featureName="AI Support Chat" requiredTier="glow" currentTier={subscriptionTier} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Supportive Chat</h2>
        {isListening && <span className="text-xs text-red-500 animate-pulse font-bold">Listening...</span>}
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.text.includes('trouble connecting') ? 'bg-red-100' : 'bg-indigo-500'}`}>
                    {msg.text.includes('trouble connecting') ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
            )}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-center gap-2">
           {speechRecognitionSupported && (
              <button onClick={handleMicClick} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Mic className="w-5 h-5" />
              </button>
            )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 p-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
