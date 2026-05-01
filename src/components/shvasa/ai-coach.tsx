'use client';

import { useMutation } from '@tanstack/react-query';
import { Mic, Send, Check, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIPlan, CoachMessage, DailyTask, ShvasaUser, UserProfile } from '@/lib/shvasa/types';
import { createTaskAction, createNoteAction, createReminderAction, startFocusAction } from './actions';

export function AiCoach({ user, profile, tasks }: { user: ShvasaUser; profile: UserProfile | null; tasks: DailyTask[] }) {
  const activeTask = useMemo(
    () => tasks.find((task) => task.status === 'doing') ?? tasks.find((task) => task.status !== 'done'),
    [tasks]
  );
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      role: 'coach',
      text: activeTask ? `Start with: ${activeTask.title}` : 'All clear. Protect the streak.',
    },
  ]);

  const [pendingPlan, setPendingPlan] = useState<AIPlan | null>(null);

  const coachMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'AI request failed');
      }

      if (!responseData.ok) {
        throw new Error(responseData.error || 'AI processing failed');
      }

      return responseData.data as AIPlan;
    },
    onSuccess: (plan) => {
      setPendingPlan(plan);
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput('');
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: message }]);
    coachMutation.mutate(message);
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'coach', text: 'Voice is not available here.\nType the distraction.' }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  }

  async function handleConfirm(plan: AIPlan) {
    setPendingPlan(null);
    let replyText = plan.reply || 'Done.';

    try {
      switch (plan.type) {
        case 'task':
          await createTaskAction(user.id, plan, user.accessToken);
          break;
        case 'note':
          await createNoteAction(user.id, plan, user.accessToken);
          break;
        case 'reminder':
          await createReminderAction(user.id, plan, user.accessToken);
          break;
        case 'focus':
          startFocusAction(plan);
          break;
        default:
          // chat — just show reply
          break;
      }
    } catch {
      replyText = 'Something went wrong. Try again.';
    }

    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'coach', text: replyText }]);
  }

  function handleEdit() {
    setPendingPlan(null);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'coach', text: 'Go ahead and rephrase.' }]);
  }

  function handleCancel() {
    setPendingPlan(null);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'coach', text: 'Cancelled.' }]);
  }

  return (
    <aside className="border-t border-surface-variant/20 bg-surface/80 p-4 backdrop-blur-xl lg:border-l lg:border-t-0 min-h-screen">
      <div className="flex h-full min-h-[540px] flex-col rounded-[24px] border border-surface-variant/30 bg-surface-container-lowest p-5 ambient-shadow">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary/70 mb-1">Bloom AI</p>
          <h2 className="text-2xl font-editorial text-primary tracking-tight">Next action only.</h2>
        </div>

        <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`whitespace-pre-line rounded-[18px] px-4 py-3 text-sm font-body leading-relaxed ${
                message.role === 'coach' 
                  ? 'bg-surface-container text-on-surface' 
                  : 'ml-8 bg-primary text-on-primary'
              }`}
            >
              {message.text}
            </motion.div>
          ))}

          {/* Confirmation card */}
          <AnimatePresence>
            {pendingPlan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[20px] border border-primary/20 bg-primary/5 p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-mono text-primary uppercase tracking-wide">
                    {pendingPlan.type}
                  </span>
                  <span className="text-sm font-body font-medium text-primary">{pendingPlan.title}</span>
                </div>
                {pendingPlan.description && (
                  <p className="mb-3 text-sm font-body text-on-surface-variant">{pendingPlan.description}</p>
                )}
                {pendingPlan.deadline && (
                  <p className="mb-2 text-xs font-mono text-primary/70">Deadline: {new Date(pendingPlan.deadline).toLocaleString()}</p>
                )}
                {pendingPlan.priority && (
                  <p className="mb-3 text-xs font-mono text-primary/70">Priority: {pendingPlan.priority}</p>
                )}
                {pendingPlan.steps.length > 0 && (
                  <ul className="mb-4 ml-4 list-disc text-sm font-body text-on-surface-variant space-y-1">
                    {pendingPlan.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                <p className="mb-4 rounded-xl bg-white/60 px-4 py-3 text-sm font-body text-primary italic">
                  {pendingPlan.reply || 'Confirm?'}
                </p>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleConfirm(pendingPlan)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary shadow-sm hover:bg-primary-dark transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Check size={16} /> Confirm
                  </motion.button>
                  <motion.button
                    onClick={handleEdit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-primary border border-surface-variant/50 shadow-sm hover:bg-surface-container transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    className="flex items-center justify-center rounded-xl bg-surface px-3 py-2.5 text-on-surface-variant border border-surface-variant/50 shadow-sm hover:bg-surface-container transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {coachMutation.isPending && (
            <div className="rounded-[18px] bg-surface-container px-4 py-3 text-sm font-body text-on-surface-variant animate-pulse">
              Thinking in one breath...
            </div>
          )}
          {coachMutation.error && (
            <div className="rounded-[18px] bg-red-50/50 border border-red-100 px-4 py-3 text-sm font-body text-red-700">
              Bloom AI unavailable: {coachMutation.error.message}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={startVoice}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-surface-container text-primary transition-colors hover:bg-surface-container-high"
            aria-label="Voice input"
          >
            <Mic size={18} />
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Distracted? Say it."
            className="min-w-0 flex-1 rounded-[14px] border border-surface-variant/30 bg-surface px-4 text-sm font-body text-on-surface outline-none transition-all focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 placeholder:text-on-surface-variant/50"
          />
          <button 
            type="submit" 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary text-on-primary transition-colors hover:bg-primary-dark shadow-sm" 
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </aside>
  );
}
