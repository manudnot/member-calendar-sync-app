import React from 'react';
import { Users, QrCode, Activity, Plus } from 'lucide-react';

export default function RightToolbar({
  onOpenMemberManagement,
  onOpenIcalModal,
  onOpenActivityLog,
  onOpenAddEvent
}) {
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
        className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        title="ประวัติกิจกรรมและถังขยะ (Activity Log & Recycle Bin)"
      >
        <Activity className="w-5 h-5" />
      </button>

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
