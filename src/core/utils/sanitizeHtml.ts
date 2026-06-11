import DOMPurify from 'dompurify'

/**
 * Central HTML sanitizer for every `v-html` binding (S29 T1).
 *
 * All markdown in the app is rendered with `marked`, which passes raw HTML
 * through and does not block `javascript:` hrefs — so unsanitized output is
 * stored XSS. Untrusted sources include AI responses (Studio) and notes
 * synced from the cloud.
 *
 * Dependency reason (per convention): DOMPurify is the maintained, audited
 * sanitizer; hand-rolled HTML sanitizers are a known anti-pattern.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // marked output is plain markup; forbid anything executable or framing
    FORBID_TAGS: ['style', 'form', 'input', 'iframe', 'object', 'embed'],
    USE_PROFILES: { html: true },
  })
}
