import React, { useRef, useEffect, useState } from 'react';
import { THAI_MONTHS } from '../../utils/helpers';
import { X } from 'lucide-react';

export default function MonthYearPickerModal({
  isOpen,
  onClose,
  currentYear,
  currentMonth,
  onSelectMonthYear,
  events = []
}) {
  const [tempYear, setTempYear] = useState(currentYear);
  const [tempMonth, setTempMonth] = useState(currentMonth);

  const monthListRef = useRef(null);
  const yearListRef = useRef(null);

  // Sync temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempYear(currentYear);
      setTempMonth(currentMonth);
    }
  }, [isOpen, currentYear, currentMonth]);

  // Compute available years range: earliest event year (or currentYear - 7) to currentYear + 3
  const computeYears = () => {
    let minYear = currentYear - 7;
    if (events && events.length > 0) {
      events.forEach(e => {
        if (e.start_time) {
          const y = new Date(e.start_time).getFullYear();
          if (!isNaN(y) && y < minYear) {
            minYear = y;
          }
        }
      });
    }
    const maxYear = new Date().getFullYear() + 3;
    const yearList = [];
    for (let y = minYear; y <= Math.max(maxYear, currentYear + 3); y++) {
      yearList.push(y);
    }
    return yearList;
  };

  const years = computeYears();

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, tempMonth, tempYear]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectMonthYear(tempYear, tempMonth);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center animate-scale-up cursor-default relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            เลือกเดือน และ ปี พ.ศ.
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
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
              const isSelected = idx === tempMonth;
              return (
                <button
                  key={`month_${idx}`}
                  type="button"
                  data-active={isSelected}
                  onClick={() => setTempMonth(idx)}
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

          {/* Year Column (พ.ศ. ONLY) */}
          <div
            ref={yearListRef}
            className="flex flex-col items-center overflow-y-auto no-scrollbar py-24 space-y-2 z-10"
          >
            {years.map(y => {
              const isSelected = y === tempYear;
              const thaiBE = y + 543;
              return (
                <button
                  key={`year_${y}`}
                  type="button"
                  data-active={isSelected}
                  onClick={() => setTempYear(y)}
                  className={`w-full py-2.5 text-center text-sm font-mono transition-all rounded-xl cursor-pointer ${
                    isSelected
                      ? 'font-black text-slate-900 dark:text-white text-base scale-105'
                      : 'font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {thaiBE}
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer Confirm / Done Button */}
        <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary w-full justify-center py-2.5 text-xs font-extrabold shadow-sm"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
