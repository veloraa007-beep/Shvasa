'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, HelpCircle, Loader2, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Question definitions ──────────────────────────────────────────────────────

const steps = [
  {
    id: 'display_name',
    title: 'Welcome to Shvasa',
    subtitle: 'What should we call you?',
    type: 'input',
    placeholder: 'Your name',
  },
  {
    id: 'primary_language',
    title: 'Your Language',
    subtitle: 'What language do you prefer to think and work in?',
    type: 'input',
    placeholder: 'e.g. English, Spanish, Hindi...',
  },
  {
    id: 'work_type',
    title: 'Your Craft',
    subtitle: 'What type of work do you mostly do? (Select up to 2)',
    options: ['Coding / Engineering', 'Design / Creative', 'Writing / Content', 'Management / Strategy', 'Studying / Academic', 'Other'],
    multiple: true,
    allowUnsure: true,
  },
  {
    id: 'focus_problem',
    title: 'The Challenge',
    subtitle: 'What is your biggest struggle with focus right now? (Select up to 2)',
    options: ['Procrastination', 'Burnout & Fatigue', 'Lack of Clarity', 'Constant Interruptions'],
    multiple: true,
    allowUnsure: true,
  },
  {
    id: 'distractions',
    title: 'Identify the Noise',
    subtitle: 'What distracts you the most? (Select up to 2)',
    options: ['Social Media', 'Endless Planning', 'Chat & Emails', 'Overworking'],
    multiple: true,
    allowUnsure: true,
  },
  {
    id: 'best_focus_time',
    title: 'Your Rhythm',
    subtitle: 'When do you feel most focused?',
    options: ['Early Morning', 'Late Morning', 'Afternoon', 'Late Night'],
    multiple: false,
    allowUnsure: true,
  },
  {
    id: 'goals',
    title: 'Set Your Intent',
    subtitle: 'What do you want to achieve with Shvasa? (Select up to 2)',
    options: ['Deep Work Sessions', 'Consistent Habits', 'Less Screen Time', 'Mental Clarity'],
    multiple: true,
    allowUnsure: true,
  },
];

// ─── Diagnosis state ───────────────────────────────────────────────────────────

interface DiagnosisState {
  active: boolean;
  conversation: { q: string; a: string }[];
  currentQuestion: string;
  currentAnswer: string;
  loading: boolean;
  done: boolean;
}

