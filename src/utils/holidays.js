// src/utils/holidays.js - Official Thai Public Holidays Engine (Pure Live Sync)

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

export async function fetchLiveHolidays(year = new Date().getFullYear()) {
  const targetYear = parseInt(year) || new Date().getFullYear();

  // Pure Live Sync via /api/holidays?year=... (Hosted on same domain, 0 CORS errors)
  try {
    const res = await fetch(`/api/holidays?year=${targetYear}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.holidays) {
        return data.holidays;
      }
    }
  } catch (err) {
    // Return empty map on network issue without throwing red errors
  }

  return {};
}
