import 'dotenv/config';
// Check outreach log — see which leads have been sent and if any slugs exist
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const res = await fetch(`${CONVEX_URL}/api/query`, {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({path:'outreachLog:list', args:{}, format:'json'})
});
const d = await res.json() as any;
const logs = d.value ?? [];
console.log(`Total outreach records: ${logs.length}`);
// Show last 5
for (const l of logs.slice(-5)) {
  console.log(`[${l.status}] ${l.email} | slug: ${l.previewSlug ?? 'none'} | sent: ${l.sentAt}`);
}
