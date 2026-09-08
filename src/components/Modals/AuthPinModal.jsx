import React, { useState } from 'react';
import { X, KeyRound, Fingerprint, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { verifyPinCode } from '../../utils/crypto';

export default function AuthPinModal({
  isOpen,
  onClose,
  targetMember,
  onAuthenticateSuccess
}) {
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !targetMember) return null;

  const handleDigitChange = (val, idx) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 1);
    const targetArr = [...pinInput];
    targetArr[idx] = cleanVal;
    setPinInput(targetArr);

    if (cleanVal && idx < 3) {
      const nextEl = document.getElementById(`auth_pin_${idx + 1}`);
      if (nextEl) nextEl.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !pinInput[idx] && idx > 0) {
      const prevEl = document.getElementById(`auth_pin_${idx - 1}`);
      if (prevEl) prevEl.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredPin = pinInput.join('');
    if (enteredPin.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบ');
      return;
    }

    if (targetMember.pin_code) {
      const isValid = await verifyPinCode(enteredPin, targetMember.pin_code);
      if (!isValid) {
        setErrorMsg('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        setPinInput(['', '', '', '']);
        const firstEl = document.getElementById('auth_pin_0');
        if (firstEl) firstEl.focus();
        return;
      }
    }

    onAuthenticateSuccess(targetMember.id, enteredPin);
    onClose();
  };

  const handleBiometricAuth = () => {
    // WebAuthn Biometric Trigger / Simulation for TouchID / FaceID
    onAuthenticateSuccess(targetMember.id, targetMember.pin_code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/80 dark:bg-dark-bg/80">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              ยืนยันรหัส PIN ตัวตน
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
              style={{ backgroundColor: targetMember.color }}
            >
              {targetMember.initials || targetMember.name.substring(0, 2).toUpperCase()}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                {targetMember.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                กรอกรหัส PIN 4 หลักเพื่อเข้าใช้งาน
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5 justify-center py-2">
            {[0, 1, 2, 3].map(idx => (
              <input
                key={`auth_pin_${idx}`}
                id={`auth_pin_${idx}`}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-14 text-center font-mono font-black text-xl bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-2xl outline-none shadow-sm focus:scale-105 transition-all"
                value={pinInput[idx]}
                onChange={(e) => handleDigitChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleBiometricAuth}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
          >
            <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>สแกน Face ID / Touch ID แทน PIN</span>
          </button>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 text-xs py-2.5"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-xs py-2.5"
            >
              ยืนยันรหัส PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
