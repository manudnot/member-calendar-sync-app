import React, { useState } from 'react';
import { User, KeyRound, ShieldCheck, Fingerprint, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function FirstTimeUserModal({
  isOpen,
  members,
  onSelectMemberWithPin,
  onSaveNewPin
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [confirmPinInput, setConfirmPinInput] = useState(['', '', '', '']);
  const [step, setStep] = useState('select_user'); // 'select_user' | 'enter_pin' | 'setup_pin'
  const [errorMsg, setErrorMsg] = useState('');
  const [enableBiometrics, setEnableBiometrics] = useState(true);

  if (!isOpen) return null;

  const activeMembers = members.filter(m => !m.is_archived && m.status !== 'resigned');

  const handleChooseMember = (member) => {
    setSelectedMember(member);
    setErrorMsg('');
    setPinInput(['', '', '', '']);
    setConfirmPinInput(['', '', '', '']);

    if (member.pin_code) {
      setStep('enter_pin');
    } else {
      setStep('setup_pin');
    }
  };

  const handleDigitChange = (val, idx, isConfirm = false) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 1);
    const targetArr = isConfirm ? [...confirmPinInput] : [...pinInput];
    targetArr[idx] = cleanVal;

    if (isConfirm) {
      setConfirmPinInput(targetArr);
    } else {
      setPinInput(targetArr);
    }

    // Auto focus next input
    if (cleanVal && idx < 3) {
      const nextId = isConfirm ? `confirm_pin_${idx + 1}` : `pin_${idx + 1}`;
      const nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.focus();
    }
  };

  const handleKeyDown = (e, idx, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const targetArr = isConfirm ? confirmPinInput : pinInput;
      if (!targetArr[idx] && idx > 0) {
        const prevId = isConfirm ? `confirm_pin_${idx - 1}` : `pin_${idx - 1}`;
        const prevEl = document.getElementById(prevId);
        if (prevEl) prevEl.focus();
      }
    }
  };

  const handleVerifyExistingPin = (e) => {
    e.preventDefault();
    const enteredPin = pinInput.join('');
    if (enteredPin.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบ');
      return;
    }

    if (enteredPin !== selectedMember.pin_code) {
      setErrorMsg('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPinInput(['', '', '', '']);
      const firstEl = document.getElementById('pin_0');
      if (firstEl) firstEl.focus();
      return;
    }

    onSelectMemberWithPin(selectedMember.id, enteredPin, enableBiometrics);
  };

  const handleCreateNewPin = (e) => {
    e.preventDefault();
    const p1 = pinInput.join('');
    const p2 = confirmPinInput.join('');

    if (p1.length < 4 || p2.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบถ้วน');
      return;
    }

    if (p1 !== p2) {
      setErrorMsg('รหัส PIN ทั้งสองครั้งไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      setConfirmPinInput(['', '', '', '']);
      const cEl = document.getElementById('confirm_pin_0');
      if (cEl) cEl.focus();
      return;
    }

    onSaveNewPin(selectedMember.id, p1, enableBiometrics);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col gap-1 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-1 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-base font-black tracking-tight">
            ยินดีต้อนรับ! ตั้งค่าตัวตนสำหรับอุปกรณ์นี้
          </h2>
          <p className="text-xs font-semibold text-emerald-100">
            {step === 'select_user' && 'กรุณาเลือกชื่อของคุณเพื่อเปิดใช้งานระบบประจำเครื่องนี้'}
            {step === 'enter_pin' && `กรอกรหัส PIN 4 หลักเพื่อยืนยันตัวตนในนาม ${selectedMember?.name}`}
            {step === 'setup_pin' && `ตั้งรหัส PIN 4 หลักใหม่สำหรับคุณ ${selectedMember?.name}`}
          </p>
        </div>

        <div className="p-5 overflow-y-auto no-scrollbar flex-1 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Member Identity */}
          {step === 'select_user' && (
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                รายชื่อสมาชิกทีม (คลิกเลือกชื่อของคุณ):
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {activeMembers.map(mem => (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => handleChooseMember(mem)}
                    className="p-3 bg-slate-50 dark:bg-dark-bg/80 border border-slate-200 dark:border-dark-border hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-mono font-black text-xs shadow-sm"
                        style={{ backgroundColor: mem.color }}
                      >
                        {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {mem.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {mem.pin_code ? '🔒 ตั้งรหัส PIN แล้ว' : '✨ ยังไม่ได้ตั้งรหัส PIN'}
                        </span>
                      </div>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2A: Enter Existing PIN */}
          {step === 'enter_pin' && (
            <form onSubmit={handleVerifyExistingPin} className="flex flex-col gap-5 py-2">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
                  style={{ backgroundColor: selectedMember?.color }}
                >
                  {selectedMember?.initials}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedMember?.name}
                </span>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  กรอกรหัส PIN 4 หลัก:
                </label>
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`pin_${idx}`}
                      id={`pin_${idx}`}
                      type="password"
                      maxLength={1}
                      className="w-12 h-14 text-center font-mono font-black text-xl bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-2xl outline-none shadow-sm focus:scale-105 transition-all"
                      value={pinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                      onKeyDown={(e) => handleKeyDown(e, idx, false)}
                    />
                  ))}
                </div>
              </div>

              {/* Biometrics Switch */}
              <div className="p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    เปิดใช้ Face ID / Touch ID สำหรับเครื่องนี้
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_user')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  ยืนยันเข้าใช้งาน
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: Setup New PIN */}
          {step === 'setup_pin' && (
            <form onSubmit={handleCreateNewPin} className="flex flex-col gap-4 py-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
                  style={{ backgroundColor: selectedMember?.color }}
                >
                  {selectedMember?.initials}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedMember?.name}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  ตั้งรหัส PIN 4 หลักประจำตัว:
                </label>
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`pin_${idx}`}
                      id={`pin_${idx}`}
                      type="password"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none shadow-sm transition-all"
                      value={pinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                      onKeyDown={(e) => handleKeyDown(e, idx, false)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ยืนยันรหัส PIN 4 หลักอีกครั้ง:
                </label>
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`confirm_pin_${idx}`}
                      id={`confirm_pin_${idx}`}
                      type="password"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none shadow-sm transition-all"
                      value={confirmPinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, true)}
                      onKeyDown={(e) => handleKeyDown(e, idx, true)}
                    />
                  ))}
                </div>
              </div>

              {/* Biometrics Switch */}
              <div className="p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    เปิดใช้ Face ID / Touch ID ประจำเครื่อง
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_user')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  บันทึกรหัส PIN & เข้าใช้งาน
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
