import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Laptop, QrCode, Plus, Menu, History, Shield, ChevronDown, UserCheck, Search, X } from 'lucide-react';
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
  unreadActivityCount,
  onOpenMonthYearPicker,
  searchQuery = '',
  setSearchQuery
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const monthName = THAI_MONTHS[currentMonth];
  const thaiYear = currentYear + 543;

  return (
    <header className="bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-1.5 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between transition-colors duration-200 shadow-sm shrink-0 z-10 glass-panel overflow-hidden gap-1 sm:gap-3 w-full">
      
      {/* Left: Sidebar Toggle & TimeTree Logo (Fluid Shrink) */}
      <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 shrink-0 sm:shrink">
        <button
          onClick={onToggleSidebar}
          className="p-1 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none cursor-pointer shrink-0"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs sm:text-lg shadow-sm shrink-0">
            S
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap min-w-0">
            <h1 className="text-xs sm:text-base font-black tracking-tight text-purple-600 dark:text-purple-400 whitespace-nowrap flex items-center gap-1 min-w-0">
              Signal21 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Team Calendar</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Month Navigator & View Switcher (Fluid Flex-1 Centered) */}
      <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2.5 min-w-0 px-0.5">
        <div className="flex items-center gap-0.5 sm:gap-1 border border-slate-200 dark:border-dark-border rounded-xl px-1 sm:px-2 py-1 bg-slate-50 dark:bg-dark-bg shadow-inner shrink-0">
          <button
            onClick={onPrevMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5 sm:p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span
            onClick={onOpenMonthYearPicker}
            className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[75px] sm:min-w-[105px] text-center select-none font-mono truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-0.5 transition-colors px-1"
            title="กดเพื่อเลือกเดือน และ ปี พ.ศ."
          >
            <span>{monthName} {thaiYear}</span>
            <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
          </span>

          <button
            onClick={onNextMonth}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5 sm:p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="btn-secondary py-1 px-1.5 sm:px-3 text-[10px] sm:text-xs whitespace-nowrap shrink-0"
        >
          วันนี้
        </button>
      </div>

      {/* Right: Expanding Search Bar & User Identity Chip */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
        
        {/* TimeTree-style Expanding Search Bar */}
        {setSearchQuery && (
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-bg border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 animate-scale-up shadow-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="ค้นหาชื่อกิจกรรม..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-28 sm:w-44 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 border-l border-slate-200 dark:border-slate-700 pl-1 ml-0.5"
                  title="ปิดช่องค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer relative ${
                  searchQuery ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : ''
                }`}
                title="ค้นหาชื่อกิจกรรม"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {searchQuery && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Per-Device Active User Avatar Chip */}
        {activeUser && (
          <button
            onClick={onOpenSwitchUserModal}
            className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1 rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-xs group"
            title="สลับตัวตนผู้ใช้งานประจำเครื่อง"
          >
            <span
              className="w-5 h-5 rounded-full text-white flex items-center justify-center font-mono font-black text-[10px] shadow-xs shrink-0"
              style={{ backgroundColor: activeUser.color }}
            >
              {activeUser.initials || activeUser.name.substring(0, 2).toUpperCase()}
            </span>
            <span className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate max-w-[45px] sm:max-w-[100px] inline">
              {activeUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </button>
        )}
      </div>

    </header>
  );
}
