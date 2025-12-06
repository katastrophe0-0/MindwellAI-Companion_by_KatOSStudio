
export enum AppView {
  Dashboard = 'Dashboard',
  Journal = 'Journal',
  Quizzes = 'Quizzes',
  MoodTracker = 'MoodTracker',
  Chatbot = 'Chatbot',
  Companion = 'Companion',
  Strategizer = 'Strategizer',
  Meditation = 'Meditation',
  Breathing = 'Breathing',
  ImageGenerator = 'ImageGenerator',
  VisionBoard = 'VisionBoard',
  Resources = 'Resources',
  Emergency = 'Emergency',
  Settings = 'Settings',
  CycleTracker = 'CycleTracker',
  Astrology = 'Astrology',
  Legal = 'Legal',
  Checkout = 'Checkout',
  GratitudeJar = 'GratitudeJar',
  Soundscapes = 'Soundscapes',
  ThoughtReframer = 'ThoughtReframer',
  SleepStation = 'SleepStation',
  Somatic = 'Somatic',
  Affirmations = 'Affirmations',
}

export type SubscriptionTier = 'free' | 'spark' | 'glow' | 'radiance';

export interface DashboardConfig {
    showQuote: boolean;
    showMoodChart: boolean;
    showHabitTracker: boolean;
    showWellnessPulse: boolean;
    showQuickLinks: boolean;
}

export interface UserProfile {
  name: string;
  avatar?: string; // Emoji char
  goals: string[]; // e.g., 'anxiety', 'sleep', 'focus', 'depression'
  challenges: string[];
  zodiacSign?: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthLocation?: string; // City, Country
  onboardingCompleted: boolean;
  subscriptionTier: SubscriptionTier;
  enableCycleTracking?: boolean;
  enableAstrology?: boolean;
  enableBreathing?: boolean; // Default true
  enableMeditation?: boolean; // Default true
  dashboardConfig?: DashboardConfig;
  lastSynced?: string; // ISO String of last cloud sync
  enableCloudSync?: boolean;
  preferences?: {
    blurJournalPreviews?: boolean;
    enableDailyReminder?: boolean;
    dailyReminderTime?: string;
    privacyMode?: boolean; // Blurs sensitive text globally
    reduceMotion?: boolean;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  values: number[];
}

export interface QuizResult {
  score: number;
  level: string;
  interpretation: string;
}

export interface QuizLog {
  id: number;
  date: string; // ISO String
  quizId: string;
  quizLabel: string;
  score: number;
  maxScore: number;
  level: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface JournalEntry {
  id: number;
  date: string;
  content: string;
  prompt?: string; // For guided journals
  tags?: string[];
  analysis?: string;
  sentiment?: string;
  themes?: string[];
}

export interface MoodLog {
    date: string; // YYYY-MM-DD
    mood: number; // 1-5
    tags?: string[]; // e.g., 'work', 'family', 'sleep'
}

export interface EmergencyPlanItem {
  id: string;
  type: 'contact' | 'activity' | 'mantra';
  label: string; // e.g., "Call Mom", "Box Breathing"
  value: string; // Phone number or description
}

export interface CycleData {
  lastPeriodStart: string; // YYYY-MM-DD
  cycleLength: number; // default 28
  periodLength: number; // default 5
}

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  sunAnalysis: string;
  moonAnalysis: string;
  risingAnalysis: string;
  elementBalance: string;
}
