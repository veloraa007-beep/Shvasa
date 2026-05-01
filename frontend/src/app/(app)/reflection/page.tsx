'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReflectionPage() {
  const [reflection, setReflection] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    if (!reflection.trim()) return;
    
    // Fake save to DB
    setIsSaved(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const prompts = [
    "What gave you energy today?",
    "What drained your energy today?",
    "What is one thing you learned?",
    "If you could do today over again, what would you change?"
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <div className="h-16 md:hidden"></div>

      <main className="max-w-3xl mx-auto px-6 pt-8 pb-24 md:pt-16">
        <header className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-editorial text-primary tracking-tight mb-4">Evening Reflection</h1>
          <p className="text-on-surface-variant text-lg font-body max-w-xl">
            Take a moment to pause. Your digital garden grows when you acknowledge your progress and learn from your day.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!isSaved ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container rounded-[32px] p-8 border border-surface-variant/20 shadow-sm"
            >
              <div className="mb-8">
                <h3 className="text-sm font-mono uppercase tracking-widest text-primary/70 mb-4">Prompts to consider</h3>
                <ul className="space-y-3">
                  {prompts.map((prompt, i) => (
                    <li key={i} className="flex gap-3 text-on-surface-variant font-body text-sm md:text-base">
                      <span className="text-primary/40 mt-1">—</span> {prompt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full min-h-[250px] p-6 bg-surface-container-lowest rounded-[24px] border border-surface-variant/30 text-on-surface font-body resize-none focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/40"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={!reflection.trim()}
                  className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  <Save size={18} />
                  <span>Plant Reflection</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container rounded-[32px] p-12 border border-surface-variant/20 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 bg-primary rounded-full text-white flex items-center justify-center mb-6 shadow-xl shadow-primary/20"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h2 className="text-3xl font-editorial text-primary mb-2">Reflection Planted</h2>
              <p className="text-on-surface-variant font-body">Your insights have been added to the soil of your garden.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
