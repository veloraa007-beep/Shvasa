'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const quotes = [
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "The mind is like water. When it's turbulent, it's difficult to see.", author: "Dalai Lama" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "To sit in the shade on a fine day and look upon verdure is the most perfect refreshment.", author: "Jane Austen" }
];

export function QuoteCard({ customQuote }: { customQuote?: { text: string; author: string } }) {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    if (customQuote) {
      setQuote(customQuote);
    } else {
      // Select a random quote for the day (or just random for now)
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }
  }, [customQuote]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-surface-container rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote size={80} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center gap-2 text-primary/70 mb-2">
          <Sparkles size={14} />
          <span className="text-xs uppercase tracking-widest font-semibold">Daily Wisdom</span>
        </div>
        
        <blockquote>
          <p className="font-editorial text-xl sm:text-2xl text-on-surface leading-tight mb-4">
            "{quote.text}"
          </p>
          <footer className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
            <div className="w-4 h-[1px] bg-primary/30"></div>
            {quote.author}
          </footer>
        </blockquote>
      </div>
    </motion.div>
  );
}
