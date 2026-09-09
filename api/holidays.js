// api/holidays.js - Vercel Serverless Function fetching exclusively from myhora live ics link
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://myhora.com/calendar/ical/holiday.aspx?latest.ics');
    if (!response.ok) {
      throw new Error(`Myhora HTTP ${response.status}`);
    }
    const icsText = await response.text();

    const holidays = {};
    const vevents = icsText.split('BEGIN:VEVENT');
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

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      holidays
    });
  } catch (error) {
    console.error('Error fetching myhora holidays:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      holidays: {}
    });
  }
}
