'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  className?: string;
}

export function MicButton({ isRecording, onClick, className }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-slow group",
        isRecording ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-forest hover:bg-forest-dark shadow-lg",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
          >
            <Square size={24} className="text-white fill-white" />
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
          >
            <Mic size={24} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing rings when recording */}
      {isRecording && (
        <>
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-500 -z-10"
          />
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-full bg-red-400 -z-10"
          />
        </>
      )}

      {!isRecording && (
        <Sparkles size={14} className="absolute -top-1 -right-1 text-gold animate-bounce" />
      )}
    </button>
  );
}
