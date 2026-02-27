import 'dotenv/config';
import { runArticlePipeline } from './generator/pipeline-runner';

console.log('🚀 Starting pipeline for Misihu Cosmetics...');

const result = await runArticlePipeline({
  storeName: 'Misihu Cosmetics',
  storeUrl: 'https://misihucosmetics.com',
  niche: 'cosmetics and skincare',
  language: 'es',
  articleType: 'guide',
  wordCount: 1500,
  clientId: 'j977frynrwts52m5r7ccfa0q0n81tfed',
  userId: 'kd7f3t36d4sjk43y127ndyqwwh81tbt2',
  authorProfile: {
    fullName: 'Silvia García',
    bio: 'Experta en Skincare con más de 10 años de experiencia en el sector.',
    credentials: 'Skincare Expert',
    niche: 'skincare',
    yearsExperience: 10,
    linkedinUrl: 'https://www.linkedin.com/in/silvia-garc%C3%ADa-abell%C3%A1n-16a71949/'
  }
});

console.log('✅ TITLE:', result?.title ?? 'unknown');
console.log('📊 SCORE:', result?.qaScore ?? 0);
console.log('🎯 PASSED:', (result?.qaScore ?? 0) >= 85);
console.log('📝 ARTICLE ID:', result?.articleId ?? 'not saved');
