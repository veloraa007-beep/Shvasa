'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const days = [];
  const firstDay = firstDayOfMonth(year, currentDate.getMonth());
  const totalDays = daysInMonth(year, currentDate.getMonth());

  // Padding for previous month days
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8 opacity-20" />);
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), d).toDateString();
    const isSelected = selectedDate.toDateString() === new Date(year, currentDate.getMonth(), d).toDateString();
    
    days.push(
      <button
        key={d}
        onClick={() => setSelectedDate(new Date(year, currentDate.getMonth(), d))}
        className={cn(
          "w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all relative",
          isToday && !isSelected && "text-forest font-bold underline decoration-2 decoration-forest",
          isSelected ? "bg-forest text-white shadow-md scale-105" : "hover:bg-earth text-bark-mid",
        )}
      >
        {d}
        {/* Task dot placeholder */}
        {d % 5 === 0 && !isSelected && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
        )}
      </button>
    );
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display text-bark">{monthName} <span className="text-bark-light opacity-50">{year}</span></h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-earth rounded-full transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-earth rounded-full transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="w-8 h-8 flex items-center justify-center text-[10px] font-mono text-bark-light">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}
