
import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, SubscriptionTier } from './types';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Quizzes from './components/Quizzes';
import Chatbot from './components/Chatbot';
import MindfulCompanion from './components/MindfulCompanion';
import CopingStrategizer from './components/CopingStrategizer';
import VisionBoardCreator from './components/VisionBoardCreator';
import ImageGenerator from './components/ImageGenerator';
import ResourceFinder from './components/ResourceFinder';
import GuidedMeditation from './components/GuidedMeditation';
import BreathingExercise from './components/BreathingExercise';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import EmergencyPlan from './components/EmergencyPlan';
import CycleTracker from './components/CycleTracker';
import Astrology from './components/Astrology';
import Legal from './components/Legal';
import Checkout from './components/Checkout';
import GratitudeJar from './components/GratitudeJar';
import Soundscapes from './components/Soundscapes';
import MoodTracker from './components/MoodTracker';
import ThoughtReframer from './components/ThoughtReframer';
import SleepStation from './components/SleepStation';
import SomaticExercises from './components/SomaticExercises';
import AffirmationDeck from './components/AffirmationDeck';
import { ExternalAdBanner, HouseAd } from './components/AdSpaces';
import { 
    LayoutDashboard, BookHeart, BrainCircuit, BotMessageSquare, Mic, Lightbulb, 
    Clapperboard, Image, Library, Waves, SlidersHorizontal, 
    Wind, AlertOctagon, Droplet, Star, Heart, Volume2, BarChart3, 
    RefreshCw, Moon, Activity, Sparkles, Menu, X, Zap, Crown, Lock
} from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.Dashboard);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const disclaimerSeen = localStorage.getItem('disclaimerSeen');
    if (!disclaimerSeen) {
      setShowDisclaimer(true);
    }
    
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleDisclaimerAccept = () => {
      localStorage.setItem('disclaimerSeen', 'true');
      setShowDisclaimer(false);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
      // Initialize with free tier on onboarding completion
      const profileWithTier = { ...profile, subscriptionTier: 'free' as SubscriptionTier };
      localStorage.setItem('userProfile', JSON.stringify(profileWithTier));
      setUserProfile(profileWithTier);
      setActiveView(AppView.Dashboard);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
      if (!userProfile) return;
      const updated = { ...userProfile, ...updates };
      setUserProfile(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
  };

  const handleUpgrade = () => {
      setActiveView(AppView.Checkout);
  };

  const handleCheckoutComplete = (tier: SubscriptionTier) => {
      handleUpdateProfile({ subscriptionTier: tier });
      setActiveView(AppView.Settings);
  };

  const checkAccess = (requiredTier: 'free' | 'spark' | 'glow' | 'radiance') => {
      const tiers = ['free', 'spark', 'glow', 'radiance'];
      const userTierIndex = tiers.indexOf(userProfile?.subscriptionTier || 'free');
      const requiredTierIndex = tiers.indexOf(requiredTier);
      return userTierIndex >= requiredTierIndex;
  };

  const NavItem = ({ view, icon: Icon, label, requiredTier = 'free' }: { view: AppView, icon: any, label: string, requiredTier?: 'free' | 'spark' | 'glow' | 'radiance' }) => {
      const hasAccess = checkAccess(requiredTier);
      let BadgeIcon = null;
      let badgeColor = '';

      if (!hasAccess) {
          BadgeIcon = Lock;
          badgeColor = 'text-slate-400';
          if (requiredTier === 'spark') { BadgeIcon = Zap; badgeColor = 'text-amber-400'; }
          if (requiredTier === 'glow') { BadgeIcon = Sparkles; badgeColor = 'text-indigo-400'; }
          if (requiredTier === 'radiance') { BadgeIcon = Crown; badgeColor = 'text-purple-400'; }
      }

      return (
        <button 
            onClick={() => { setActiveView(view); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeView === view ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-white/60 hover:shadow-md'}`}
        >
            <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${activeView === view ? 'hidden' : 'block'}`}></div>
            <Icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${activeView === view ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
            <span className="font-medium flex-1 text-left relative z-10">{label}</span>
            {!hasAccess && BadgeIcon && <BadgeIcon className={`w-3 h-3 ${badgeColor} relative z-10`} />}
        </button>
      );
  };

  if (showDisclaimer) {
      return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl border border-white/50">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertOctagon className="text-red-500 fill-red-50"/> Important Disclaimer
                  </h2>
                  <div className="prose prose-sm text-slate-600 mb-6 leading-relaxed">
                      <p><strong>MindWell AI Companion is not a medical device.</strong></p>
                      <p>The content, AI responses, and tools provided are for informational, self-help, and psychoeducational purposes only. They are not intended to diagnose, treat, cure, or prevent any mental health condition.</p>
                      <p>If you are in crisis or experiencing a medical emergency, please call emergency services (911 in the US) or the Suicide & Crisis Lifeline (988) immediately.</p>
                  </div>
                  <button onClick={handleDisclaimerAccept} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02]">
                      I Understand & Agree
                  </button>
              </div>
          </div>
      );
  }

  if (!userProfile) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const currentTier = userProfile.subscriptionTier;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans text-slate-800">
        {/* Ambient Background Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{ animationDelay: '4s' }}></div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-40 flex items-center justify-between px-4 shadow-sm">
            <h1 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <BrainCircuit className="text-indigo-600"/> MindWell
            </h1>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`
            fixed md:static inset-y-0 left-0 z-30 w-72 bg-white/60 backdrop-blur-xl border-r border-white/50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="p-6 hidden md:flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-300">
                    <BrainCircuit className="w-6 h-6"/>
                 </div>
                 <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">MindWell</span>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar pt-20 md:pt-4">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Home</p>
                    <NavItem view={AppView.Dashboard} icon={LayoutDashboard} label="Dashboard" />
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Tools</p>
                    <NavItem view={AppView.Journal} icon={BookHeart} label="Journal" />
                    {/* Free Features */}
                    <NavItem view={AppView.MoodTracker} icon={BarChart3} label="Mood Tracker" />
                    <NavItem view={AppView.GratitudeJar} icon={Heart} label="Gratitude Jar" />
                    <NavItem view={AppView.Affirmations} icon={Sparkles} label="Affirmations" />
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Support & Growth</p>
                    {/* Premium / Gated Features */}
                    <NavItem view={AppView.Chatbot} icon={BotMessageSquare} label="AI Support Chat" requiredTier="glow" />
                    <NavItem view={AppView.Companion} icon={Mic} label="Voice Companion" requiredTier="glow" />
                    <NavItem view={AppView.ThoughtReframer} icon={RefreshCw} label="Thought Reframer" requiredTier="glow" />
                    <NavItem view={AppView.Strategizer} icon={Lightbulb} label="Coping Strategizer" requiredTier="radiance" />
                    <NavItem view={AppView.Quizzes} icon={Activity} label="Assessments" />
                    <NavItem view={AppView.Emergency} icon={AlertOctagon} label="Emergency Plan" />
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Calm & Body</p>
                    <NavItem view={AppView.Breathing} icon={Wind} label="Breathing" />
                    <NavItem view={AppView.Meditation} icon={Waves} label="Meditation" />
                    <NavItem view={AppView.Somatic} icon={Activity} label="Somatic Exercises" />
                    <NavItem view={AppView.Soundscapes} icon={Volume2} label="Soundscapes" />
                    <NavItem view={AppView.SleepStation} icon={Moon} label="Sleep Station" requiredTier="radiance" />
                </div>

                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Creative & Personal</p>
                    <NavItem view={AppView.ImageGenerator} icon={Image} label="Calming Images" requiredTier="radiance" />
                    <NavItem view={AppView.VisionBoard} icon={Clapperboard} label="Vision Board" requiredTier="radiance" />
                    {/* Now Free */}
                    <NavItem view={AppView.CycleTracker} icon={Droplet} label="Cycle Tracker" />
                    <NavItem view={AppView.Astrology} icon={Star} label="Horoscope" />
                    <NavItem view={AppView.Resources} icon={Library} label="Resources" />
                </div>
            </div>

            {/* House Ad for Self Marketing */}
            <HouseAd onUpgrade={handleUpgrade} currentTier={currentTier} />

            <div className="p-4 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
                <NavItem view={AppView.Settings} icon={SlidersHorizontal} label="Settings" />
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-hidden relative pt-16 md:pt-0 z-10 flex flex-col">
            <div className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth">
                {activeView === AppView.Dashboard && <Dashboard setActiveView={setActiveView} userProfile={userProfile} />}
                {activeView === AppView.Journal && <Journal isPremium={checkAccess('spark')} setActiveView={setActiveView} userProfile={userProfile} />}
                {activeView === AppView.Quizzes && <Quizzes />}
                
                {/* Feature Components with Tier Gates */}
                {activeView === AppView.MoodTracker && <MoodTracker />}
                {activeView === AppView.Chatbot && <Chatbot subscriptionTier={currentTier} setActiveView={setActiveView} userProfile={userProfile} />}
                {activeView === AppView.Companion && <MindfulCompanion subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.ThoughtReframer && <ThoughtReframer subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.Strategizer && <CopingStrategizer subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.SleepStation && <SleepStation subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.ImageGenerator && <ImageGenerator subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.VisionBoard && <VisionBoardCreator subscriptionTier={currentTier} setActiveView={setActiveView} />}
                {activeView === AppView.CycleTracker && <CycleTracker />}
                {activeView === AppView.Affirmations && <AffirmationDeck subscriptionTier={currentTier} setActiveView={setActiveView} userProfile={userProfile} />}

                {activeView === AppView.Meditation && <GuidedMeditation />}
                {activeView === AppView.Breathing && <BreathingExercise />}
                {activeView === AppView.Somatic && <SomaticExercises />}
                {activeView === AppView.Resources && <ResourceFinder />}
                {activeView === AppView.Emergency && <EmergencyPlan />}
                {activeView === AppView.Settings && <Settings isPremium={checkAccess('spark')} onUpgrade={handleUpgrade} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} setActiveView={setActiveView} />}
                {activeView === AppView.Astrology && <Astrology userProfile={userProfile} onUpdateProfile={handleUpdateProfile} setActiveView={setActiveView} />}
                {activeView === AppView.Legal && <Legal setActiveView={setActiveView} />}
                {activeView === AppView.Checkout && <Checkout onComplete={handleCheckoutComplete} onCancel={() => setActiveView(AppView.Settings)} />}
                {activeView === AppView.GratitudeJar && <GratitudeJar />}
                {activeView === AppView.Soundscapes && <Soundscapes />}
                
                {/* External Ad Space (Bottom of content) */}
                <ExternalAdBanner />
            </div>
        </main>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
    </div>
  );
};

export default App;
