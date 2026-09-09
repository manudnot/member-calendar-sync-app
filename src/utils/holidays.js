// src/utils/holidays.js - Official Thai Holidays Helper (100% Live Fetching from URL Link)

export function getHolidayForDate(dateStr, holidayMap = {}) {
  if (!dateStr || !holidayMap) return null;
  const name = holidayMap[dateStr];
  if (!name) return null;
  return {
    date: dateStr,
    name,
    isHoliday: true
  };
}

export async function fetchLiveHolidays() {
  try {
    const res = await fetch('/api/holidays');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.holidays) {
        return data.holidays;
      }
    }
  } catch (err) {
    console.warn('Network error fetching live holidays:', err);
  }
  return {};
}
