# TimeTree-Style Member Calendar Web App (Supabase + Vercel + GAS + Typhoon AI LINE Bot)

## 📌 Project Overview
This project is a high-performance, mobile-responsive **TimeTree-Style Web Application** designed for team scheduling, multi-member task assignment, automated calendar subscription publishing via **Dynamic iCal (.ics) Feeds**, and AI-assisted mission parsing via **Typhoon AI & LINE Bot**.

- **Frontend**: Responsive HTML5/React + Vanilla CSS/Tailwind (TimeTree UI Theme: Month Grid, Daily Agenda, Member Selection Chips, iCal QR Code Modal)
- **Database**: **Supabase PostgreSQL** (`members`, `events` tables)
- **iCal Subscription Engine**: Vercel Serverless Function (`api/feed.js`) providing 24/7 HTTPS `.ics` feeds for Apple Calendar, Google Calendar, TimeTree, and Outlook
- **AI LINE Bot**: Vercel Serverless Function (`api/line-webhook.js`) integrated with **Typhoon AI** (`typhoon-ocr` for image parsing, `typhoon-v2.5-30b-a3b-instruct` for mission extraction and interactive draft queue management)
- **Automation Helper**: Google Apps Script (`gas/Code.gs`) for Google Sheets & Google Calendar sync

---

## 🚀 Key Features

1. **TimeTree-Inspired Month & Daily Agenda UI**:
   - Month View with color-coded badges for assigned team members
   - Daily Agenda View underneath for immediate event details
   - Timezone-safe All-Day (`all_day` boolean) event rendering and local time evaluation
   - Touch-friendly layout for mobile smartphones and desktop

2. **Multi-Member Selection & Dynamic Database Matching**:
   - Select 1 or multiple staff members when creating an event
   - Filter calendar view by specific staff member or view team schedule combined
   - Dynamic synchronization with Supabase `members` schema (`rank`, `first_name`, `last_name`, `nickname`, `full_name`, `member_type`, `is_archived`, `status`)

3. **Typhoon AI LINE Bot Integration**:
   - Automatically parses text orders or image uploads (whiteboards, mission rosters, official letters) via Typhoon AI
   - Interactive Draft Queue allowing natural language corrections (e.g. `แก้ไขวันที่ 2026-09-25`, `เปลี่ยนเป็นภารกิจหมาย`)
   - Direct confirmation into Supabase PostgreSQL

4. **Dynamic iCal (.ics) Feed Generator**:
   - Dedicated subscription URL per member: `/api/feed?memberId=xxx`
   - All-team subscription URL: `/api/feed?team=true`
   - One-click "Copy iCal Link", "Subscribe on Apple Calendar" (`webcal://`), "Google Calendar Link", and QR Code
   - Built-in `VALARM` for automatic mobile push notification reminders

5. **Vercel Serverless & Git Deployment Ready**:
   - Easy 1-click deployment via GitHub repository to Vercel

---

## 📊 Database Schema Standards (Supabase PostgreSQL)

### `events` Table
| Field | Type | Description |
|---|---|---|
| `id` | UUID / TEXT | Primary Key |
| `title` | TEXT | Mission title (e.g. `ประชุม C4I (วาระพิเศษ)`) |
| `start_time` | TIMESTAMPTZ | Start timestamp (UTC ISO 8601) |
| `end_time` | TIMESTAMPTZ | End timestamp (UTC ISO 8601) |
| `all_day` | BOOLEAN | `true` if all-day event, `false` if timed event |
| `description` | TEXT | Details (dress code, notes, etc.) |
| `location` | TEXT | Location / Meeting room |
| `category` | TEXT | Mission type (`ภารกิจหน่วย`, `ภารกิจหมาย`, `การฝึก/ศึกษา`) |
| `member_ids` | JSONB / TEXT[] | Array of member IDs assigned |
| `alarm_minutes` | INTEGER | Push notification reminder advance minutes |
| `created_at` | TIMESTAMPTZ | Timestamp created |

### `members` Table
| Field | Type | Description |
|---|---|---|
| `id` | TEXT | Member ID (e.g. `mem-1`, `mem-2`) |
| `name` | TEXT | Short display name / Rank + Nickname |
| `rank` | TEXT | Military rank (e.g. `พ.อ.`, `พ.ท.`, `ร.อ.`) |
| `first_name` | TEXT | First name |
| `last_name` | TEXT | Last name |
| `nickname` | TEXT | Nickname (e.g. `นอต`, `เอก`, `ท็อป`) |
| `full_name` | TEXT | Full formal name with rank |
| `member_type` | TEXT | Category (`ประจำการ`, `สมทบ`) |
| `is_archived` | BOOLEAN | Archived flag |
| `status` | TEXT | Member status (`active`, `inactive`) |
| `color` | TEXT | UI Color code (e.g. `#3b82f6`) |
| `avatar` | TEXT | Two-letter initials avatar |
| `email` | TEXT | Email address |
| `created_at` | TIMESTAMPTZ | Timestamp created |

---

## 📁 File Structure

```
member-calendar-sync-app/
├── .agents/
│   └── rules/
│       └── supa-calendar.md     # Agent rules for Supabase & iCal standards
├── api/
│   ├── feed.js                  # Vercel Serverless Function for iCal (.ics) feed
│   ├── line-webhook.js          # Vercel Serverless Function for LINE Bot & Typhoon AI
│   └── holidays.js              # Thai public holidays API
├── gas/
│   └── Code.gs                  # Google Apps Script sync template
├── src/
│   ├── components/              # React UI Components (Calendar, Agenda, MissionModal, etc.)
│   └── utils/                   # Helpers, Supabase client, and iCal utilities
├── supabase/
│   └── schema.sql               # PostgreSQL tables, policies, and seed data
├── .gitignore
├── vercel.json
├── README.md
├── LINE_SETUP_GUIDE.md
└── GEMINI.md
```

---

## 📋 Agent Workflow & Planning Rules

1. **Mandatory Planning Before Code Execution**:
   - Whenever the user reports a problem or requests a new feature/change, the agent MUST create or update an implementation plan (`implementation_plan.md`) first.
   - Do NOT make any source code changes or run mutating commands during the planning phase.

2. **Explicit User Approval Required**:
   - The agent MUST wait for explicit user approval ("Proceed" / "อนุมัติ") on the implementation plan before making any code modifications or running mutating shell commands.

