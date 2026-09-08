// Utility for Master Unit Passcode SHA-256 verification (Secure Cryptographic Hashing)
// Plaintext passcode is NEVER stored in source code or JS bundles.
const MASTER_PASSCODE_HASH = 'd055b202e9983b7c46406d8db17cc031b62633512008cd326a5a7f5b01415382';

export async function hashPasscode(text) {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return '';
  }
}

export async function verifyMasterPasscode(input) {
  if (!input) return false;
  // Exact case-sensitive match verification via SHA-256 hash digest comparison
  const inputHash = await hashPasscode(input.trim());
  return inputHash === MASTER_PASSCODE_HASH;
}

export async function verifyPinCode(enteredPin, storedPin) {
  if (!enteredPin || !storedPin) return false;
  const cleanEntered = enteredPin.trim();
  const cleanStored = storedPin.trim();
  // 1. Direct match (legacy 4-digit plaintext fallback)
  if (cleanEntered === cleanStored) return true;
  // 2. Cryptographic SHA-256 hash match
  const hashedInput = await hashPasscode(cleanEntered);
  return hashedInput === cleanStored;
}



