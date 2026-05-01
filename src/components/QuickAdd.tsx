'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { MicButton } from './MicButton';
import { Waveform } from './Waveform';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Sparkles, X, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function QuickAdd({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcription, setTranscription] = React.useState('');
  const [isParsing, setIsParsing] = React.useState(false);

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsParsing(true);
      // Simulate transcription
      setTimeout(() => {
        setTranscription("Buy fresh soil for the garden tomorrow at 9 AM #home !urgent");
        setIsParsing(false);
      }, 1500);
    } else {
      setIsRecording(true);
      setTranscription('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-0 overflow-visible" showClose={false}>
      <div className="bg-earth rounded-t-xl p-4 border-b border-border flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white">
             <Sparkles size={16} />
           </div>
           <div>
             <h3 className="text-sm font-display text-bark">Quick Capture</h3>
             <p className="text-[10px] text-bark-light uppercase tracking-wider">Natural Language Engine</p>
           </div>
         </div>
         <button onClick={onClose} className="p-1.5 hover:bg-earth-deep rounded-full text-bark-light transition-colors">
           <X size={18} />
         </button>
      </div>

      <div className="p-8 flex flex-col items-center">
        <MicButton isRecording={isRecording} onClick={handleMicClick} className="mb-6" />
        
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording-ui"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center"
            >
              <Waveform isActive={true} />
              <p className="mt-4 text-sm font-sans text-forest font-medium animate-pulse italic">
                Listening to your thoughts...
              </p>
            </motion.div>
          ) : isParsing ? (
            <motion.div
              key="parsing-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-forest"
                  />
                ))}
              </div>
              <p className="text-sm font-sans text-bark-mid">Parsing intent...</p>
            </motion.div>
          ) : transcription ? (
            <motion.div
              key="result-ui"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-4"
            >
              <div className="nature-card p-4 bg-white border-forest/20 shadow-sm">
                <p className="text-sm font-sans text-bark leading-relaxed italic">
                  "{transcription}"
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                 <Badge variant="urgent">Urgent</Badge>
                 <Badge variant="low">Home</Badge>
                 <Badge variant="outline" className="flex items-center gap-1">
                   <Zap size={10} className="text-gold" /> Tomorrow, 9:00 AM
                 </Badge>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Button variant="primary" className="flex-1" icon={<Sparkles size={16} />}>
                  Confirm & Sync
                </Button>
                <Button variant="secondary" onClick={() => setTranscription('')}>
                  Retry
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col items-center"
            >
              <p className="text-sm font-sans text-bark-mid mb-6 text-center">
                Tap the microphone or start typing to capture instantly.<br/>
                <span className="text-[10px] uppercase tracking-widest opacity-50">E.g. "Draft proposal by 5pm !high"</span>
              </p>
              <Input
                placeholder="Type your task here..."
                className="bg-white border-border h-12 text-base px-5 shadow-sm focus:border-forest"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-earth/50 p-3 rounded-b-xl flex items-center justify-between text-[10px] text-bark-light">
         <div className="flex items-center gap-3">
           <span>ENTER to save</span>
           <span>ESC to cancel</span>
         </div>
         <div className="flex items-center gap-1">
           <Zap size={10} className="text-bark-light" /> Powered by Shvasa AI
         </div>
      </div>
    </Modal>
  );
}
