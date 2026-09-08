// Utility for Master Unit Passcode verification and SHA-256 hashing
const MASTER_PASSCODE_EXACT = 'CRMASIGNAL21';

export async function hashPasscode(text) {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return text;
  }
}

export function verifyMasterPasscode(input) {
  if (!input) return false;
  // Exact case-sensitive match (CRMASIGNAL21) as requested by user
  return input.trim() === MASTER_PASSCODE_EXACT;
}
