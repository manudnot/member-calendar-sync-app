import React, { useState } from 'react';
import { X, QrCode, Copy, ExternalLink, Calendar, Check } from 'lucide-react';

export default function IcalModal({ isOpen, onClose, members }) {
  const [selectedMember, setSelectedMember] = useState('team');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const feedUrl = selectedMember === 'team'
    ? `${baseUrl}/api/feed?team=true`
    : `${baseUrl}/api/feed?memberId=${selectedMember}`;

  const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://');
  const googleSubscribeUrl = `https://calendar.google.com/calendar/r/settings/addcalendar?cid=${encodeURIComponent(feedUrl)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(feedUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              สมัครรับปฏิทิน iCal (.ics) บนมือถือ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            นำลิงก์ iCal ไป Subscribe บนสมาร์ทโฟน (Apple Calendar บน iPhone, Google Calendar, หรือ TimeTree) กิจกรรมจะซิงค์และแจ้งเตือนผ่าน Push Notification อัตโนมัติ 24 ชั่วโมง!
          </p>

          {/* Member Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              เลือกสมาชิกสำหรับลิงก์เฉพาะบุคคล:
            </label>
            <select
              className="input-field font-semibold"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="team">👥 ลิงก์รวมกิจกรรมของทั้งทีม (All Team)</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.initials} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* URL & Copy Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              URL สำหรับ Subscribe iCal (.ics):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                className="input-field font-mono text-xs select-all"
                value={feedUrl}
              />
              <button
                onClick={handleCopy}
                className="btn-primary shrink-0 text-xs px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Direct Buttons */}
          <div className="flex flex-col gap-2">
            <a
              href={webcalUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary justify-center py-2.5"
            >
              <Calendar className="w-4 h-4 text-slate-800 dark:text-slate-100" />
              <span>กดสมัครรับบน iPhone (Apple Calendar)</span>
            </a>

            <a
              href={googleSubscribeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary justify-center py-2.5 text-blue-600 dark:text-blue-400"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดใน Google Calendar</span>
            </a>
          </div>

          {/* QR Code */}
          <div className="text-center p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              หรือใช้มือถือสแกน QR Code เพื่อ Subscribe ทันที:
            </span>
            <img
              src={qrApiUrl}
              alt="iCal QR Code"
              className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-dark-border flex justify-end bg-slate-50/50 dark:bg-dark-bg/50">
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
