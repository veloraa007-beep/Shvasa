'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, FileText, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const options = [
  { icon: FileText, label: 'New note',   action: '/notes/new',  color: '#7B61FF' },
  { icon: Plus,     label: 'Quick task', action: 'quickadd',    color: '#2D5A27' },
  { icon: Mic,      label: 'Voice task', action: '/capture',    color: '#4A8C3F' },
]

export function FAB() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleOption = (action: string) => {
    setOpen(false)
    if (action === 'quickadd') {
      // dispatch global event to open QuickAdd modal
      window.dispatchEvent(new CustomEvent('taskly:quickadd'))
    } else {
      router.push(action)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-7 right-[320px] z-50 flex flex-col items-end gap-3 pointer-events-none">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {/* Option buttons — stagger up */}
          <AnimatePresence>
            {open && options.map((opt, i) => (
              <motion.div
                key={opt.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{
                  delay: open ? (options.length - 1 - i) * 0.055 : i * 0.04,
                  type: 'spring', stiffness: 420, damping: 24
                }}
              >
                {/* Label tooltip */}
                <motion.span
                  className="bg-[#3A2E1E] text-white text-[12px] font-medium px-3 py-1.5 rounded-[8px] shadow-lg whitespace-nowrap"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.05 + (options.length - 1 - i) * 0.055 }}
                >
                  {opt.label}
                </motion.span>

                {/* Option circle button */}
                <motion.button
                  onClick={() => handleOption(opt.action)}
                  className="w-11 h-11 rounded-full bg-[#EAF5E2] border border-[#7DBF6E] flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-forest"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <opt.icon size={18} className="text-[#2D5A27]" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Main FAB button */}
          <motion.button
            onClick={() => setOpen(!open)}
            className="w-14 h-14 rounded-full bg-[#2D5A27] flex items-center justify-center shadow-xl focus:outline-none focus:ring-4 focus:ring-forest/30"
            whileHover={{ scale: 1.08, boxShadow: '0 20px 48px rgba(45,90,39,0.35)' }}
            whileTap={{ scale: 0.93 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
          >
            <motion.div
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <Plus size={24} color="white" strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </>
  )
}
