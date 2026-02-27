/**
 * LinkedIn Profile Scraper
 *
 * NOTE: Playwright is not available in serverless/Vercel environments.
 * This module returns empty profiles gracefully.
 * Future: use a LinkedIn API service (Proxycurl, etc.) for production enrichment.
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
 * Scrape a public LinkedIn profile.
 * Currently returns empty — Playwright not available in serverless.
 * Wire up Proxycurl or similar API for production use.
 */
export async function scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  if (!profileUrl || !profileUrl.includes('linkedin.com/in/')) {
    return EMPTY_PROFILE(profileUrl);
  }

  console.log('  ℹ️ LinkedIn scraping not available in serverless environment — skipping');
  return EMPTY_PROFILE(profileUrl);
}
