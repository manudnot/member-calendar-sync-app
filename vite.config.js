import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-holidays-dev-server',
      configureServer(server) {
        server.middlewares.use('/api/holidays', async (req, res, next) => {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const reqYear = urlObj.searchParams.get('year') ? parseInt(urlObj.searchParams.get('year')) : new Date().getFullYear();
            const yearBE = reqYear + 543;

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

            for (const u of urls) {
              try {
                const response = await fetch(u, fetchOptions);
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
              } catch (e) {}
            }

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, year: reqYear, holidays }));
          } catch (e) {
            next();
          }
        });
      }
    }
  ],
});
