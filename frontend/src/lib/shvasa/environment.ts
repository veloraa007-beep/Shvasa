import { UserProfile } from './types';

export interface EnvironmentContext {
  greetingContext: string;
  wisdomQuote: { text: string; author: string };
  themeClass: string;
  aiSummary: string | null;
  focusDuration: string;
  focusBreak: string;
  focusEnvironment: string;
  dailyStructure: { morning: string; afternoon: string; evening: string } | null;
}

// Fallback logic until backend AI API is built
export function getTailoredEnvironment(profile: UserProfile | null): EnvironmentContext {
  // Default Environment
  const env: EnvironmentContext = {
    greetingContext: 'Ready to build something great?',
    wisdomQuote: { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
    themeClass: 'bg-surface',
    aiSummary: null,
    focusDuration: '25 min',
    focusBreak: '5 min',
    focusEnvironment: 'silent',
    dailyStructure: null,
  };

  if (!profile) return env;

  // ── Prefer real BLOOM data if already stored ──────────────────────────────
  if (profile.ai_coach_message) {
    env.aiSummary = profile.ai_coach_message;
  }
  if (profile.ai_focus_config) {
    env.focusDuration    = profile.ai_focus_config.duration;
    env.focusBreak       = profile.ai_focus_config.break;
    env.focusEnvironment = profile.ai_focus_config.environment;
  }
  if (profile.ai_daily_structure) {
    env.dailyStructure = profile.ai_daily_structure;
  }

  const workType = (profile.work_type || '').toLowerCase();
  const distractions = (profile.distractions || '').toLowerCase();
  const focusTime = (profile.best_focus_time || '').toLowerCase();
  const goals = (profile.goals || '').toLowerCase();
  const focusProblem = (profile.focus_problem || '').toLowerCase();

  // 1. Tailor Greeting based on Work Type
  if (workType.includes('coding') || workType.includes('engineering')) {
    env.greetingContext = 'Ready to engineer some deep work?';
  } else if (workType.includes('design') || workType.includes('creative')) {
    env.greetingContext = 'Ready to craft something beautiful?';
  } else if (workType.includes('writing') || workType.includes('content')) {
    env.greetingContext = 'Ready to write with clarity?';
  } else if (workType.includes('studying') || workType.includes('academic')) {
    env.greetingContext = 'Ready to expand your knowledge?';
  } else if (workType.includes('management') || workType.includes('strategy')) {
    env.greetingContext = 'Ready to lead with focus?';
  }

  // 2. Tailor Quote based on Distractions
  if (distractions.includes('social media')) {
    env.wisdomQuote = {
      text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
      author: "Thich Nhat Hanh"
    };
  } else if (distractions.includes('burnout') || distractions.includes('overworking')) {
    env.wisdomQuote = {
      text: "Rest is not idleness, and to lie sometimes on the grass under trees is by no means a waste of time.",
      author: "John Lubbock"
    };
  } else if (distractions.includes('planning') || distractions.includes('clarity')) {
    env.wisdomQuote = {
      text: "Do not wait; the time will never be 'just right.' Start where you stand.",
      author: "George Herbert"
    };
  }

  // 3. Tailor Visual Tint based on Best Focus Time
  let timeTheme = 'neutral';
  if (focusTime.includes('early morning')) {
    env.themeClass = 'bg-[linear-gradient(to_bottom,#f4fbf7,#FDFBF7)]';
    timeTheme = 'calm morning';
  } else if (focusTime.includes('late night')) {
    env.themeClass = 'bg-[linear-gradient(to_bottom,#f3eedd,#FDFBF7)]';
    timeTheme = 'deep evening';
  } else if (focusTime.includes('afternoon')) {
    env.themeClass = 'bg-[linear-gradient(to_bottom,#fdfaf0,#FDFBF7)]';
    timeTheme = 'warm afternoon';
  }

  // 4. Generate AI Insight Summary
  // We format their exact inputs into a cohesive paragraph to make it feel analyzed.
  const formatList = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean).map(s => `**${s}**`).join(' and ');
  
  let insight = `I noticed you want to achieve ${formatList(profile.goals) || '**your goals**'}. `;
  if (profile.focus_problem) {
    insight += `Since you struggle with ${formatList(profile.focus_problem)}, `;
  } else {
    insight += `To help you stay on track, `;
  }
  
  insight += `I've tuned your sanctuary with a ${timeTheme} aesthetic. I've also curated wisdom specifically to help you manage distractions like ${formatList(profile.distractions) || '**digital noise**'}. Let's grow.`;

  env.aiSummary = insight;

  return env;
}
