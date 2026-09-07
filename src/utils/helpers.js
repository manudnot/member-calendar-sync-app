export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTimeShort(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatThaiMonth(currentMonthStr) {
  if (!currentMonthStr) return '';
  const [y, m] = currentMonthStr.split('-').map(Number);
  const thaiMonth = THAI_MONTHS[m - 1];
  const thaiYear = y + 543;
  return `${thaiMonth} ${thaiYear}`;
}

export function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(16, 185, 129, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export function isEventOnDate(evt, targetDateStr) {
  if (!evt || !evt.start_time || !targetDateStr) return false;

  const sDateStr = evt.start_time.includes('T')
    ? evt.start_time.split('T')[0]
    : formatDateKey(new Date(evt.start_time));

  const eDateStr = evt.end_time
    ? (evt.end_time.includes('T') ? evt.end_time.split('T')[0] : formatDateKey(new Date(evt.end_time)))
    : sDateStr;

  return targetDateStr >= sDateStr && targetDateStr <= eDateStr;
}

