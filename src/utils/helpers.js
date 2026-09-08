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

export function formatThaiDateTime(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes} น.`;
}

export function getEventColor(evt, members = []) {
  if (!evt) return '#10B981';
  if (evt.color) return evt.color;

  if (evt.category) {
    if (evt.category.includes('ภารกิจหมาย') || evt.category.includes('Red')) return '#EF4444';
    if (evt.category.includes('ภารกิจหน่วย') || evt.category.includes('Yellow')) return '#F59E0B';
    if (evt.category.includes('งานหน่วย') || evt.category.includes('Purple')) return '#8B5CF6';
    if (evt.category.includes('ประชุม') || evt.category.includes('Emerald')) return '#10B981';
    if (evt.category.includes('การฝึก') || evt.category.includes('Brown')) return '#795548';
    if (evt.category.includes('กิจกรรมพิเศษ') || evt.category.includes('Pink')) return '#EC4899';
  }

  if (Array.isArray(evt.member_ids) && evt.member_ids.length > 0) {
    const firstMem = members.find(m => m.id === evt.member_ids[0]);
    if (firstMem && firstMem.color) return firstMem.color;
  }

  return '#10B981';
}

export function isAllDayEvent(evt) {
  if (!evt) return true;
  if (evt.all_day === false) return false;
  if (evt.all_day === true) return true;
  if (evt.start_time && evt.start_time.includes('T')) {
    const timePart = evt.start_time.split('T')[1].substring(0, 5);
    const endTimePart = evt.end_time && evt.end_time.includes('T') ? evt.end_time.split('T')[1].substring(0, 5) : '00:00';
    if (timePart !== '00:00' || (endTimePart !== '23:59' && endTimePart !== '00:00')) {
      return false;
    }
  }
  return true;
}

export function convertMinutesToNotif(totalMinutes) {
  const mins = Number(totalMinutes) || 15;
  if (mins % 10080 === 0) {
    return { value: mins / 10080, unit: 'week before' };
  }
  if (mins % 1440 === 0) {
    return { value: mins / 1440, unit: 'day before' };
  }
  if (mins % 60 === 0) {
    return { value: mins / 60, unit: 'hour before' };
  }
  return { value: mins, unit: 'min before' };
}

export function formatAlarmLabel(totalMinutes) {
  const mins = Number(totalMinutes);
  if (isNaN(mins) || mins <= 0) return 'ไม่เตือน';
  if (mins % 10080 === 0) {
    const w = mins / 10080;
    return `${w} สัปดาห์ก่อนหน้า`;
  }
  if (mins % 1440 === 0) {
    const d = mins / 1440;
    return `${d} วันก่อนหน้า`;
  }
  if (mins % 60 === 0) {
    const h = mins / 60;
    return `${h} ชั่วโมงก่อนหน้า`;
  }
  return `${mins} นาทีก่อนหน้า`;
}




