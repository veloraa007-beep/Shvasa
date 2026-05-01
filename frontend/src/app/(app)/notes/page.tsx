'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileText, ChevronLeft, Calendar, MoreVertical } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const dummyNotes: Note[] = [
  { id: '1', title: 'Product Vision Q3', content: 'Focus on nature-inspired design. Use the new Shvasa palette. Earth, Forest, Cream.', updatedAt: 'Today, 10:42 AM' },
  { id: '2', title: 'Meeting with Alex', content: 'Discussed the integration of the Bloom tree SVG animations into the focus timer.', updatedAt: 'Yesterday, 2:15 PM' },
  { id: '3', title: 'Ideas for Onboarding', content: 'Keep it short. Ask about top distractions and intention for using the app.', updatedAt: 'Oct 12, 9:00 AM' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(dummyNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeNote = notes.find(n => n.id === activeNoteId);

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      updatedAt: 'Just now'
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  return (
    <div className="flex h-screen bg-surface pt-16 md:pt-0 pb-16 md:pb-0 overflow-hidden">
      
      {/* Left List Panel */}
      <div className={`w-full md:w-[320px] lg:w-[380px] h-full border-r border-surface-variant/20 flex flex-col bg-surface-container-low transition-all ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-editorial text-primary tracking-tight">Notes</h1>
            <button onClick={handleCreateNote} className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-surface-variant/30 rounded-[12px] text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-body"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-4 rounded-[14px] transition-all border ${
                activeNoteId === note.id 
                  ? 'bg-primary/5 border-primary/20 shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-surface-container'
              }`}
            >
              <h3 className="font-medium text-on-surface mb-1 truncate">{note.title}</h3>
              <p className="text-sm text-on-surface-variant/70 truncate mb-2">{note.content || 'No additional text'}</p>
              <div className="text-[10px] text-on-surface-variant/50 font-mono uppercase tracking-wider">{note.updatedAt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Editor Panel */}
      <div className={`flex-1 h-full bg-surface flex flex-col ${!activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        {activeNote ? (
          <>
            <div className="px-6 py-4 border-b border-surface-variant/10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <button 
                onClick={() => setActiveNoteId(null)}
                className="md:hidden flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Notes</span>
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest">
                <Calendar size={14} />
                {activeNote.updatedAt}
              </div>

              <button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-24 custom-scrollbar">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title: e.target.value } : n))}
                className="w-full text-4xl md:text-5xl font-editorial text-primary bg-transparent border-none focus:outline-none mb-6 placeholder:text-primary/30"
                placeholder="Note Title"
              />
              <textarea
                value={activeNote.content}
                onChange={e => setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: e.target.value } : n))}
                className="w-full h-full min-h-[500px] text-lg text-on-surface font-body leading-relaxed bg-transparent border-none focus:outline-none resize-none placeholder:text-on-surface-variant/40"
                placeholder="Start typing your thoughts..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
            <FileText size={48} className="mb-4 text-primary/40" />
            <p className="font-editorial text-2xl text-primary">Select a note</p>
            <p className="font-body text-sm mt-2">Or create a new one to capture your thoughts.</p>
          </div>
        )}
      </div>

    </div>
  );
}
