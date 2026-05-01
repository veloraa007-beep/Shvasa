'use client';

import { motion } from 'framer-motion';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <div className="h-16 md:hidden"></div>

      <main className="max-w-4xl mx-auto px-6 pt-8 pb-24 md:pt-16">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-editorial text-primary tracking-tight mb-4">Subscription</h1>
          <p className="text-on-surface-variant font-body max-w-xl md:mx-0 mx-auto">
            Support the growth of your digital garden with Shvasa Premium.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Current Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low p-8 rounded-[32px] border border-surface-variant/20 flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-mono uppercase tracking-widest rounded-full mb-6">
                Current Plan
              </div>
              <h2 className="text-3xl font-editorial text-primary mb-2">Seedling (Free)</h2>
              <p className="text-on-surface-variant font-body mb-8">
                Basic focus tools and a small garden to get you started.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-on-surface-variant font-body">
                <Check size={18} className="text-primary/50" />
                <span>3 Daily Tasks</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant font-body">
                <Check size={18} className="text-primary/50" />
                <span>Basic Focus Timer</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant font-body">
                <Check size={18} className="text-primary/50" />
                <span>Simple Garden Stats</span>
              </div>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary p-8 rounded-[32px] border border-primary-dark shadow-xl shadow-primary/10 flex flex-col justify-between text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white text-xs font-mono uppercase tracking-widest rounded-full mb-6">
                <Zap size={14} />
                <span>Recommended</span>
              </div>
              <h2 className="text-3xl font-editorial mb-2">Old Growth (Premium)</h2>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold font-editorial">$8</span>
                <span className="text-white/70 font-body">/month</span>
              </div>
            </div>
            
            <div className="space-y-4 relative z-10 mb-8">
              <div className="flex items-center gap-3 font-body">
                <Check size={18} className="text-white/80" />
                <span>Unlimited Tasks & Notes</span>
              </div>
              <div className="flex items-center gap-3 font-body">
                <Check size={18} className="text-white/80" />
                <span>Advanced AI Mentorship</span>
              </div>
              <div className="flex items-center gap-3 font-body">
                <Check size={18} className="text-white/80" />
                <span>Full Garden Analytics & History</span>
              </div>
              <div className="flex items-center gap-3 font-body">
                <Check size={18} className="text-white/80" />
                <span>Custom Bloom Environments</span>
              </div>
            </div>

            <button className="w-full py-4 bg-white text-primary rounded-full font-medium hover:bg-surface-container-lowest transition-colors relative z-10">
              Upgrade to Premium
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 text-on-surface-variant/70 text-sm font-body"
        >
          <ShieldCheck size={16} />
          <span>Secure payment processing via Stripe. Cancel anytime.</span>
        </motion.div>

      </main>
    </div>
  );
}
