import { sendEmail } from "./smtp";

const BASE_URL = "https://bloomcontent.site";

function wrap(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:Inter,-apple-system,sans-serif;color:#111827;line-height:1.6;margin:0;padding:0;background:#f9fafb}
.container{max-width:520px;margin:40px auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb}
.btn{display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280}
</style></head><body><div class="container">${content}</div></body></html>`;
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Your ContentBloom login link",
    text: `Click to log in (link valid 15 minutes):\n\n${url}\n\nIf you didn't request this, ignore this email.`,
    html: wrap(`
      <p>Click the button below to log in. This link is valid for 15 minutes.</p>
      <p style="margin:24px 0"><a href="${url}" class="btn">Log in to ContentBloom</a></p>
      <p style="font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</p>
      <div class="footer">ContentBloom &mdash; AI content for e-commerce</div>
    `),
  });
}

export async function sendOnboardingEmail(email: string, token: string, plan: string) {
  const url = `${BASE_URL}/onboard?token=${token}&plan=${plan}`;
  await sendEmail({
    to: email,
    subject: "Welcome to ContentBloom - complete your setup",
    text: `Great news - your ${plan} plan is ready.\n\nComplete your setup here:\n${url}\n\nLooking forward to working with you.`,
    html: wrap(`
      <p>Great news &mdash; your <strong>${plan}</strong> plan is ready.</p>
      <p>Click below to complete your setup and start receiving SEO content for your store.</p>
      <p style="margin:24px 0"><a href="${url}" class="btn">Complete setup</a></p>
      <p style="font-size:13px;color:#6b7280">This link is valid for 7 days.</p>
      <div class="footer">ContentBloom &mdash; AI content for e-commerce</div>
    `),
  });
}

export async function sendArticleReadyEmail(email: string, title: string, keyword: string, articleId: string) {
  const url = `${BASE_URL}/dashboard/articles/${articleId}`;
  await sendEmail({
    to: email,
    subject: `Your new article is ready - ${title}`,
    text: `Your article "${title}" targeting "${keyword}" is ready in your dashboard.\n\nView it here: ${url}`,
    html: wrap(`
      <p>Your article <strong>&ldquo;${title}&rdquo;</strong> targeting <em>${keyword}</em> is ready in your dashboard.</p>
      <p style="margin:24px 0"><a href="${url}" class="btn">View article</a></p>
      <div class="footer">ContentBloom &mdash; AI content for e-commerce</div>
    `),
  });
}

export async function sendWelcomeAfterPaymentEmail(email: string, plan: string) {
  await sendEmail({
    to: email,
    subject: `You're all set! ContentBloom ${plan} activated`,
    text: `Your ${plan} plan is now active.\n\nYour first article will be ready within 24 hours. Once it's in your dashboard, you can review it and give feedback.\n\nIf you ever need anything, just reply to this email.\n\nDashboard: ${BASE_URL}/dashboard`,
    html: wrap(`
      <p>Your <strong>${plan}</strong> plan is now active.</p>
      <p>Your first article will be ready within 24 hours. Once it appears in your dashboard, you can review it and provide feedback directly.</p>
      <p style="margin:24px 0"><a href="${BASE_URL}/dashboard" class="btn">Go to dashboard</a></p>
      <p style="font-size:13px;color:#6b7280">Need anything? Just reply to this email.</p>
      <div class="footer">ContentBloom &mdash; AI content for e-commerce</div>
    `),
  });
}
