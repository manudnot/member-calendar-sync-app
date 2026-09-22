import React, { useRef, useEffect } from 'react';
import { THAI_MONTHS } from '../../utils/helpers';

export default function MonthYearPickerModal({
  isOpen,
  onClose,
  currentYear,
  currentMonth,
  onSelectMonthYear
}) {
  if (!isOpen) return null;

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i); // 2020 to 2034

  const monthListRef = useRef(null);
  const yearListRef = useRef(null);

  useEffect(() => {
    // Scroll active month & year into view
    if (monthListRef.current) {
      const activeMonthEl = monthListRef.current.querySelector('[data-active="true"]');
      if (activeMonthEl) {
        activeMonthEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
    if (yearListRef.current) {
      const activeYearEl = yearListRef.current.querySelector('[data-active="true"]');
      if (activeYearEl) {
        activeYearEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [isOpen, currentMonth, currentYear]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center animate-scale-up cursor-default relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            เลือกเดือน และ ปี พ.ศ.
          </h3>
        </div>

        {/* Scrollable Month & Year Selection Wheels */}
        <div className="w-full grid grid-cols-2 gap-4 py-4 relative h-64 overflow-hidden my-2">
          
          {/* Active Row Highlight Bar */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-11 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 pointer-events-none z-0" />

          {/* Month Column */}
          <div
            ref={monthListRef}
            className="flex flex-col items-center overflow-y-auto no-scrollbar py-24 space-y-2 z-10"
          >
            {THAI_MONTHS.map((mName, idx) => {
              const isSelected = idx === currentMonth;
              return (
                <button
                  key={`month_${idx}`}
                  type="button"
                  data-active={isSelected}
                  onClick={() => {
                    onSelectMonthYear(currentYear, idx);
                    onClose();
                  }}
                  className={`w-full py-2.5 text-center text-sm transition-all rounded-xl cursor-pointer ${
                    isSelected
                      ? 'font-black text-slate-900 dark:text-white text-base scale-105'
                      : 'font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>

          {/* Year Column */}
          <div
            ref={yearListRef}
            className="flex flex-col items-center overflow-y-auto no-scrollbar py-24 space-y-2 z-10"
          >
            {years.map(y => {
              const isSelected = y === currentYear;
              return (
                <button
                  key={`year_${y}`}
                  type="button"
                  data-active={isSelected}
                  onClick={() => {
                    onSelectMonthYear(y, currentMonth);
                    onClose();
                  }}
                  className={`w-full py-2.5 text-center text-sm font-mono transition-all rounded-xl cursor-pointer ${
                    isSelected
                      ? 'font-black text-slate-900 dark:text-white text-base scale-105'
                      : 'font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {y} ({y + 543})
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer Confirm / Close */}
        <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full justify-center py-2.5 text-xs font-extrabold shadow-sm"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
