import 'dotenv/config';
// Find and delete all articles for Misihu
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const CLIENT_ID = 'j977frynrwts52m5r7ccfa0q0n81tfed';
const keywords = ['a', 'e', 'i', 'o', 'la', 'de', 'el', 'guia', 'tipo', 'cosmetic'];
const found = new Set<string>();
for (const kw of keywords) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({path:'articles:getArticlesByKeyword', args:{clientId:CLIENT_ID, keyword:kw}, format:'json'})
  });
  const d = await res.json() as any;
  for (const a of (d.value??[])) found.add(a._id);
}
console.log(`Found ${found.size} articles to delete`);
for (const id of found) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({path:'articles:deleteArticle', args:{id}, format:'json'})
  });
  const d = await res.json() as any;
  console.log(d.status==='success' ? `✅ ${id}` : `❌ ${id}`);
}
