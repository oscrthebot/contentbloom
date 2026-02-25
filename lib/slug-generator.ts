const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'that', 'this', 'was', 'are',
  'be', 'has', 'had', 'have', 'will', 'would', 'could', 'should', 'may',
  'can', 'do', 'does', 'did', 'been', 'being', 'your', 'you', 'how',
  'what', 'which', 'who', 'when', 'where', 'why', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
]);

export function generateSlug(title: string, keyword: string): string {
  // Try keyword-first slug
  const keywordSlug = slugify(keyword);
  const titleSlug = slugify(title);

  // If keyword slug is short enough and meaningful, prefer it
  if (keywordSlug.length > 3 && keywordSlug.length <= 60) {
    return keywordSlug.slice(0, 60);
  }

  // Otherwise use title without stopwords
  const words = titleSlug.split('-').filter(w => !STOPWORDS.has(w));
  return words.join('-').slice(0, 60).replace(/-$/, '');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
