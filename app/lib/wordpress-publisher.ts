/**
 * WordPress Publisher — BloomContent
 *
 * Publishes articles to WordPress sites using Application Passwords.
 * No OAuth, no plugins required. Native since WordPress 5.6.
 *
 * Setup instructions for users:
 *   WordPress Admin → Users → Your Profile → Application Passwords
 *   → Create new → name it "BloomContent" → copy the generated password
 */

export interface WordPressCredentials {
  siteUrl: string;          // e.g. https://mybusiness.com
  username: string;         // WordPress username
  applicationPassword: string; // Application password (spaces OK, they're stripped)
}

export interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  editUrl?: string;
  error?: string;
}

export interface WordPressConnectionResult {
  success: boolean;
  userId?: number;
  userName?: string;
  displayName?: string;
  siteTitle?: string;
  siteUrl?: string;
  error?: string;
}

// Normalize credentials: strip spaces from app password, normalize URL
function normalizeCredentials(creds: WordPressCredentials): WordPressCredentials {
  return {
    siteUrl: creds.siteUrl.replace(/\/$/, '').toLowerCase().startsWith('http')
      ? creds.siteUrl.replace(/\/$/, '')
      : `https://${creds.siteUrl.replace(/\/$/, '')}`,
    username: creds.username.trim(),
    applicationPassword: creds.applicationPassword.replace(/\s/g, ''),
  };
}

function buildAuthHeader(username: string, appPassword: string): string {
  return `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`;
}

/**
 * Verify WordPress connection using Application Password.
 * Calls GET /wp-json/wp/v2/users/me
 */
export async function verifyWordPressConnection(
  creds: WordPressCredentials
): Promise<WordPressConnectionResult> {
  const { siteUrl, username, applicationPassword } = normalizeCredentials(creds);

  try {
    // First check if WP REST API is accessible
    const apiCheckRes = await fetch(`${siteUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: buildAuthHeader(username, applicationPassword),
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!apiCheckRes.ok) {
      if (apiCheckRes.status === 401) {
        return { success: false, error: 'Invalid username or application password. Please check your credentials.' };
      }
      if (apiCheckRes.status === 403) {
        return { success: false, error: 'Access denied. Make sure Application Passwords are enabled on your WordPress site.' };
      }
      if (apiCheckRes.status === 404) {
        return { success: false, error: 'WordPress REST API not found. Make sure your site URL is correct and WordPress 5.6+ is installed.' };
      }
      const errorText = await apiCheckRes.text().catch(() => '');
      return { success: false, error: `Connection failed (${apiCheckRes.status}): ${errorText.slice(0, 200)}` };
    }

    const userData = await apiCheckRes.json();

    // Also try to get site info
    let siteTitle: string | undefined;
    try {
      const siteRes = await fetch(`${siteUrl}/wp-json`, {
        signal: AbortSignal.timeout(5000),
      });
      if (siteRes.ok) {
        const siteData = await siteRes.json();
        siteTitle = siteData.name;
      }
    } catch {
      // Non-critical
    }

    return {
      success: true,
      userId: userData.id,
      userName: userData.slug,
      displayName: userData.name,
      siteTitle,
      siteUrl,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ENOTFOUND') || msg.includes('fetch failed')) {
      return { success: false, error: `Could not reach ${siteUrl}. Check that your site URL is correct and publicly accessible.` };
    }
    return { success: false, error: `Connection error: ${msg}` };
  }
}

/**
 * Upload an image URL to WordPress Media Library.
 * Returns the WordPress media ID for use as featured image.
 */
export async function uploadImageToWordPress(
  imageUrl: string,
  credentials: WordPressCredentials
): Promise<{ success: boolean; mediaId?: number; mediaUrl?: string; error?: string }> {
  const { siteUrl, username, applicationPassword } = normalizeCredentials(credentials);

  try {
    // Download the image
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!imgRes.ok) return { success: false, error: `Could not download image from ${imageUrl}` };

    const imageBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';

    // Upload to WP media library
    const uploadRes = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: buildAuthHeader(username, applicationPassword),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
      body: imageBuffer,
      signal: AbortSignal.timeout(30000),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text().catch(() => '');
      return { success: false, error: `Image upload failed (${uploadRes.status}): ${err.slice(0, 200)}` };
    }

    const mediaData = await uploadRes.json();
    return {
      success: true,
      mediaId: mediaData.id,
      mediaUrl: mediaData.source_url,
    };
  } catch (err) {
    return { success: false, error: `Image upload error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export interface WordPressArticle {
  title: string;
  contentHtml: string;
  metaDescription?: string;
  tags?: string[];
  categories?: string[];
  featuredImageUrl?: string;
  status?: 'draft' | 'publish';
  authorName?: string;
}

/**
 * Publish an article to WordPress via REST API.
 */
export async function publishToWordPress(
  article: WordPressArticle,
  credentials: WordPressCredentials
): Promise<WordPressPublishResult> {
  const { siteUrl, username, applicationPassword } = normalizeCredentials(credentials);
  const authHeader = buildAuthHeader(username, applicationPassword);

  try {
    // Optional: upload featured image first
    let featuredMediaId: number | undefined;
    if (article.featuredImageUrl) {
      const uploadResult = await uploadImageToWordPress(article.featuredImageUrl, credentials);
      if (uploadResult.success && uploadResult.mediaId) {
        featuredMediaId = uploadResult.mediaId;
      }
      // Non-critical — continue even if image upload fails
    }

    // Build post payload
    const postPayload: Record<string, unknown> = {
      title: article.title,
      content: article.contentHtml,
      status: article.status ?? 'draft',
      excerpt: article.metaDescription ?? '',
    };

    if (featuredMediaId) {
      postPayload.featured_media = featuredMediaId;
    }

    // Handle tags
    if (article.tags && article.tags.length > 0) {
      try {
        // Create or get tag IDs
        const tagIds: number[] = [];
        for (const tagName of article.tags.slice(0, 5)) {
          const tagRes = await fetch(`${siteUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}&per_page=1`, {
            headers: { Authorization: authHeader },
            signal: AbortSignal.timeout(5000),
          });
          if (tagRes.ok) {
            const tags = await tagRes.json();
            if (tags.length > 0) {
              tagIds.push(tags[0].id);
            } else {
              // Create new tag
              const createRes = await fetch(`${siteUrl}/wp-json/wp/v2/tags`, {
                method: 'POST',
                headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tagName }),
                signal: AbortSignal.timeout(5000),
              });
              if (createRes.ok) {
                const newTag = await createRes.json();
                tagIds.push(newTag.id);
              }
            }
          }
        }
        if (tagIds.length > 0) postPayload.tags = tagIds;
      } catch {
        // Tags are non-critical
      }
    }

    // Create the post
    const createRes = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
      signal: AbortSignal.timeout(30000),
    });

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Post creation failed (${createRes.status})`,
      };
    }

    const postData = await createRes.json();

    return {
      success: true,
      postId: postData.id,
      postUrl: postData.link,
      editUrl: `${siteUrl}/wp-admin/post.php?post=${postData.id}&action=edit`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Publish error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
