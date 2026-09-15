// api/holidays.js - Vercel Serverless Function fetching exclusively from myhora live ics links
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reqYear = req.query?.year ? parseInt(req.query.year) : new Date().getFullYear();
  const yearBE = reqYear + 543;

  try {
    const urls = [
      `https://myhora.com/calendar/ical/holiday.aspx?${yearBE}.ics`,
      'https://myhora.com/calendar/ical/holiday.aspx?latest.ics'
    ];

    const holidays = {};
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    for (const url of urls) {
      try {
        const response = await fetch(url, fetchOptions);
        if (response.ok) {
          const icsText = await response.text();
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
        }
      } catch (e) {
        console.warn('Sub-fetch error for', url, e);
      }
    }

    return res.status(200).json({
      success: true,
      year: reqYear,
      year_be: yearBE,
      updated_at: new Date().toISOString(),
      count: Object.keys(holidays).length,
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
