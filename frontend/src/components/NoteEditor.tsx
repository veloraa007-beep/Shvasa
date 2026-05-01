'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, Italic, List, ListOrdered, Link, 
  Image as ImageIcon, Smile, Sparkles, Save, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NoteEditor() {
  const [content, setContent] = React.useState('');
  const [title, setTitle] = React.useState('');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-earth/30">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Bold size={16} /></Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Italic size={16} /></Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><List size={16} /></Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ListOrdered size={16} /></Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Link size={16} /></Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ImageIcon size={16} /></Button>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="h-8 gap-1 text-[10px] text-forest">
             <Sparkles size={14} /> AI Assist
           </Button>
           <Button size="sm" className="h-8 gap-1.5 px-3">
             <Save size={14} /> Save
           </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full text-4xl font-display text-bark placeholder:text-border outline-none mb-8"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start reflecting or planning..."
          className="w-full h-full text-lg font-sans text-bark-mid placeholder:text-bark-light/30 outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-border flex items-center justify-between">
         <div className="flex items-center gap-4 text-[10px] text-bark-light uppercase tracking-widest">
           <span>Edited 2m ago</span>
           <span>524 words</span>
         </div>
         <div className="flex gap-2">
           <button className="flex items-center gap-1 text-[10px] text-bark-light hover:text-forest transition-all">
             Personal Space <ChevronDown size={10} />
           </button>
         </div>
      </div>
    </div>
  );
}
