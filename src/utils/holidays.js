// src/utils/holidays.js - Official Thai Holidays Helper (100% Live Fetching EXCLUSIVELY from MyHora website)

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
  const yearBE = targetYear + 543;

  // 1. Try Serverless Function /api/holidays?year=...
  try {
    const res = await fetch(`/api/holidays?year=${targetYear}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.holidays && Object.keys(data.holidays).length > 0) {
        return data.holidays;
      }
    }
  } catch (err) {
    console.warn('Network notice fetching /api/holidays:', err);
  }

  // 2. Direct client-side fetch from MyHora website link (BE year + latest.ics)
  const holidays = {};
  const urls = [
    `https://myhora.com/calendar/ical/holiday.aspx?${yearBE}.ics`,
    'https://myhora.com/calendar/ical/holiday.aspx?latest.ics'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const vevents = text.split('BEGIN:VEVENT');
        vevents.shift();
        for (const vevt of vevents) {
          const dtMatch = vevt.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
          const summaryMatch = vevt.match(/SUMMARY:(.+)/);
          if (dtMatch && summaryMatch) {
            const rawDt = dtMatch[1];
            const dateStr = `${rawDt.substring(0,4)}-${rawDt.substring(4,6)}-${rawDt.substring(6,8)}`;
            holidays[dateStr] = summaryMatch[1].trim();
          }
        }
      }
    } catch (e) {
      console.warn('Direct fetch notice for', url, e);
    }
  }

  return holidays;
}
