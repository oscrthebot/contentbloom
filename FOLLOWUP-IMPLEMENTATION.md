# Follow-Up Automation Implementation

## Overview
Extended `email-scheduler.py` to implement automatic follow-up emails for cold outreach leads.

## Follow-Up Schedule
- **Day 3** after initial email: Follow-up #1 (gentle check-in)
- **Day 6** after initial email: Follow-up #2 (last chance)
- **Day 10** after initial email: Follow-up #3 (closing loop)
- **Stop condition**: Follow-ups automatically stop if lead responds or status changes from 'contacted'

## Changes Made

### 1. Schema Updates (`convex/schema.ts`)
Added two new fields to the `leads` table:
- `lastEmailDate: v.optional(v.string())` - ISO date of last email sent
- `followUpCount: v.optional(v.number())` - 0 = initial, 1-3 = follow-ups sent

### 2. New Convex Mutations (`convex/leads.ts`)

#### `updateLeadEmailStatus`
Updates lead with new email tracking fields after each send:
```typescript
args: {
  id: v.id("leads"),
  status: v.union(...),
  lastEmailDate: v.string(),
  followUpCount: v.number(),
}
```

#### `getLeadsForFollowUp`
Returns leads needing follow-up on a specific date:
```typescript
args: {
  targetDate: v.string(), // ISO date string (YYYY-MM-DD)
}
```
Filters leads based on:
- Status must be 'contacted', 'follow_up_1', or 'follow_up_2'
- Days since last email must match schedule (3, 3, 4 days respectively)
- Current followUpCount determines which follow-up to send

### 3. Email Templates (`templates/emails.ts`)
Added follow-up template exports:
```typescript
export const followUpTemplates = {
  followUp1: "Quick follow-up - did you see my last email about {{storeName}}?",
  followUp2: "Last chance - {{storeName}} content strategy",
  followUp3: "Closing the loop - {{storeName}}",
};
```

Updated `followUp()` function to include multilingual support (en, es, de, fr) for all 3 follow-up variants.

### 4. Email Scheduler (`email-scheduler.py`)

#### New Functions

**`build_follow_up_email(lead, sender_name, follow_up_count)`**
- Builds localized follow-up email based on count (1, 2, or 3)
- Supports en, es, de, fr languages
- Returns (subject, body) tuple

**`send_follow_up(account, lead, follow_up_count)`**
- Sends follow-up email via SMTP
- Logs success/failure
- Returns True/False

**`process_follow_ups(env, accounts)`**
- Queries for leads needing follow-up today
- Distributes leads across accounts round-robin
- Sends appropriate follow-up based on current followUpCount
- Updates lead status via `updateLeadEmailStatus`
- Logs all activity to outreachLog

#### Updated `main()` Function
Now runs in two phases:
1. **Cold emails**: Send to new leads (existing functionality)
2. **Follow-ups**: Process contacted leads needing follow-up

#### Lead Status Flow
```
new → contacted → follow_up_1 → follow_up_2 → follow_up_3
```

## Testing

### Dry Run Mode
Test without sending actual emails:
```bash
python3 email-scheduler.py --dry-run
```

### Verify Follow-Up Logic
1. Check `email-scheduler.log` for dry-run output
2. Verify leads are selected correctly based on `lastEmailDate`
3. Confirm status transitions in Convex dashboard

### Rate Limits
Follow-ups respect the same warmup schedule as cold emails:
- Days 1-7: 5 emails/day per account
- Days 8-14: 15 emails/day per account
- Days 15-21: 25 emails/day per account
- Day 22+: 40 emails/day per account

## Convex Deployment

After deploying schema changes:
```bash
npx convex dev  # or npx convex deploy
```

## Monitoring

Check logs for:
- `[DRY-RUN]` prefixes during testing
- `SENT FOLLOW-UP #N` for successful sends
- `FAILED FOLLOW-UP #N` for errors
- Follow-up counts and lead IDs in mutation logs

## Future Improvements

- [ ] Add bounce detection to stop follow-ups
- [ ] Implement reply detection via IMAP
- [ ] A/B test follow-up subject lines
- [ ] Add unsubscribe link to follow-up #3
- [ ] Schedule follow-ups at optimal send times per timezone
