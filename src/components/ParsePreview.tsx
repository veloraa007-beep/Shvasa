'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Tag, Zap, ChevronRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Extraction {
  field: string;
  value: string;
  confidence: number;
}

export function ParsePreview({ extractions }: { extractions: Extraction[] }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[10px] font-sans font-semibold text-bark-light uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Sparkles size={12} className="text-gold" /> Intelligence Extraction
      </h5>
      
      <div className="grid gap-2">
        {extractions.map((ext, i) => (
          <motion.div
            key={ext.field}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex items-center justify-between p-2 rounded-lg bg-earth/50 border border-border/30 hover:bg-earth transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-white text-forest shadow-sm">
                {ext.field === 'title' && <Zap size={14} />}
                {ext.field === 'date' && <Calendar size={14} />}
                {ext.field === 'category' && <Tag size={14} />}
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-tighter text-bark-light">{ext.field}</div>
                <div className="text-sm font-medium text-bark">{ext.value}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-border-dark/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${ext.confidence * 100}%` }}
                  className="h-full bg-forest"
                />
              </div>
              <Check size={14} className="text-leaf opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-[10px] text-bark-light mt-4 italic">
        "I've identified these details from your voice. Adjust if needed."
      </p>
    </div>
  );
}
