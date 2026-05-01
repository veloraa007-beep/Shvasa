'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Very basic calendar math for visual purposes
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const events = [
    { day: 12, title: 'Deep Focus Block', time: '10:00 AM' },
    { day: 15, title: 'Project Review', time: '2:00 PM' },
    { day: 18, title: 'Weekly Reflection', time: '8:00 PM' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <div className="h-16 md:hidden"></div>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24 md:pt-16">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-editorial text-primary tracking-tight mb-2">Calendar</h1>
            <p className="text-on-surface-variant font-body">Map your time, plant your intentions.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-medium text-on-surface min-w-[140px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-[32px] p-6 md:p-8 border border-surface-variant/20 shadow-sm"
        >
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-4">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs font-mono uppercase tracking-widest text-on-surface-variant/70 pb-4 border-b border-surface-variant/10">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-surface-variant/10">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-surface-container-lowest min-h-[100px] md:min-h-[120px] p-2"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const dayEvents = events.filter(e => e.day === day);

              return (
                <div key={day} className="bg-surface-container-lowest min-h-[100px] md:min-h-[120px] p-2 border-t border-surface-variant/10 hover:bg-surface-container/50 transition-colors group relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${isToday ? 'bg-primary text-white' : 'text-on-surface group-hover:text-primary'}`}>
                    {day}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => (
                      <div key={idx} className="bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs rounded-md px-2 py-1 truncate">
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming */}
        <section className="mt-12">
          <h3 className="text-lg font-medium text-on-surface mb-6 flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary" />
            Upcoming Intentions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-[20px] border border-surface-variant/20">
                <h4 className="font-medium text-primary mb-2">{event.title}</h4>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant font-mono">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={14} />
                    <span>{monthNames[month].slice(0, 3)} {event.day}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
