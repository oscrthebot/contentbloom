import 'dotenv/config';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api.js';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Load the pipeline runner
const { runArticlePipeline } = await import('./generator/pipeline-runner');

console.log('🚀 Running pipeline with fixes for Misihu...');

const result = await runArticlePipeline({
  storeName: 'Misihu Cosmetics',
  storeUrl: 'https://misihucosmetics.com',
  niche: 'cosmética y cuidado de la piel',
  language: 'es',
  wordCount: 1500,
  articleType: 'guide',
  clientId: 'j977frynrwts52m5r7ccfa0q0n81tfed',
  userId: 'kd7f3t36d4sjk43y127ndyqwwh81tbt2',
  authorProfile: {
    fullName: 'Silvia García',
    bio: 'Llevo más de 10 años trabajando en el sector de la cosmética y el cuidado de la piel. He asesorado a cientos de clientas en encontrar su rutina perfecta.',
    credentials: 'Experta en Skincare',
    niche: 'cosmética y skincare',
    yearsExperience: 10,
    linkedinUrl: 'https://www.linkedin.com/in/silvia-garc%C3%ADa-abell%C3%A1n-16a71949/'
  }
});

if (result.success) {
  console.log('✅ Article saved!');
  console.log('📝 Title:', result.article?.title);
  console.log('📊 QA Score:', result.article?.qaScore);
  console.log('📏 Words:', result.article?.wordCount);
  console.log('🔑 Convex ID:', result.convexArticleId);
} else {
  console.log('❌ Failed:', result.error);
  console.log('📊 QA Score:', result.qaScore);
  console.log('🚫 Critical issues:', result.qaCriticalIssues);
}
