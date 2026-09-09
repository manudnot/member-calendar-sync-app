// api/holidays.js - Vercel Serverless Function to proxy & parse myhora holidays
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
    return res.status(200).json({
      success: false,
      error: error.message,
      holidays: FALLBACK_HOLIDAYS
    });
  }
}

const FALLBACK_HOLIDAYS = {
  "2025-01-01": "วันขึ้นปีใหม่",
  "2025-02-12": "วันมาฆบูชา",
  "2025-04-06": "วันจักรี",
  "2025-04-07": "วันหยุดชดเชย",
  "2025-04-13": "วันสงกรานต์",
  "2025-04-14": "วันสงกรานต์",
  "2025-04-15": "วันสงกรานต์",
  "2025-04-16": "วันหยุดชดเชย",
  "2025-05-01": "วันแรงงาน (เอกชน)",
  "2025-05-04": "วันฉัตรมงคล",
  "2025-05-05": "วันหยุดชดเชย",
  "2025-05-09": "วันพืชมงคล (ราชการ)",
  "2025-05-11": "วันวิสาขบูชา",
  "2025-05-12": "วันหยุดชดเชย",
  "2025-06-02": "วันหยุดพิเศษ (ครม.)",
  "2025-06-03": "วันเฉลิมฯ พระบรมราชินี",
  "2025-07-10": "วันอาสาฬหบูชา",
  "2025-07-11": "วันเข้าพรรษา (ราชการ)",
  "2025-07-28": "วันเฉลิมฯ พระวชิรเกล้าเจ้าอยู่หัว",
  "2025-08-11": "วันหยุดพิเศษ (ครม.)",
  "2025-08-12": "วันแม่",
  "2025-10-13": "วันนวมินทรมหาราช",
  "2025-10-23": "วันปิยมหาราช",
  "2025-12-05": "วันพ่อ",
  "2025-12-10": "วันรัฐธรรมนูญ",
  "2025-12-31": "วันสิ้นปี",
  "2026-01-01": "วันขึ้นปีใหม่",
  "2026-01-02": "วันหยุดพิเศษ (ครม.)",
  "2026-03-03": "วันมาฆบูชา",
  "2026-04-06": "วันจักรี",
  "2026-04-13": "วันสงกรานต์",
  "2026-04-14": "วันสงกรานต์",
  "2026-04-15": "วันสงกรานต์",
  "2026-05-01": "วันแรงงาน (เอกชน)",
  "2026-05-04": "วันฉัตรมงคล",
  "2026-05-13": "วันพืชมงคล (ราชการ)",
  "2026-05-31": "วันวิสาขบูชา",
  "2026-06-01": "วันหยุดชดเชย",
  "2026-06-03": "วันเฉลิมฯ พระบรมราชินี",
  "2026-07-28": "วันเฉลิมฯ พระวชิรเกล้าเจ้าอยู่หัว",
  "2026-07-29": "วันอาสาฬหบูชา",
  "2026-07-30": "วันเข้าพรรษา (ราชการ)",
  "2026-08-12": "วันแม่",
  "2026-10-13": "วันนวมินทรมหาราช",
  "2026-10-23": "วันปิยมหาราช",
  "2026-12-05": "วันพ่อ",
  "2026-12-07": "วันหยุดชดเชย",
  "2026-12-10": "วันรัฐธรรมนูญ",
  "2026-12-31": "วันสิ้นปี"
};
