import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck, AlertCircle, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { verifyMasterPasscode } from '../../utils/crypto';

export default function ForgotPinModal({
  isOpen,
  onClose,
  members,
  onResetPinWithOtp
}) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [masterPasscode, setMasterPasscode] = useState('');
  const [step, setStep] = useState('verify_passcode'); // 'verify_passcode' | 'new_pin'
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const activeMembers = members.filter(m => !m.is_archived && m.status !== 'resigned' && m.member_type !== 'virtual');

  const handleVerifyPasscode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('กรุณาเลือกชื่อสมาชิกที่ต้องการรีเซ็ตรหัส PIN');
      return;
    }

    if (!masterPasscode || !masterPasscode.trim()) {
      setErrorMsg('กรุณากรอกรหัสหน่วย');
      return;
    }

    const isValid = await verifyMasterPasscode(masterPasscode);
    if (!isValid) {
      setErrorMsg('รหัสหน่วยไม่ถูกต้อง (กรุณาตรวจสอบการพิมพ์ตัวเล็ก-ตัวใหญ่ให้ถูกต้อง)');
      return;
    }

    const target = members.find(m => m.id === selectedMemberId);
    setStep('new_pin');
    setSuccessMsg(`ยืนยันรหัสหน่วยสำเร็จ! กรุณาตั้งรหัส PIN 4 หลักใหม่สำหรับคุณ ${target?.name}`);
  };

  const handleDigitChange = (val, idx, isConfirm = false) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 1);
    const targetArr = isConfirm ? [...confirmPin] : [...newPin];
    targetArr[idx] = cleanVal;

    if (isConfirm) setConfirmPin(targetArr);
    else setNewPin(targetArr);

    if (cleanVal && idx < 3) {
      const nextId = isConfirm ? `forgot_cpin_${idx + 1}` : `forgot_pin_${idx + 1}`;
      const nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.focus();
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const p1 = newPin.join('');
    const p2 = confirmPin.join('');

    if (p1.length < 4 || p2.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบถ้วน');
      return;
    }

    if (p1 !== p2) {
      setErrorMsg('รหัส PIN ทั้งสองครั้งไม่ตรงกัน');
      return;
    }

    onResetPinWithOtp(selectedMemberId, p1);
    onClose();
  };

  const targetMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-xs font-black">
              กู้คืนและตั้งรหัส PIN ใหม่ (Forgot PIN)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Member & Enter Master Passcode */}
          {step === 'verify_passcode' && (
            <form onSubmit={handleVerifyPasscode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  1. เลือกชื่อสมาชิกที่ต้องการรีเซ็ต PIN:
                </label>
                <select
                  className="input-field text-xs font-bold"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                >
                  <option value="">-- เลือกสมาชิก --</option>
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  2. กรอกรหัสหน่วย:
                </label>
                <input
                  type="password"
                  className="input-field text-xs font-mono tracking-wider"
                  placeholder="กรอกรหัสหน่วย"
                  value={masterPasscode}
                  onChange={(e) => setMasterPasscode(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ยืนยันรหัสหน่วย ➔ ตั้ง PIN ใหม่</span>
              </button>
            </form>
          )}

          {/* STEP 2: Set New PIN */}
          {step === 'new_pin' && (
            <form onSubmit={handleSavePin} className="flex flex-col gap-4">
              {targetMember && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <span
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-mono font-black text-xs shadow-sm"
                    style={{ backgroundColor: targetMember.color }}
                  >
                    {targetMember.initials || targetMember.name.substring(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    คุณ {targetMember.name}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  ตั้งรหัส PIN 4 หลักใหม่:
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`forgot_pin_${idx}`}
                      id={`forgot_pin_${idx}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none"
                      value={newPin[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  ยืนยันรหัส PIN 4 หลักอีกครั้ง:
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`forgot_cpin_${idx}`}
                      id={`forgot_cpin_${idx}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none"
                      value={confirmPin[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, true)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary py-2.5 text-xs shadow-md mt-2"
              >
                บันทึกรหัส PIN ใหม่
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

