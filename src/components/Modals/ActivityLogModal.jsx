import React, { useState } from 'react';
import { X, History, Trash2, RotateCcw, Clock, PlusCircle, Edit3, ShieldAlert, CheckCircle } from 'lucide-react';
import { THAI_MONTHS, formatTimeShort } from '../../utils/helpers';

export default function ActivityLogModal({
  isOpen,
  onClose,
  activityLogs,
  deletedEvents,
  members,
  onRestoreEvent
}) {
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'trash'

  if (!isOpen) return null;

  const getMemberById = (mId) => members.find(m => m.id === mId);

  const formatLogTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const year = d.getFullYear() + 543;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${day} ${month} ${year} ${time} น.`;
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
            <PlusCircle className="w-3 h-3" /> เพิ่มกิจกรรม
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> แก้ไขกิจกรรม
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> ลบกิจกรรม
          </span>
        );
      case 'RESTORE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> กู้คืนกิจกรรม
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header & Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/80 dark:bg-dark-bg/80">
          <div className="flex items-center gap-2 bg-slate-200 dark:bg-dark-bg p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติการทำงาน ({activityLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all ${
                activeTab === 'trash'
                  ? 'bg-white dark:bg-dark-card text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ถังขยะกู้คืน ({deletedEvents.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto no-scrollbar flex-1 flex flex-col gap-3">
          
          {/* TAB 1: Activity Audit Logs */}
          {activeTab === 'logs' && (
            <div className="flex flex-col gap-2.5">
              {activityLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold text-xs">
                  ยังไม่มีประวัติการใช้งานบันทึกในระบบ
                </div>
              ) : (
                activityLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col gap-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-mono font-black text-[10px] shrink-0 shadow-xs"
                          style={{ backgroundColor: log.actor_color || '#10b981' }}
                        >
                          {log.actor_name ? log.actor_name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {log.actor_name || 'ผู้ใช้งาน'}
                        </span>
                      </div>

                      {getActionBadge(log.action)}
                    </div>

                    <div className="flex flex-col gap-0.5 pl-8 border-l-2 border-slate-200 dark:border-slate-700 ml-3 py-0.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {log.event_title}
                      </span>
                      {log.details && (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {log.details}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLogTime(log.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Trash / Recycle Bin */}
          {activeTab === 'trash' && (
            <div className="flex flex-col gap-2.5">
              {deletedEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500/60" />
                  <span>ไม่มีรายการที่ถูกลบอยู่ในถังขยะ</span>
                </div>
              ) : (
                deletedEvents.map(evt => {
                  const deletedLog = activityLogs.find(l => l.event_id === evt.id && l.action === 'DELETE');

                  return (
                    <div
                      key={evt.id}
                      className="p-3 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                            {evt.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            ถูกลบแล้ว
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          ลบเมื่อ: {deletedLog ? formatLogTime(deletedLog.created_at) : 'ไม่ระบุ'} 
                          {deletedLog && ` โดย ${deletedLog.actor_name}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRestoreEvent(evt.id)}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>กู้คืน</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
