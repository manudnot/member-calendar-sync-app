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

export function getLocalDateStr(isoStr) {
  if (!isoStr) return '';
  if (typeof isoStr === 'string' && isoStr.includes('T')) {
    return isoStr.split('T')[0];
  }
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return isoStr;
  return formatDateKey(date);
}

export function getLocalTimeStr(isoStr) {
  if (!isoStr) return '09:00';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '09:00';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
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

export function sanitizeEventsTime(eventsList) {
  if (!Array.isArray(eventsList)) return [];
  return eventsList.map(evt => {
    let sTime = evt.start_time;
    let eTime = evt.end_time;

    if (evt.id === 'evt_tt_81' && sTime === '2026-09-09T10:00:00Z') {
      sTime = '2026-09-09T03:00:00Z';
      eTime = '2026-09-09T05:00:00Z';
    } else if (evt.id === 'evt_tt_2' && sTime === '2025-01-02T08:30:00Z') {
      sTime = '2025-01-02T01:30:00Z';
      eTime = '2025-01-02T09:00:00Z';
    }

    return {
      ...evt,
      start_time: sTime,
      end_time: eTime
    };
  });
}

export function isEventOnDate(evt, targetDateStr) {
  if (!evt || !evt.start_time || !targetDateStr) return false;

  const sDateStr = getLocalDateStr(evt.start_time);
  const eDateStr = evt.end_time ? getLocalDateStr(evt.end_time) : sDateStr;

  // Direct date match for event range
  const isDirectMatch = targetDateStr >= sDateStr && targetDateStr <= eDateStr;
  if (isDirectMatch) return true;

  // Detect repeat mode from field or title/description
  let repeatMode = evt.repeat || 'none';
  if (repeatMode === 'none') {
    const titleLower = (evt.title || '').toLowerCase();
    const descLower = (evt.description || '').toLowerCase();
    if (titleLower.includes('วันเกิด') || titleLower.includes('เกิด') || descLower.includes('yearly')) {
      repeatMode = 'yearly';
    } else if (descLower.includes('weekly')) {
      repeatMode = 'weekly';
    } else if (descLower.includes('daily')) {
      repeatMode = 'daily';
    } else if (descLower.includes('monthly')) {
      repeatMode = 'monthly_date';
    }
  }

  if (repeatMode === 'none') return false;

  // Ensure target date is on or after start date (except birthdays which apply to all years)
  const isBirthday = (evt.title || '').includes('วันเกิด') || (evt.title || '').includes('เกิด');
  if (!isBirthday && targetDateStr < sDateStr) return false;

  // Custom repeat end condition check
  if (evt.custom_repeat) {
    if (evt.custom_repeat.ends_mode === 'on' && evt.custom_repeat.ends_on) {
      if (targetDateStr > evt.custom_repeat.ends_on) return false;
    }
  }

  const sDateParts = sDateStr.split('-').map(Number);
  const tDateParts = targetDateStr.split('-').map(Number);
  const tDate = new Date(tDateParts[0], tDateParts[1] - 1, tDateParts[2]);

  switch (repeatMode) {
    case 'yearly': {
      // Same Month & Day (MM-DD)
      const sMMDD = sDateStr.substring(5);
      const tMMDD = targetDateStr.substring(5);
      return sMMDD === tMMDD;
    }

    case 'monthly_date': {
      // Same day of month (DD)
      return sDateParts[2] === tDateParts[2];
    }

    case 'weekly': {
      // Same day of week
      const sDate = new Date(sDateParts[0], sDateParts[1] - 1, sDateParts[2]);
      return sDate.getDay() === tDate.getDay();
    }

    case 'weekdays': {
      // Monday to Friday (1..5)
      const dayOfWeek = tDate.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }

    case 'daily': {
      return true;
    }

    default:
      return false;
  }
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

export const INITIAL_CATEGORIES = [
  { id: 'cat_unit', name: 'ภารกิจหน่วย', color: '#ef4444', sort_order: 1 },
  { id: 'cat_royal', name: 'ภารกิจหมาย', color: '#f59e0b', sort_order: 2 },
  { id: 'cat_meeting', name: 'ประชุม', color: '#10b981', sort_order: 3 },
  { id: 'cat_work', name: 'งานหน่วย', color: '#8b5cf6', sort_order: 4 },
  { id: 'cat_training', name: 'การฝึก', color: '#795548', sort_order: 5 },
  { id: 'cat_special', name: 'กิจกรรมพิเศษ', color: '#ec4899', sort_order: 6 }
];

export function getEventColor(evt, categories = INITIAL_CATEGORIES, members = []) {
  if (!evt) return '#10b981';

  const catList = Array.isArray(categories) && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  // 1. By category_id match
  if (evt.category_id) {
    const matchedCat = catList.find(c => c.id === evt.category_id);
    if (matchedCat && matchedCat.color) return matchedCat.color;
  }

  // 2. By legacy category text match
  if (evt.category) {
    const catName = evt.category.toLowerCase();
    const matchedCat = catList.find(c => c.name && catName.includes(c.name.toLowerCase()));
    if (matchedCat && matchedCat.color) return matchedCat.color;
  }

  // 3. By title keywords fallback
  const title = (evt.title || '').toLowerCase();
  if (title.includes('หน่วย') || title.includes('จเร') || title.includes('ตรวจ')) {
    return '#ef4444';
  }
  if (title.includes('หมาย') || title.includes('904') || title.includes('905') || title.includes('908') || title.includes('hmsv')) {
    return '#f59e0b';
  }
  if (title.includes('ประชุม') || title.includes('vtc') || title.includes('สัมภาษณ์') || title.includes('อบรม')) {
    return '#10b981';
  }
  if (title.includes('ฝึก') || title.includes('กฝร') || title.includes('staffex') || title.includes('cpx') || title.includes('calflex') || title.includes('unit school')) {
    return '#795548';
  }
  if (title.includes('วันเด็ก') || title.includes('วันเกิด')) {
    return '#ec4899';
  }

  // 4. By assigned member color
  if (Array.isArray(evt.member_ids) && evt.member_ids.length > 0 && Array.isArray(members) && members.length > 0) {
    const firstMem = members.find(m => m.id === evt.member_ids[0]);
    if (firstMem && firstMem.color) return firstMem.color;
  }

  // 5. Custom explicit color if valid
  if (evt.color) return evt.color;

  return '#8b5cf6';
}

export function ensureEventCategoryAndColor(evt, categories = INITIAL_CATEGORIES) {
  if (!evt) return evt;

  const catList = Array.isArray(categories) && categories.length > 0 ? categories : INITIAL_CATEGORIES;
  let catId = evt.category_id;

  if (!catId) {
    const catStr = (evt.category || '').toLowerCase();
    const titleStr = (evt.title || '').toLowerCase();

    if (catStr.includes('หมาย') || titleStr.includes('หมาย') || titleStr.includes('904') || titleStr.includes('905') || titleStr.includes('908') || titleStr.includes('hmsv')) {
      catId = 'cat_royal';
    } else if (catStr.includes('หน่วย') || titleStr.includes('จิตอาสา') || titleStr.includes('ตรวจพื้นที่')) {
      catId = 'cat_unit';
    } else if (catStr.includes('ประชุม') || titleStr.includes('ประชุม') || titleStr.includes('vtc') || titleStr.includes('สัมภาษณ์') || titleStr.includes('อบรม')) {
      catId = 'cat_meeting';
    } else if (catStr.includes('ฝึก') || titleStr.includes('ฝึก') || titleStr.includes('กฝร') || titleStr.includes('staffex') || titleStr.includes('cpx') || titleStr.includes('calflex') || titleStr.includes('unit school')) {
      catId = 'cat_training';
    } else if (catStr.includes('กิจกรรม') || titleStr.includes('วันเด็ก') || titleStr.includes('วันเกิด')) {
      catId = 'cat_special';
    } else {
      catId = 'cat_work';
    }
  }

  const matchedCat = catList.find(c => c.id === catId) || catList[0];

  return {
    ...evt,
    category_id: catId,
    category: matchedCat ? matchedCat.name : (evt.category || 'งานหน่วย'),
    color: matchedCat ? matchedCat.color : (evt.color || '#8b5cf6')
  };
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




