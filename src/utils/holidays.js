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

  // 1. Try Vercel Serverless Function via window.location.origin
  try {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const apiUrl = `${origin}/api/holidays?year=${targetYear}`;
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.holidays && Object.keys(data.holidays).length > 0) {
        return data.holidays;
      }
    }
  } catch (err) {
    console.warn('Vercel API notice:', err);
  }

  // 2. Client-side CORS Proxy Fallback
  const holidays = {};
  const rawUrls = [
    `https://myhora.com/calendar/ical/holiday.aspx?${yearBE}.ics`,
    'https://myhora.com/calendar/ical/holiday.aspx?latest.ics'
  ];

  for (const rawUrl of rawUrls) {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
      const res = await fetch(proxyUrl);
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
      console.warn('CORS Proxy notice for', rawUrl, e);
    }
  }

  return holidays;
}
