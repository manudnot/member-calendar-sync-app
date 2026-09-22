import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Laptop, QrCode, Plus, Menu, History, Shield, ChevronDown, UserCheck } from 'lucide-react';
import { THAI_MONTHS } from '../utils/helpers';

export default function Header({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode,
  setViewMode,
  theme,
  setTheme,
  onToggleSidebar,
  onOpenIcalModal,
  onOpenAddEvent,
  activeUser,
  onOpenSwitchUserModal,
  onOpenActivityLogModal,
  unreadActivityCount
}) {
  const monthName = THAI_MONTHS[currentMonth];
  const thaiYear = currentYear + 543;

  return (
    <header className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-4 lg:px-6 py-3 flex items-center justify-between transition-colors duration-200 shadow-sm shrink-0 z-10 glass-panel">
      
      {/* Left: Sidebar Toggle & TimeTree Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            S
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-purple-600 dark:text-purple-400 whitespace-nowrap flex items-center gap-1.5">
              Signal21 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Team Calendar</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Month Navigator & View Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 border border-slate-200 dark:border-dark-border rounded-xl px-1.5 sm:px-2 py-1 bg-slate-50 dark:bg-dark-bg shadow-inner">
          <button
            onClick={onPrevMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[95px] sm:min-w-[110px] text-center select-none font-mono">
            {monthName} {thaiYear}
          </span>

          <button
            onClick={onNextMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="btn-secondary py-1 px-2.5 text-xs"
        >
          วันนี้
        </button>
      </div>

      {/* Right: User Identity Chip */}
      <div className="flex items-center gap-2">
        {/* Per-Device Active User Avatar Chip */}
        {activeUser && (
          <button
            onClick={onOpenSwitchUserModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-xs group"
            title="สลับตัวตนผู้ใช้งานประจำเครื่อง"
          >
            <span
              className="w-5 h-5 rounded-full text-white flex items-center justify-center font-mono font-black text-[10px] shadow-xs shrink-0"
              style={{ backgroundColor: activeUser.color }}
            >
              {activeUser.initials || activeUser.name.substring(0, 2).toUpperCase()}
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate max-w-[70px] sm:max-w-[100px] inline">
              {activeUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </button>
        )}
      </div>

    </header>
  );
}
