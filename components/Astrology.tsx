
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, AppView, NatalChart } from '../types';
import { Star, Moon, Sun, Heart, Briefcase, Smile, Sparkles, Loader2, ArrowRight, MapPin, Calendar, Clock, Globe, Users, Flame } from 'lucide-react';

interface HoroscopeData {
  mood: string;
  lucky_color: string;
  lucky_number: string;
  love: string;
  career: string;
  wellness: string;
  quote: string;
  transits: string;
}

interface CompatibilityData {
  score: number;
  summary: string;
  relationship_dynamics: string;
  challenges: string;
}

interface AstrologyProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  setActiveView: (view: AppView) => void;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const Astrology: React.FC<AstrologyProps> = ({ userProfile, onUpdateProfile, setActiveView }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'chart' | 'compatibility'>('daily');
  
  // Data State
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null);
  
  // Form State
  const [date, setDate] = useState(userProfile?.birthDate || '');
  const [time, setTime] = useState(userProfile?.birthTime || '');
  const [location, setLocation] = useState(userProfile?.birthLocation || '');
  const [partnerSign, setPartnerSign] = useState(ZODIAC_SIGNS[0]);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if profile is complete enough for accurate reading
  const hasBirthData = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthLocation;

  useEffect(() => {
    // If we have data, try to load cached content
    if (hasBirthData) {
        const today = new Date().toISOString().split('T')[0];
        
        // Load Daily
        const cachedHoroscope = localStorage.getItem(`horoscope_${today}`);
        if (cachedHoroscope) {
            setHoroscope(JSON.parse(cachedHoroscope));
        } else {
            generateHoroscope();
        }

        // Load Chart
        const cachedChart = localStorage.getItem('natalChart');
        if (cachedChart) {
            setNatalChart(JSON.parse(cachedChart));
        } else {
            generateNatalChart();
        }
    }
  }, [hasBirthData, userProfile]);

  const handleSaveProfile = () => {
      if (date && time && location) {
          onUpdateProfile({
              birthDate: date,
              birthTime: time,
              birthLocation: location
          });
      } else {
          setError("Please fill in all fields (Date, Time, Location) for an accurate 100% real reading.");
      }
  };

  const generateHoroscope = async () => {
      if (!userProfile?.birthDate) return;
      
      setLoading(true);
      setError('');
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
          
          const prompt = `Generate a highly personalized daily horoscope for ${today}.
          User Birth Data:
          Date: ${userProfile.birthDate}
          Time: ${userProfile.birthTime}
          Location: ${userProfile.birthLocation}
          
          Analyze specific planetary transits affecting this person's chart today.
          Return JSON with keys: mood, lucky_color, lucky_number, love, career, wellness, quote, transits (brief explanation of 1 key transit).
          Keep tone mystical but grounded.`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      mood: { type: Type.STRING },
                      lucky_color: { type: Type.STRING },
                      lucky_number: { type: Type.STRING },
                      love: { type: Type.STRING },
                      career: { type: Type.STRING },
                      wellness: { type: Type.STRING },
                      quote: { type: Type.STRING },
                      transits: { type: Type.STRING, description: "A brief sentence about a key planetary movement affecting them today." },
                    },
                    required: ["mood", "lucky_color", "lucky_number", "love", "career", "wellness", "quote", "transits"],
                  },
              }
          });

          const data: HoroscopeData = JSON.parse(response.text);
          setHoroscope(data);
          
          const dateKey = new Date().toISOString().split('T')[0];
          localStorage.setItem(`horoscope_${dateKey}`, JSON.stringify(data));

      } catch (error) {
          console.error("Failed to generate horoscope", error);
          setError("Unable to connect to the cosmos. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const generateNatalChart = async () => {
     if (!userProfile?.birthDate) return;

      setLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          
          const prompt = `Calculate and interpret the natal chart for a person born on:
          Date: ${userProfile.birthDate}
          Time: ${userProfile.birthTime}
          Location: ${userProfile.birthLocation}
          
          Identify the Sun, Moon, and Rising (Ascendant) signs.
          Provide a 1-sentence analysis for each.
          Provide a 1-sentence summary of their elemental balance (Fire, Earth, Air, Water).
          Return JSON.`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      sunSign: { type: Type.STRING },
                      moonSign: { type: Type.STRING },
                      risingSign: { type: Type.STRING },
                      sunAnalysis: { type: Type.STRING },
                      moonAnalysis: { type: Type.STRING },
                      risingAnalysis: { type: Type.STRING },
                      elementBalance: { type: Type.STRING },
                    },
                    required: ["sunSign", "moonSign", "risingSign", "sunAnalysis", "moonAnalysis", "risingAnalysis", "elementBalance"],
                  },
              }
          });

          const data: NatalChart = JSON.parse(response.text);
          setNatalChart(data);
          localStorage.setItem('natalChart', JSON.stringify(data));

      } catch (error) {
          console.error("Failed to generate natal chart", error);
      } finally {
          setLoading(false);
      }
  };

  const generateCompatibility = async () => {
      if (!natalChart?.sunSign) return;
      setLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const prompt = `Analyze the astrological compatibility between a ${natalChart.sunSign} (User) and a ${partnerSign} (Partner).
          Return JSON with keys: score (number 1-100), summary (short overview), relationship_dynamics (positive aspects), challenges (potential friction points).`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          score: { type: Type.NUMBER },
                          summary: { type: Type.STRING },
                          relationship_dynamics: { type: Type.STRING },
                          challenges: { type: Type.STRING },
                      },
                      required: ["score", "summary", "relationship_dynamics", "challenges"]
                  }
              }
          });
          setCompatibility(JSON.parse(response.text));
      } catch (error) {
          console.error("Compatibility error", error);
          setError("Stars are cloudy. Try again.");
      } finally {
          setLoading(false);
      }
  };

  if (!hasBirthData) {
      return (
          <div className="bg-white rounded-lg shadow-md h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-y-auto">
              <div className="bg-indigo-100 p-4 rounded-full mb-6 relative">
                  <Star className="w-12 h-12 text-indigo-600" />
                  <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Unlock Your Cosmic Blueprint</h2>
              <p className="text-slate-500 mb-8 max-w-md">To provide a 100% real and accurate reading, we need your precise birth details. This allows us to map the stars exactly as they were when you arrived.</p>
              
              <div className="w-full max-w-sm space-y-4 text-left">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Birth Date</label>
                      <div className="relative">
                          <input 
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800"
                          />
                          <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Birth Time</label>
                      <div className="relative">
                          <input 
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800"
                          />
                          <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Birth Location</label>
                      <div className="relative">
                          <input 
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="City, Country"
                              className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800"
                          />
                          <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                      </div>
                  </div>

                  {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2"><Flame className="w-4 h-4"/>{error}</div>}

                  <button 
                      onClick={handleSaveProfile}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg mt-2"
                  >
                      Reveal My Chart
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-4">Your data is stored locally and used only for astrology calculations.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 border-b border-slate-200 text-white relative overflow-hidden bg-cover bg-center shrink-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop')` }}
      >
          <div className="absolute inset-0 bg-indigo-900/70 backdrop-blur-sm"></div>
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Moon className="w-6 h-6 text-yellow-300" />
                        Cosmic Insights
                    </h2>
                    {natalChart && <p className="text-indigo-200 text-sm font-medium mt-1">Sun in {natalChart.sunSign} • Moon in {natalChart.moonSign}</p>}
                 </div>
                 <button onClick={() => setActiveView(AppView.Settings)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition-colors backdrop-blur-md">
                     Edit Birth Data
                 </button>
             </div>
             
             <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur-md w-fit overflow-x-auto">
                 <button 
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'daily' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-white/10'}`}
                 >
                    Daily Forecast
                 </button>
                 <button 
                    onClick={() => setActiveTab('chart')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'chart' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-white/10'}`}
                 >
                    Natal Chart
                 </button>
                 <button 
                    onClick={() => setActiveTab('compatibility')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'compatibility' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:bg-white/10'}`}
                 >
                    Compatibility
                 </button>
             </div>
          </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-auto p-6">
          {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[300px]">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600"/>
                  <p>Consulting the stars...</p>
              </div>
          ) : error ? (
              <div className="text-center text-slate-500 mt-10 p-6 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 font-medium mb-2">Cosmic Connection Error</p>
                  <p>{error}</p>
                  <button onClick={() => setError('')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Dismiss</button>
              </div>
          ) : (
              <>
                {activeTab === 'daily' && horoscope && (
                    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                        {/* Transit Alert */}
                        <div className="bg-indigo-900 text-indigo-100 p-4 rounded-xl shadow-sm flex items-start gap-3 border border-indigo-800">
                            <Globe className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-indigo-300 mb-1">Current Transit</h4>
                                <p className="text-sm">{horoscope.transits}</p>
                            </div>
                        </div>

                        {/* Overview Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mood</span>
                                <span className="text-indigo-600 font-bold text-sm sm:text-base">{horoscope.mood}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Power Color</span>
                                <span className="text-pink-500 font-bold text-sm sm:text-base">{horoscope.lucky_color}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lucky #</span>
                                <span className="text-teal-500 font-bold text-xl">{horoscope.lucky_number}</span>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-pink-400">
                                <h3 className="flex items-center text-lg font-bold text-slate-800 mb-3">
                                    <Heart className="w-5 h-5 mr-2 text-pink-500" /> Love
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{horoscope.love}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-400">
                                <h3 className="flex items-center text-lg font-bold text-slate-800 mb-3">
                                    <Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Career
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{horoscope.career}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-400">
                                <h3 className="flex items-center text-lg font-bold text-slate-800 mb-3">
                                    <Smile className="w-5 h-5 mr-2 text-green-500" /> Wellness
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{horoscope.wellness}</p>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl text-center">
                            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-slate-700 italic font-medium">"{horoscope.quote}"</p>
                        </div>
                    </div>
                )}

                {activeTab === 'chart' && natalChart && (
                    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Your Primal Triad</h3>
                            <p className="text-slate-500 text-sm mb-6">The three most significant pillars of your personality.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                        <Sun className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Sun Sign</span>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">{natalChart.sunSign}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{natalChart.sunAnalysis}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <Moon className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Moon Sign</span>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">{natalChart.moonSign}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{natalChart.moonAnalysis}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                                        <ArrowRight className="w-8 h-8 text-indigo-500 -rotate-45" />
                                    </div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Rising Sign</span>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">{natalChart.risingSign}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{natalChart.risingAnalysis}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-indigo-300"/> Elemental Balance</h4>
                            <p className="text-indigo-100 text-sm leading-relaxed opacity-90">{natalChart.elementBalance}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'compatibility' && natalChart && (
                   <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                             <h3 className="text-xl font-bold text-slate-800 mb-6">Cosmic Compatibility Matcher</h3>
                             
                             <div className="flex items-center justify-center gap-4 mb-8">
                                 <div className="flex flex-col items-center">
                                     <span className="text-xs font-bold text-slate-400 mb-2 uppercase">You</span>
                                     <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-100">
                                         {natalChart.sunSign}
                                     </div>
                                 </div>
                                 
                                 <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
                                 
                                 <div className="flex flex-col items-center">
                                     <span className="text-xs font-bold text-slate-400 mb-2 uppercase">Partner</span>
                                     <select 
                                        value={partnerSign} 
                                        onChange={(e) => setPartnerSign(e.target.value)}
                                        className="w-20 h-20 rounded-full flex items-center justify-center text-center font-bold text-sm border-2 border-indigo-100 bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                     >
                                        {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                                     </select>
                                 </div>
                             </div>

                             <button 
                                onClick={generateCompatibility}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold rounded-full hover:shadow-lg transition-all transform hover:scale-105"
                             >
                                 Analyze Connection
                             </button>
                        </div>

                        {compatibility && (
                            <div className="space-y-4 animate-fade-in">
                                 <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-pink-500 flex items-center gap-6">
                                     <div className="relative w-20 h-20 flex-shrink-0">
                                         <svg className="w-full h-full transform -rotate-90">
                                             <circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                                             <circle cx="40" cy="40" r="36" stroke="#ec4899" strokeWidth="8" fill="none" strokeDasharray={`${compatibility.score * 2.26} 226`} />
                                         </svg>
                                         <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-slate-800">
                                             {compatibility.score}%
                                         </div>
                                     </div>
                                     <div>
                                         <h4 className="text-lg font-bold text-slate-800 mb-1">Compatibility Score</h4>
                                         <p className="text-slate-600 text-sm">{compatibility.summary}</p>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                         <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Dynamics</h4>
                                         <p className="text-sm text-green-700">{compatibility.relationship_dynamics}</p>
                                     </div>
                                     <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                                         <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><Flame className="w-4 h-4"/> Challenges</h4>
                                         <p className="text-sm text-orange-700">{compatibility.challenges}</p>
                                     </div>
                                 </div>
                            </div>
                        )}
                   </div>
                )}
              </>
          )}
      </div>
      
      {/* Footer Info */}
      <div className="p-2 bg-slate-50 text-center border-t border-slate-200">
          <p className="text-[10px] text-slate-400">Calculations based on provided birth data. For entertainment purposes only.</p>
      </div>
    </div>
  );
};

// Helper component for icon used above
const Activity: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default Astrology;
