import React from 'react';
import { Users, QrCode, Activity, Plus, Sun, Moon, Laptop } from 'lucide-react';

export default function RightToolbar({
  onOpenMemberManagement,
  onOpenIcalModal,
  onOpenActivityLog,
  onOpenAddEvent,
  unreadActivityCount,
  theme = 'light',
  setTheme
}) {
  const handleNextTheme = () => {
    if (!setTheme) return;
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <aside className="w-13 bg-white dark:bg-dark-card border-l border-slate-200 dark:border-dark-border flex flex-col items-center py-4 gap-4 shrink-0 hidden lg:flex glass-panel">
      <button
        onClick={onOpenMemberManagement}
        className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        title="จัดการสมาชิก (Add/Edit Members)"
      >
        <Users className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenIcalModal}
        className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        title="ซิงค์ iCal / QR Code"
      >
        <QrCode className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenActivityLog}
        className="relative p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        title="ประวัติกิจกรรมและถังขยะ (Activity Log & Recycle Bin)"
      >
        <Activity className="w-5 h-5" />
        {unreadActivityCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black font-mono w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-card animate-pulse shadow-sm">
            {unreadActivityCount > 9 ? '9+' : unreadActivityCount}
          </span>
        )}
      </button>

      {setTheme && (
        <button
          onClick={handleNextTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
          title={
            theme === 'light'
              ? 'โหมดสว่าง (กดเพื่อเปลี่ยนเป็นโหมดมืด)'
              : theme === 'dark'
              ? 'โหมดมืด (กดเพื่อเปลี่ยนเป็นโหมดตามระบบ)'
              : 'โหมดตามระบบ (กดเพื่อเปลี่ยนเป็นโหมดสว่าง)'
          }
        >
          {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
          {theme === 'dark' && <Moon className="w-5 h-5 text-slate-300" />}
          {theme === 'system' && <Laptop className="w-5 h-5 text-emerald-500" />}
        </button>
      )}

      <button
        onClick={onOpenAddEvent}
        className="p-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md focus:outline-none cursor-pointer"
        title="เพิ่มกิจกรรมใหม่"
      >
        <Plus className="w-5 h-5" />
      </button>
    </aside>
  );
}
