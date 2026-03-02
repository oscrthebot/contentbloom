import 'dotenv/config';
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
// Check if any leads have a preview slug assigned
const res = await fetch(`${CONVEX_URL}/api/query`, {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({path:'leads:list', args:{status:'contacted'}, format:'json'})
});
const d = await res.json() as any;
const leads = d.value ?? [];
const withSlug = leads.filter((l: any) => l.previewSlug || l.slug);
console.log(`Contacted leads: ${leads.length}`);
console.log(`With preview slug: ${withSlug.length}`);
if (withSlug.length > 0) {
  for (const l of withSlug.slice(0,5)) {
    console.log(`  ${l.storeName} → /p/${l.previewSlug ?? l.slug}`);
  }
}
