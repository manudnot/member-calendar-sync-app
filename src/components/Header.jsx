import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Laptop, QrCode, Plus, Menu } from 'lucide-react';
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
  onOpenAddEvent
}) {
  const monthName = THAI_MONTHS[currentMonth];
  const thaiYear = currentYear + 543;

  return (
    <header className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-4 lg:px-6 py-3 flex items-center justify-between transition-colors duration-200 shadow-sm shrink-0 z-10 glass-panel">
      
      {/* Left: Sidebar Toggle & TimeTree Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            T
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              TimeTree <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Team Calendar</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Month Navigator & View Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border border-slate-200 dark:border-dark-border rounded-xl px-2 py-1 bg-slate-50 dark:bg-dark-bg shadow-inner">
          <button
            onClick={onPrevMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-lg transition-colors focus:outline-none"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[110px] text-center select-none font-mono">
            {monthName} {thaiYear}
          </span>

          <button
            onClick={onNextMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-lg transition-colors focus:outline-none"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="btn-secondary py-1 px-3 text-xs"
        >
          วันนี้
        </button>

        <div className="hidden md:flex items-center bg-slate-100 dark:bg-dark-bg p-1 rounded-xl border border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Right: Theme Switcher & Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Theme Switcher (DutyRoster Header Style) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-bg p-1 rounded-xl border border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-dark-card text-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="โหมดสว่าง"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-white dark:bg-dark-card text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="โหมดมืด"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-dark-card text-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="อัตโนมัติ"
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenIcalModal}
          className="btn-secondary hidden sm:flex"
        >
          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>iCal Hub</span>
        </button>

        <button
          onClick={onOpenAddEvent}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มงาน</span>
        </button>
      </div>

    </header>
  );
}
