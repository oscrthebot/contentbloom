/**
 * LinkedIn Profile Scraper
 *
 * Fetches public LinkedIn profile data to enrich E-E-A-T signals.
 * Uses Playwright headless with a realistic user-agent.
 *
 * NOTE: LinkedIn aggressively blocks scraping. This returns empty gracefully
 * if blocked — the article generation pipeline continues without LinkedIn data.
 * Only use on publicly accessible profiles.
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
 * Returns empty profile gracefully if blocked or unavailable.
 */
export async function scrapeLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  // Validate URL
  if (!profileUrl || !profileUrl.includes('linkedin.com/in/')) {
    return EMPTY_PROFILE(profileUrl);
  }

  try {
    // Dynamic import — playwright may not be installed in all environments
    const { chromium } = await import('playwright').catch(() => ({ chromium: null }));
    if (!chromium) {
      console.log('  ℹ️ Playwright not available — skipping LinkedIn scraping');
      return EMPTY_PROFILE(profileUrl);
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      locale: 'en-US',
      viewport: { width: 1280, height: 900 },
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const page = await context.newPage();

    try {
      // Navigate with timeout
      await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Check for auth wall / CAPTCHA
      const bodyText = await page.textContent('body') ?? '';
      if (
        bodyText.includes('Sign in') && bodyText.includes('Join now') ||
        bodyText.includes('authwall') ||
        bodyText.toLowerCase().includes('captcha')
      ) {
        console.log('  ⚠️ LinkedIn auth wall detected — returning empty profile');
        await browser.close();
        return EMPTY_PROFILE(profileUrl);
      }

      // Extract profile data
      const profile = await page.evaluate(() => {
        const getText = (sel: string, root: Element | Document = document): string =>
          (root.querySelector(sel) as HTMLElement)?.innerText?.trim() ?? '';

        const getAttr = (sel: string, attr: string, root: Element | Document = document): string =>
          (root.querySelector(sel) as HTMLElement)?.getAttribute(attr)?.trim() ?? '';

        // Name
        const fullName =
          getText('h1.top-card-layout__title') ||
          getText('h1.text-heading-xlarge') ||
          getText('h1');

        // Headline
        const headline =
          getText('.top-card-layout__headline') ||
          getText('.text-body-medium.break-words');

        // About
        const about =
          getText('.core-section-container__content .pv-about-section') ||
          getText('section.summary div.pv-shared-text-with-see-more span[aria-hidden="true"]') ||
          getText('.about-section .full-width.t-14.t-normal.t-black');

        // Photo
        const photoUrl =
          getAttr('img.top-card__profile-image', 'src') ||
          getAttr('.profile-photo-edit__preview', 'src') ||
          getAttr('img.pv-top-card-profile-picture__image', 'src');

        // Location
        const location = getText('.top-card__subline-item') || getText('.pv-text-details__left-panel .text-body-small');

        // Experiences (top 3)
        const expSections = Array.from(
          document.querySelectorAll(
            '.experience-section li, section[data-section="experience"] li, #experience ~ .pvs-list li'
          )
        ).slice(0, 3);
        const experiences = expSections.map(el => ({
          title: getText('.t-bold span[aria-hidden="true"]', el) || getText('.t-bold', el),
          company:
            getText('.t-normal span[aria-hidden="true"]', el) ||
            getText('.t-14.t-normal span[aria-hidden="true"]', el),
          duration: getText('.t-14.t-normal.t-black--light span[aria-hidden="true"]', el),
        })).filter(e => e.title || e.company);

        // Education
        const eduSections = Array.from(
          document.querySelectorAll('.education-section li, section[data-section="education"] li')
        ).slice(0, 2);
        const education = eduSections
          .map(el => getText('.t-bold span', el) || getText('.t-bold', el))
          .filter(Boolean);

        // Skills
        const skillEls = Array.from(
          document.querySelectorAll('.pv-skill-category-entity__name, .pvs-entity .t-bold span[aria-hidden="true"]')
        ).slice(0, 8);
        const skills = skillEls.map(el => (el as HTMLElement).innerText?.trim()).filter(Boolean);

        return { fullName, headline, about, photoUrl, location, experiences, education, skills };
      });

      await browser.close();

      return {
        ...profile,
        fullName: profile.fullName || undefined,
        headline: profile.headline || undefined,
        about: profile.about || undefined,
        photoUrl: profile.photoUrl || undefined,
        location: profile.location || undefined,
        profileUrl,
      };
    } catch (pageErr) {
      await browser.close();
      console.log(`  ⚠️ LinkedIn page error: ${pageErr} — returning empty profile`);
      return EMPTY_PROFILE(profileUrl);
    }
  } catch (err) {
    console.log(`  ⚠️ LinkedIn scraper error: ${err} — returning empty profile`);
    return EMPTY_PROFILE(profileUrl);
  }
}

/**
 * Build author enrichment text from LinkedIn profile for use in article prompts.
 * Returns empty string if no useful data.
 */
export function buildLinkedInEnrichment(profile: LinkedInProfile): string {
  if (!profile.fullName && !profile.headline && profile.experiences.length === 0) {
    return '';
  }

  const lines: string[] = [];

  if (profile.headline) lines.push(`Headline: ${profile.headline}`);
  if (profile.about) lines.push(`About: ${profile.about.slice(0, 300)}`);

  if (profile.experiences.length > 0) {
    lines.push('Experience:');
    profile.experiences.forEach(e => {
      lines.push(`  - ${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ''}`);
    });
  }

  if (profile.skills.length > 0) {
    lines.push(`Key skills: ${profile.skills.slice(0, 5).join(', ')}`);
  }

  return lines.join('\n');
}
