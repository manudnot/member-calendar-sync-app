# Project Agent Instructions: Member Calendar Sync App

This repository houses a high-performance **TimeTree-Style Team Member Calendar Web App** with Supabase PostgreSQL and dynamic iCal (.ics) subscription endpoints.

## 📌 Architecture & Design Rules

1. **Design Quality (Duty-Roster Specification)**:
   - Follow [.agents/skills/frontend-design/SKILL.md](file:///.agents/skills/frontend-design/SKILL.md).
   - Do NOT use emojis in UI titles, buttons, or member cards. Use clean SVG icons and initials avatars (`WD`, `SN`, `MN`, `JN`, etc.).
   - Enforce clean 3-column layout (Left Sidebar Filter, Center Calendar Grid + Daily Agenda Drawer, Right Quick Toolbar).

2. **Database & API Standards**:
   - Supabase tables `members` and `events`.
   - UTC ISO 8601 timestamps for all start/end times.
   - iCal subscription engine at `/api/feed.js` returning valid `.ics` content with `VALARM` push triggers.

3. **Repository Tree & Logs**:
   - Maintain repository status in [.agents/index/repo-tree.md](file:///.agents/index/repo-tree.md).
   - Log deployment & architecture updates in [.agents/index/session-log.md](file:///.agents/index/session-log.md).
