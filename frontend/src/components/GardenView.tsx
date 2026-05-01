'use client';

import { motion } from 'framer-motion';

const tasks = [
  { id: '1', type: 'TREE', x: 20, y: 30, color: '#2D5A27' },
  { id: '2', type: 'PLANT', x: 50, y: 50, color: '#4A8C3F' },
  { id: '3', type: 'SEED', x: 80, y: 20, color: '#7DBF6E' },
  { id: '4', type: 'PLANT', x: 30, y: 70, color: '#4A8C3F' },
];

export function GardenView() {
  return (
    <div className="relative w-full aspect-square md:aspect-video nature-card overflow-hidden bg-earth/50">
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ 
            position: 'absolute', 
            left: `${task.x}%`, 
            top: `${task.y}%`,
            color: task.color
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          {task.type === 'SEED' && (
            <div className="w-4 h-4 rounded-sm bg-current shadow-sm group-hover:scale-110 transition-transform" />
          )}
          {task.type === 'PLANT' && (
            <svg className="w-8 h-8 group-hover:-rotate-12 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L12.71,2.05C15.65,2.46 18,5.03 18,8.12V10H14V14H10V10H6V8.12C6,5.03 8.35,2.46 11.29,2.05L12,2M10,16V22H14V16H10Z" />
            </svg>
          )}
          {task.type === 'TREE' && (
            <svg className="w-12 h-12 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
            </svg>
          )}
          <span className="hidden group-hover:block absolute -bottom-6 text-[10px] font-mono whitespace-nowrap bg-bark text-mist px-1 rounded">
            {task.type} ITEM
          </span>
        </motion.div>
      ))}
      
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-moss font-mono">
          <span className="w-2 h-2 rounded-sm bg-leaf-light" /> SEEDS
        </div>
        <div className="flex items-center gap-1 text-xs text-moss font-mono">
          <span className="w-2 h-2 rounded-sm bg-leaf" /> PLANTS
        </div>
        <div className="flex items-center gap-1 text-xs text-moss font-mono">
          <span className="w-2 h-2 rounded-sm bg-forest" /> TREES
        </div>
      </div>
    </div>
  );
}
