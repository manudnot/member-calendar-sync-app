# TimeTree-Style Member Calendar Web App (Supabase + Vercel + GAS)

## 📌 Project Overview
This project is a high-performance, mobile-responsive **TimeTree-Style Web Application** designed for team scheduling, multi-member task assignment, and automated calendar subscription publishing via **Dynamic iCal (.ics) Feeds**.

- **Frontend**: Responsive HTML5/Vanilla CSS/JavaScript (TimeTree UI Theme: Month Grid, Daily Agenda, Member Selection Chips, iCal QR Code Modal)
- **Database**: **Supabase PostgreSQL** (`members`, `events` tables)
- **iCal Subscription Engine**: Vercel Serverless Function (`api/feed.js`) providing 24/7 HTTPS `.ics` feeds for Apple Calendar, Google Calendar, TimeTree, and Outlook
- **Automation Helper**: Google Apps Script (`gas/Code.gs`) for Google Sheets & Google Calendar sync

---

## 🚀 Key Features

1. **TimeTree-Inspired Month & Daily Agenda UI**:
   - Month View with color-coded badges for assigned team members
   - Daily Agenda View underneath for immediate event details
   - Touch-friendly layout for mobile smartphones and desktop
2. **Multi-Member Selection**:
   - Select 1 or multiple staff members when creating an event
   - Filter calendar view by specific staff member or view team schedule combined
3. **Dynamic iCal (.ics) Feed Generator**:
   - Dedicated subscription URL per member: `/api/feed?memberId=xxx`
   - All-team subscription URL: `/api/feed?team=true`
   - One-click "Copy iCal Link", "Subscribe on Apple Calendar" (`webcal://`), "Google Calendar Link", and QR Code
   - Built-in `VALARM` for automatic mobile push notification reminders
4. **Vercel Serverless & Git Deployment Ready**:
   - Easy 1-click deployment via GitHub repository to Vercel

---

## 📁 File Structure

```
member-calendar-sync-app/
├── .agents/
│   └── rules/
│       └── supa-calendar.md     # Agent rules for Supabase & iCal standards
├── api/
│   └── feed.js                  # Vercel Serverless Function for iCal (.ics) feed
├── gas/
│   └── Code.gs                  # Google Apps Script sync template
├── public/
│   ├── index.html               # Main Web App UI (TimeTree style)
│   ├── styles.css               # TimeTree-inspired glassmorphism & responsive CSS
│   └── app.js                   # Web App client logic & Supabase JS integration
├── supabase/
│   └── schema.sql               # PostgreSQL tables, policies, and seed data
├── .gitignore
├── GEMINI.md                    # Project guidance & rules
├── README.md                    # Setup and Vercel deployment guide
├── package.json
└── vercel.json                  # Vercel routing configuration
```
