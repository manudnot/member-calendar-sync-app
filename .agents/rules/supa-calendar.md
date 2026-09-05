# Agent Rules: Supabase & iCal Calendar Standards

## Rule Guidelines

1. **Supabase Schema Rules**:
   - `members.id` must be unique string formatted with prefix e.g. `mem_xxxx`.
   - `events.member_ids` must be stored as a `JSONB` array of string member IDs (e.g. `["mem_1", "mem_2"]`).
   - All datetime fields (`start_time`, `end_time`) must be stored in UTC ISO 8601 string format (`TIMESTAMP WITH TIME ZONE`).

2. **iCal (.ics) Output Rules**:
   - Headers must include `Access-Control-Allow-Origin: *` and `Content-Type: text/calendar; charset=utf-8`.
   - DTSTART and DTEND must be correctly formatted to UTC date-time string (`YYYYMMDDTHHMMSSZ`).
   - Every event must include a `VALARM` component specifying trigger time in minutes before event (`TRIGGER:-PT15M`).

3. **Vercel Serverless Function Rules**:
   - Serverless entry points live inside `/api/*.js`.
   - Must handle OPTIONS CORS preflight requests cleanly with status 200.
