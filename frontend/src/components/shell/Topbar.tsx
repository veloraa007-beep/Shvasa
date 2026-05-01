'use client';

import { motion } from 'framer-motion';
import { Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';

export function Topbar() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-container/80 backdrop-blur-3xl border-b border-surface-variant/20 z-40 flex items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 32 Q20 20 28 12 Q32 8 36 12 Q32 18 20 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
            <path d="M20 32 Q20 20 12 12 Q8 8 4 12 Q8 18 20 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M20 32 L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="10" r="3" fill="currentColor" />
          </svg>
        </div>
        <h1 className="font-editorial italic text-primary text-xl tracking-tight">Shvasa</h1>
      </Link>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-surface-container"></span>
        </button>
        <Link href="/profile" className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          AG
        </Link>
      </div>
    </header>
  );
}