const emptyDiagnosis: DiagnosisState = {
  active: false,
  conversation: [],
  currentQuestion: '',
  currentAnswer: '',
  loading: false,
  done: false,
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisState>(emptyDiagnosis);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ── Get session once needed ──────────────────────────────────────────────────
  const getSession = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  // ── Start AI diagnosis mode for "I'm not sure" ────────────────────────────
  const startDiagnosis = async () => {
    const step = steps[currentStep];
    setDiagnosis({ ...emptyDiagnosis, active: true, loading: true });

    const session = await getSession();
    if (!session) { setDiagnosis(emptyDiagnosis); return; }

    try {
      const { diagnoseQuestion } = await import('@/lib/ai/client');
      const result = await diagnoseQuestion({
        question_id: step.id,
        question_label: step.subtitle,
        user_response: "I'm not sure",
        conversation_so_far: [],
        accessToken: session.access_token,
      });

      setDiagnosis(prev => ({
        ...prev,
        loading: false,
        currentQuestion: result.follow_up,
        done: result.is_final,
      }));

      if (result.is_final && result.inferred) {
        applyInferred(result.inferred);
      }
    } catch {
      setDiagnosis(emptyDiagnosis);
    }
  };

  // ── Submit one answer in diagnosis conversation ────────────────────────────
  const submitDiagnosisAnswer = async () => {
    if (!diagnosis.currentAnswer.trim()) return;
    const step = steps[currentStep];
    const newConversation = [
      ...diagnosis.conversation,
      { q: diagnosis.currentQuestion, a: diagnosis.currentAnswer.trim() },
    ];

    setDiagnosis(prev => ({
      ...prev,
      conversation: newConversation,
      currentAnswer: '',
      loading: true,
    }));

    const session = await getSession();
    if (!session) { setDiagnosis(emptyDiagnosis); return; }

    try {
      const { diagnoseQuestion } = await import('@/lib/ai/client');
      const result = await diagnoseQuestion({
        question_id: step.id,
        question_label: step.subtitle,
        user_response: diagnosis.currentAnswer.trim(),
        conversation_so_far: newConversation,
        accessToken: session.access_token,
      });

      if (result.is_final && result.inferred) {
        applyInferred(result.inferred);
        setDiagnosis(prev => ({
          ...prev,
          loading: false,
          currentQuestion: result.follow_up,
          done: true,
        }));
      } else {
        setDiagnosis(prev => ({
          ...prev,
          loading: false,
          currentQuestion: result.follow_up,
        }));
      }
    } catch {
      setDiagnosis(emptyDiagnosis);
    }
  };

  // ── Apply inferred values from diagnosis ──────────────────────────────────
  const applyInferred = (inferred: Record<string, string>) => {
    setAnswers(prev => {
      const next = { ...prev };
      for (const [key, val] of Object.entries(inferred)) {
        if (val) next[key] = val;
      }
      return next;
    });
  };

  // ── Accept diagnosis result and move on ───────────────────────────────────
  const acceptDiagnosis = () => {
    setDiagnosis(emptyDiagnosis);
    // answers already patched by applyInferred; just advance
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      submitOnboarding();
    }
  };

  // ── Regular selection handlers ──────────────────────────────────────────────
  const handleSelect = (option: string) => {
    const stepId = steps[currentStep].id;
    const isMultiple = steps[currentStep].multiple;

    if (isMultiple) {
      const cur = (answers[stepId] as string[]) || [];
      if (cur.includes(option)) {
        setAnswers({ ...answers, [stepId]: cur.filter(i => i !== option) });
      } else if (cur.length < 2) {
        setAnswers({ ...answers, [stepId]: [...cur, option] });
      }
    } else {
      setAnswers({ ...answers, [stepId]: option });
    }
  };

  const handleInput = (val: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: val });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      await submitOnboarding();
    }
  };

  // ── Final submission ──────────────────────────────────────────────────
  const submitOnboarding = async () => {
    setIsAnalyzing(true);
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const accessToken = session?.access_token ?? '';

    const fmt = (val: string | string[] | undefined) =>
      !val ? '' : Array.isArray(val) ? val.join(', ') : val;

    const profilePayload = {
      display_name:        fmt(answers['display_name']),
      primary_language:    fmt(answers['primary_language']) || 'English',
      work_type:           fmt(answers['work_type']),
      focus_problem:       fmt(answers['focus_problem']),
      distractions:        fmt(answers['distractions']),
      best_focus_time:     fmt(answers['best_focus_time']),
      goals:               fmt(answers['goals']),
      onboarding_complete: true,
    };

    if (user) {
      // Use upsert so this works whether or not the profile row already exists.
      // This is the critical write — onboarding_complete: true must land in the DB
      // before we navigate to /dashboard, otherwise the server layout redirects back.
      const { error: profileErr } = await supabase
        .from('user_profile')
        .upsert({ id: user.id, email: user.email ?? '', ...profilePayload }, { onConflict: 'id' });
      if (profileErr) {
        console.error('[onboarding] Profile upsert failed:', profileErr);
      }

      try {
        const { analyzeProfile } = await import('@/lib/ai/client');
        const bloom = await analyzeProfile({ ...profilePayload, accessToken });

        const priorityMap: Record<'high' | 'medium' | 'low', 'high' | 'med' | 'low'> = {
          high: 'high', medium: 'med', low: 'low',
        };

        const { error: aiErr } = await supabase.from('user_profile').update({
          ai_archetype:       bloom.archetype,
          ai_coach_message:   bloom.coach_message,
          ai_focus_config:    bloom.focus_mode,
          ai_daily_structure: bloom.daily_structure ?? null,
        }).eq('id', user.id);
        if (aiErr) console.error('[onboarding] AI profile update failed:', aiErr);

        const now = new Date().toISOString();
        const { error: tasksErr } = await supabase.from('tasks').insert(
          bloom.daily_tasks.map(t => ({
            user_id:    user.id,
            title:      t.title,
            priority:   priorityMap[t.priority],
            status:     'todo' as const,
            created_at: now,
            deadline:   null,
          }))
        );
        if (tasksErr) console.error('[onboarding] Tasks insert failed:', tasksErr);
      } catch (e) {
        console.warn('[onboarding] BLOOM analysis failed, proceeding:', e);
      }
    }

    // Hard navigation — bypasses Next.js server cache so the dashboard layout
    // reads fresh onboarding_complete = true from the DB instead of a stale value.
    window.location.href = '/dashboard';
  };

  // ── Analyzing screen ───────────────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface to-surface animate-pulse-slow" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-md"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
            <motion.div
              className="absolute inset-0 border-2 border-primary/20 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Sparkles size={32} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-editorial text-primary mb-4">Tuning your sanctuary...</h1>
          <p className="text-on-surface-variant font-body">
            BLOOM is analyzing your behavioral profile to build a precision execution environment.
          </p>
        </motion.div>
      </main>
    );
  }

  const step = steps[currentStep];
  const currentAnswer = answers[step.id];
  let canContinue = false;
  if (step.type === 'input') {
    canContinue = typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
  } else if (step.multiple) {
    canContinue = Array.isArray(currentAnswer) && currentAnswer.length > 0;
  } else {
    canContinue = !!currentAnswer;
  }

  // ── AI Diagnosis modal overlay ─────────────────────────────────────────────
  if (diagnosis.active) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Progress breadcrumb */}
          <div className="flex gap-2 mb-10 justify-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= currentStep ? 'w-12 bg-primary' : 'w-4 bg-primary/20'
                }`}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-[32px] p-8 md:p-12 shadow-sm border border-surface-variant/30"
          >
            <div className="flex items-center gap-2 text-primary/70 mb-6">
              <Sparkles size={16} />
              <span className="text-sm uppercase tracking-widest font-semibold">BLOOM Diagnosis</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-editorial text-on-surface mb-2 leading-tight">
              Let me understand you better.
            </h2>
            <p className="text-on-surface-variant font-body mb-8 text-sm">
              Answer honestly — the more specific, the better I can tailor your environment.
            </p>

            {/* Past conversation */}
            {diagnosis.conversation.length > 0 && (
              <div className="mb-6 space-y-3">
                {diagnosis.conversation.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs text-on-surface-variant/60 font-mono uppercase tracking-wide">Q{i + 1}</p>
                    <p className="text-sm text-on-surface-variant font-body">{c.q}</p>
                    <p className="text-sm text-primary font-medium font-body pl-3 border-l-2 border-primary/30">{c.a}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Current question or done state */}
            {diagnosis.loading ? (
              <div className="flex items-center gap-3 py-6 text-on-surface-variant">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="font-body text-sm">BLOOM is thinking...</span>
              </div>
            ) : diagnosis.done ? (
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <Check size={18} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-primary font-body mb-1">Profile identified</p>
                      <p className="text-sm text-on-surface-variant font-body">{diagnosis.currentQuestion}</p>
                      {Object.keys(answers).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(answers)
                            .filter(([k]) => k === step.id)
                            .map(([, v]) => (
                              <span key={String(v)} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-mono">
                                {Array.isArray(v) ? v.join(', ') : String(v)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDiagnosis(emptyDiagnosis)}
                    className="text-on-surface-variant text-sm hover:text-on-surface transition-colors font-body"
                  >
                    Edit manually
                  </button>
                  <button
                    onClick={acceptDiagnosis}
                    className="flex items-center gap-2 bg-primary text-on-primary px-7 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
                  >
                    Looks right <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg font-body text-on-surface font-medium">{diagnosis.currentQuestion}</p>
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  placeholder="Type your answer..."
                  value={diagnosis.currentAnswer}
                  onChange={e => setDiagnosis(prev => ({ ...prev, currentAnswer: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') submitDiagnosisAnswer(); }}
                  className="w-full bg-surface-container-lowest border border-surface-variant/30 rounded-2xl px-5 py-4 text-base text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                />
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setDiagnosis(emptyDiagnosis)}
                    className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-body"
                  >
                    ← Go back
                  </button>
                  <button
                    onClick={submitDiagnosisAnswer}
                    disabled={!diagnosis.currentAnswer.trim()}
                    className="flex items-center gap-2 bg-primary text-on-primary px-7 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Answer <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  // ── Normal onboarding step ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl relative">
        {/* Progress bar */}
        <div className="flex gap-2 mb-12 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= currentStep ? 'w-12 bg-primary' : 'w-4 bg-primary/20'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-container rounded-[32px] p-8 md:p-12 shadow-sm border border-surface-variant/30"
          >
            <div className="flex items-center gap-2 text-primary/70 mb-4">
              <Sparkles size={16} />
              <span className="text-sm uppercase tracking-widest font-semibold">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-editorial text-on-surface mb-4 leading-tight">
              {step.title}
            </h1>
            <p className="text-lg text-on-surface-variant font-body mb-8">{step.subtitle}</p>

            {/* Text input */}
            {step.type === 'input' && (
              <div className="mb-8">
                <input
                  type="text"
                  autoFocus
                  placeholder={step.placeholder}
                  value={(answers[step.id] as string) || ''}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && canContinue) handleNext(); }}
                  className="w-full bg-surface-container-lowest border border-surface-variant/30 rounded-2xl px-6 py-4 text-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                />
              </div>
            )}

            {/* Choice options */}
            {step.options && (
              <div className="grid gap-3 mb-6">
                {step.options.map(option => {
                  const isSelected = step.multiple
                    ? Array.isArray(answers[step.id]) && (answers[step.id] as string[]).includes(option)
                    : answers[step.id] === option;

                  return (
                    <motion.button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`text-left px-6 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-sm'
                          : 'bg-surface-container-lowest border-transparent text-on-surface hover:border-primary/30'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="font-medium text-base font-body">{option}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"
                        >
                          <Check size={14} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                {/* "I'm not sure" trigger */}
                {step.allowUnsure && (
                  <motion.button
                    onClick={startDiagnosis}
                    className="text-left px-6 py-4 rounded-2xl border border-dashed border-primary/20 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center gap-3 group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <HelpCircle size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                    <span className="font-body text-sm">I&apos;m not sure — help me figure it out</span>
                    <Sparkles size={14} className="ml-auto text-primary/30 group-hover:text-primary transition-colors" />
                  </motion.button>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-surface-variant/20">
              <button
                onClick={handleNext}
                disabled={!canContinue}
                className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {currentStep === steps.length - 1 ? 'Start Growing' : 'Continue'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
