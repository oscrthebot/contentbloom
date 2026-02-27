/**
 * LinkedIn Profile Scraper via Jina Reader API
 *
 * Uses r.jina.ai to fetch LinkedIn public profiles as clean markdown.
 * Free tier: 1M tokens/month. No Playwright, works in serverless.
 *
 * Jina Reader: https://jina.ai/reader/
 */

export interface LinkedInExperience {
  title: string;
  company: string;
  duration?: string;
}

export interface LinkedInProfile {
  fullName?: string;
  headline?: string;
  about?: string;
  photoUrl?: string;
  location?: string;
  experiences: LinkedInExperience[];
  education: string[];
  skills: string[];
  profileUrl: string;
}

const EMPTY_PROFILE = (url: string): LinkedInProfile => ({
  experiences: [],
  education: [],
  skills: [],
  profileUrl: url,
});

/**
 * Fetch a LinkedIn profile using Jina Reader API.
 * Returns clean markdown of the profile, then parses key fields.
 */
export async function scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  if (!profileUrl || !profileUrl.includes('linkedin.com/in/')) {
    return EMPTY_PROFILE(profileUrl);
  }

  try {
    const jinaUrl = `https://r.jina.ai/${profileUrl}`;
    const headers: Record<string, string> = {
      'Accept': 'text/plain',
      'X-Return-Format': 'text',
    };

    // Optional: use API key for higher rate limits
    const jinaKey = process.env.JINA_API_KEY;
    if (jinaKey) headers['Authorization'] = `Bearer ${jinaKey}`;

    const res = await fetch(jinaUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.log(`  ⚠️ Jina Reader returned ${res.status} for LinkedIn profile`);
      return EMPTY_PROFILE(profileUrl);
    }

    const text = await res.text();

    // Parse key fields from the markdown text
    const profile = parseLinkedInMarkdown(text, profileUrl);
    console.log(`  ✅ LinkedIn profile fetched via Jina: ${profile.fullName || 'unknown'}`);
    return profile;

  } catch (err) {
    console.log(`  ⚠️ LinkedIn scraping failed: ${err instanceof Error ? err.message : err}`);
    return EMPTY_PROFILE(profileUrl);
  }
}

/**
 * Parse Jina Reader markdown output into structured LinkedIn data.
 */
function parseLinkedInMarkdown(text: string, profileUrl: string): LinkedInProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Name: usually the first H1
  const h1 = lines.find(l => l.startsWith('# '));
  const fullName = h1?.replace(/^#\s+/, '').trim();

  // Headline: line right after the name
  const nameIndex = h1 ? lines.indexOf(h1) : -1;
  const headline = nameIndex >= 0 ? lines[nameIndex + 1] : undefined;

  // About/summary: look for section
  const aboutIdx = lines.findIndex(l => /^#{1,3}\s*(about|summary)/i.test(l));
  const about = aboutIdx >= 0 ? lines.slice(aboutIdx + 1, aboutIdx + 4).join(' ') : undefined;

  // Experience: look for experience section
  const expIdx = lines.findIndex(l => /^#{1,3}\s*experience/i.test(l));
  const experiences: LinkedInExperience[] = [];
  if (expIdx >= 0) {
    const expLines = lines.slice(expIdx + 1, expIdx + 20);
    let current: Partial<LinkedInExperience> = {};
    for (const line of expLines) {
      if (/^#{1,3}\s/.test(line)) break; // hit next section
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (current.title) experiences.push(current as LinkedInExperience);
        current = { title: line.replace(/^#{2,3}\s+/, '') };
      } else if (current.title && !current.company) {
        current.company = line;
      } else if (current.company && !current.duration && /\d{4}/.test(line)) {
        current.duration = line;
      }
      if (experiences.length >= 3) break;
    }
    if (current.title) experiences.push(current as LinkedInExperience);
  }

  // Education
  const eduIdx = lines.findIndex(l => /^#{1,3}\s*education/i.test(l));
  const education: string[] = [];
  if (eduIdx >= 0) {
    const eduLines = lines.slice(eduIdx + 1, eduIdx + 10);
    for (const line of eduLines) {
      if (/^#{1,3}\s/.test(line)) break;
      if (line.length > 3 && !line.startsWith('-')) education.push(line);
      if (education.length >= 2) break;
    }
  }

  // Skills
  const skillsIdx = lines.findIndex(l => /^#{1,3}\s*skills/i.test(l));
  const skills: string[] = [];
  if (skillsIdx >= 0) {
    const skillLines = lines.slice(skillsIdx + 1, skillsIdx + 15);
    for (const line of skillLines) {
      if (/^#{1,3}\s/.test(line)) break;
      const clean = line.replace(/^[-*]\s*/, '').trim();
      if (clean.length > 1) skills.push(clean);
      if (skills.length >= 8) break;
    }
  }

  return {
    fullName: fullName || undefined,
    headline: headline || undefined,
    about: about || undefined,
    profileUrl,
    experiences,
    education,
    skills,
  };
}

/**
 * Build a text enrichment string from a LinkedIn profile for use in article generation.
 * Returns null if the profile has no useful data.
 */
export function buildLinkedInEnrichment(profile: LinkedInProfile): string | null {
  const parts: string[] = [];

  if (profile.fullName) parts.push(`Name: ${profile.fullName}`);
  if (profile.headline) parts.push(`Headline: ${profile.headline}`);
  if (profile.about) parts.push(`About: ${profile.about}`);
  if (profile.location) parts.push(`Location: ${profile.location}`);

  if (profile.experiences.length > 0) {
    parts.push('Experience:');
    profile.experiences.forEach(e => {
      parts.push(`  - ${e.title}${e.company ? ` at ${e.company}` : ''}${e.duration ? ` (${e.duration})` : ''}`);
    });
  }

  if (profile.education.length > 0) {
    parts.push(`Education: ${profile.education.join(', ')}`);
  }

  if (profile.skills.length > 0) {
    parts.push(`Skills: ${profile.skills.join(', ')}`);
  }

  return parts.length > 1 ? parts.join('\n') : null;
}
