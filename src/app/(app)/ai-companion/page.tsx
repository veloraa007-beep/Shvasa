'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Leaf, Wind } from 'lucide-react';
import { ShvasaUser } from '@/lib/shvasa/types';
import { useRouter } from 'next/navigation';

function readUser(): ShvasaUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('shvasa:user');
  return raw ? JSON.parse(raw) as ShvasaUser : null;
}

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function AiCompanionPage() {
  const [user, setUser] = useState<ShvasaUser | null>(null);
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to your digital sanctuary. I am Bloom, your AI companion. How can I assist you in finding your focus today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readUser();
    if (!stored) router.push('/');
    else setUser(stored);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I hear you. Remember that true productivity is about rhythm, not relentless pushing. Let us break that down into smaller, gentle steps.'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-surface pt-16 md:pt-0 pb-16 md:pb-0">
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-surface-variant/10 flex items-center gap-3 bg-surface/80 backdrop-blur-md z-10 sticky top-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Leaf size={20} />
          </div>
          <div>
            <h1 className="font-editorial text-xl text-primary">Bloom AI</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/70">Your Mentor</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] md:max-w-[70%] p-4 rounded-[24px] font-body text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-surface-container-low text-on-surface border border-surface-variant/20 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex justify-start"
              >
                <div className="bg-surface-container-low p-4 rounded-[24px] rounded-tl-sm border border-surface-variant/20 flex items-center gap-2">
                  <Wind size={16} className="text-primary/50 animate-pulse" />
                  <span className="text-sm font-mono text-on-surface-variant/70">Bloom is thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-surface via-surface to-transparent">
          <div className="relative max-w-3xl mx-auto flex items-end bg-surface-container-low rounded-[24px] border border-surface-variant/30 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all p-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Bloom for guidance..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[44px] py-3 px-4 text-on-surface font-body placeholder:text-on-surface-variant/50 custom-scrollbar"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-10 h-10 mb-1 mr-1 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-surface-variant transition-colors"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
