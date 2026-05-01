'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Flame, Timer, Video } from 'lucide-react';

export function RightPanel() {
  const calendarDays = [
    { date: 28, isToday: false, isSelected: false, outOfMonth: true, hasTasks: false },
    { date: 29, isToday: false, isSelected: false, outOfMonth: true, hasTasks: false },
    { date: 30, isToday: false, isSelected: false, outOfMonth: true, hasTasks: false },
    { date: 1,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 2,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: true },
    { date: 3,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 4,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 5,  isToday: false, isSelected: true, outOfMonth: false, hasTasks: false },
    { date: 6,  isToday: true, isSelected: false, outOfMonth: false, hasTasks: true },
    { date: 7,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 8,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 9,  isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 10, isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 11, isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 12, isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 13, isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
    { date: 14, isToday: false, isSelected: false, outOfMonth: false, hasTasks: false },
  ];
  const meetings = [
    { id: 1, title: 'Product Review', time: '10:00 AM', color: '#4285F4', meetLink: true },
    { id: 2, title: 'Design Sync', time: '1:30 PM', color: '#34A853', meetLink: false },
  ];

  return (
    <aside className="w-[300px] flex-shrink-0 h-screen flex flex-col bg-white border-l border-[#E8DFC8] overflow-y-auto">

      {/* Mini Calendar */}
      <div className="p-4 border-b border-[#E8DFC8]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-['DM_Serif_Display'] text-[14px] text-[#3A2E1E]">December 2025</span>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F5EDD8]">
              <ChevronLeft size={14} className="text-[#A08060]" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F5EDD8]">
              <ChevronRight size={14} className="text-[#A08060]" />
            </button>
          </div>
        </div>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="h-7 flex items-center justify-center text-[10px] font-mono text-[#A08060]">{d}</div>
          ))}
        </div>
        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day, i) => (
            <button key={i}
              className={`h-8 w-8 mx-auto flex items-center justify-center text-[13px] rounded-[8px] transition-all relative
                ${day.isToday ? 'bg-[#2D5A27] text-white font-semibold' : ''}
                ${day.isSelected ? 'bg-[#EAF5E2] text-[#2D5A27] border border-[#7DBF6E]' : ''}
                ${!day.isToday && !day.isSelected ? 'text-[#6B5B45] hover:bg-[#F5EDD8]' : ''}
                ${day.outOfMonth ? 'opacity-30' : ''}
              `}
            >
              {day.date}
              {day.hasTasks && !day.isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8A000]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming meetings */}
      <div className="p-4 border-b border-[#E8DFC8]">
        <p className="text-[11px] font-mono text-[#A08060] uppercase tracking-wider mb-3">Upcoming</p>
        <div className="space-y-2">
          {meetings.map(meeting => (
            <div key={meeting.id} className="flex items-start gap-2.5 p-2.5 rounded-[10px] hover:bg-[#F5EDD8] transition-all cursor-pointer">
              <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ background: meeting.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#3A2E1E] truncate">{meeting.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className="text-[#A08060]" />
                  <span className="text-[11px] text-[#A08060]">{meeting.time}</span>
                </div>
              </div>
              {meeting.meetLink && (
                <button className="flex-shrink-0 text-[11px] font-medium text-[#2D5A27] bg-[#EAF5E2] px-2 py-1 rounded-[6px] hover:bg-[#D1FAE5]">
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] font-mono text-[#A08060] uppercase tracking-wider mb-3">Today</p>
        {[
          { icon: <CheckCircle2 size={14} className="text-[#2D5A27]" />, value: '5', label: 'completed' },
          { icon: <Flame size={14} className="text-[#E8A000]" />, value: '12', label: 'day streak' },
          { icon: <Timer size={14} className="text-[#4A8C3F]" />, value: '2h 14m', label: 'focus time' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2.5 bg-[#F5EDD8] rounded-[10px] px-3 py-2.5">
            {stat.icon}
            <span className="font-['DM_Serif_Display'] text-[18px] text-[#3A2E1E]">{stat.value}</span>
            <span className="text-[11px] text-[#A08060]">{stat.label}</span>
          </div>
        ))}
      </div>

    </aside>
  );
}
