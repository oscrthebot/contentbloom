# Shopify Auto-Publish Integration — Done ✅

Completed: 2026-02-26
Commit: de41cad8
Branch: main (pushed)
Build: ✅ All 37 routes compile successfully

---

## What Was Implemented

### Step 1 — Onboarding: Shopify Step (Step 3)
**File:** `app/(auth)/onboard/page.tsx`

- Added a new `ShopifyForm` interface and `shopifyForm` state
- Step flow changed: `store → author → shopify → done`
- New `step === "shopify"` renders a Shopify connection form with:
  - `shopifyDomain` text input (placeholder: `your-store.myshopify.com`)
  - `shopifyAccessToken` password input (placeholder: `shpat_xxx...`)
  - "Connect Shopify" submit button (purple, calls `/api/shopify/settings`)
  - "Skip for now" button with note "You can connect later in Settings → Stores"
- Step indicator updated from 2 steps → 3 steps ("Store", "Author", "Shopify")
- After author step completes (save or skip) → goes to Shopify step
- After Shopify step → goes to checkout (if paid plan) or dashboard

---

### Step 2 — Convex Schema
**File:** `convex/schema.ts`

Added to `users` table:
- `shopifyDomain: v.optional(v.string())` — e.g. `my-store.myshopify.com`
- `shopifyAccessToken: v.optional(v.string())` — `shpat_xxx` token
- `shopifyAutoPublish: v.optional(v.boolean())` — toggle for auto-publish

Added to `articles` table:
- `shopifyArticleId: v.optional(v.string())` — Shopify article ID after publishing
- `shopifyPublishedAt: v.optional(v.string())` — ISO timestamp of when published

---

### Step 3 — Shopify Publish Utility
**File:** `lib/shopify-publish.ts`

Two exported functions:

**`publishToShopify(params)`**
- Fetches blog list from `GET /admin/api/2024-01/blogs.json`
- Finds the matching blog (by `blogTitle` param, default "News") or falls back to first
- Creates article via `POST /admin/api/2024-01/blogs/{id}/articles.json`
- Returns `{ success, shopifyArticleId, shopifyArticleUrl, error? }`

**`testShopifyConnection(params)`**
- Calls `GET /admin/api/2024-01/shop.json`
- Returns `{ success, shopName?, error? }`

---

### Step 4 — Convex Mutations

**`convex/articles.ts`** — added:
- `markShopifyPublished({ articleId, shopifyArticleId, shopifyPublishedAt })` — patches article with Shopify publish info

**`convex/users.ts`** — added:
- `updateShopifySettings({ userId, shopifyDomain?, shopifyAccessToken?, shopifyAutoPublish? })` — saves Shopify credentials
- `clearShopifySettings({ userId })` — clears all Shopify fields (disconnect)

---

### Step 5 — ArticleView: Publish Button
**File:** `app/dashboard/articles/[id]/ArticleView.tsx`

- New `ShopifyConfig` interface and `shopifyConfig` prop
- New state: `shopifyPublishing`, `shopifyResult`
- `handlePublishToShopify()` function calls `/api/shopify/publish`
- In the sticky top bar:
  - If connected + not yet published: shows purple "🛍️ Publish to Shopify" button
  - If published: shows "🛍️ Published" green text + "View →" link to Shopify article
- Below QA issues:
  - Error banner if publish failed
  - Info banner linking to Settings if user hasn't connected Shopify yet
- Article interface extended with `shopifyArticleId?` and `shopifyPublishedAt?`

**File:** `app/dashboard/articles/[id]/page.tsx`
- Fetches user data alongside article to get Shopify config
- Passes `shopifyConfig: { hasCredentials, shopifyDomain }` to ArticleView

---

### Step 6 — API Routes

**`app/api/shopify/publish/route.ts`** (POST)
- Validates session, checks user has Shopify credentials
- Fetches article from Convex, converts markdown → HTML (using `marked`)
- Calls `publishToShopify()` from the utility
- On success: calls `markShopifyPublished` Convex mutation
- Returns `{ success, shopifyArticleId, shopifyArticleUrl }`

**`app/api/shopify/settings/route.ts`** (POST)
- Validates session
- If `shopifyDomain === ""` and `shopifyAccessToken === ""` → calls `clearShopifySettings`
- Otherwise → calls `updateShopifySettings` with provided fields

**`app/api/shopify/test-connection/route.ts`** (POST)
- No auth required (just relays to Shopify)
- Calls `testShopifyConnection()` and returns result

---

### Step 7 — Stores Page: Shopify Section
**File:** `app/dashboard/stores/StoresClient.tsx`

Added full Shopify connection management section:
- Connected status badge (green "● Connected" / grey "Not connected")
- If connected: shows domain + "Disconnect" button
- Form with domain input and password token input
- **Auto-publish toggle** — toggles `shopifyAutoPublish` on user record
- **Test connection** button — calls `/api/shopify/test-connection`
- **Save Shopify settings** button
- Instructions for finding the Admin API token
- Disconnect flow calls `clearShopifySettings` via settings route

**File:** `app/dashboard/stores/page.tsx`
- Now fetches both stores + user in parallel
- Passes `shopifySettings: { shopifyDomain, shopifyAutoPublish, isConnected }` to StoresClient

---

## Architecture Notes

- Credentials are stored on the **user** record (not the store record), so each user has one Shopify connection
- The `shopifyAutoPublish` flag is stored but auto-publish on generation is NOT wired yet — it can be added to the article pipeline when needed
- Articles store `shopifyArticleId` once published, so the UI shows "Published ✓" persistently
- Markdown → HTML conversion uses the `marked` library (already a project dependency)
- Tags sent to Shopify = `[targetKeyword, ...secondaryKeywords].slice(0, 10)`
- Author name = `user.authorProfile.fullName` → `user.name` → email prefix (fallback chain)

---

## Files Changed

| File | Change |
|------|--------|
| `convex/schema.ts` | Added Shopify fields to users + articles tables |
| `convex/articles.ts` | Added `markShopifyPublished` mutation |
| `convex/users.ts` | Added `updateShopifySettings` + `clearShopifySettings` mutations |
| `lib/shopify-publish.ts` | NEW — Shopify API utility |
| `app/api/shopify/publish/route.ts` | NEW — Publish endpoint |
| `app/api/shopify/settings/route.ts` | NEW — Settings save/clear endpoint |
| `app/api/shopify/test-connection/route.ts` | NEW — Connection test endpoint |
| `app/(auth)/onboard/page.tsx` | Added Step 3 (Shopify) to onboarding |
| `app/dashboard/articles/[id]/ArticleView.tsx` | Added publish button + status |
| `app/dashboard/articles/[id]/page.tsx` | Fetch user + pass shopifyConfig |
| `app/dashboard/stores/StoresClient.tsx` | Added full Shopify management section |
| `app/dashboard/stores/page.tsx` | Fetch user + pass shopifySettings |
