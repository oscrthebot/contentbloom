import * as dotenv from 'dotenv';
dotenv.config();

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

async function main() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const articles = await client.query(api.articles.getArticlesByKeyword, {
    clientId: 'j977frynrwts52m5r7ccfa0q0n81tfed' as any,
    keyword: 'skincare'
  });

  const latest = (articles as any[]).sort((a: any, b: any) => b._creationTime - a._creationTime)[0];
  if (!latest) { console.log('No articles found'); return; }
  console.log('Title:', latest.title);
  console.log('Status:', latest.status);
  console.log('QA Score:', latest.qaScore);
  console.log('QA Critical Issues:', latest.qaCriticalIssues);
  console.log('QA Issues count:', latest.qaIssues?.length ?? 0);
  const bannerMatches = latest.content.match(/^>\s\*\*.+\*\*.+\[.+\]\(.+\)/gm);
  console.log('Product banners (regex):', bannerMatches?.length ?? 0);
  if (bannerMatches) bannerMatches.forEach((b: string) => console.log(' -', b.slice(0, 120)));
  // Also check plain > lines
  const blockquoteLines = latest.content.split('\n').filter((l: string) => l.startsWith('>'));
  console.log('Blockquote lines total:', blockquoteLines.length);
  blockquoteLines.slice(0,5).forEach((l: string) => console.log(' >', l.slice(0,120)));
}

main().catch(console.error);
