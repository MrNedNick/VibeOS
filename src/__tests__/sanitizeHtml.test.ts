// @vitest-environment jsdom
//
// DOMPurify is broken under happy-dom (sanitize keeps <script> and strips
// legitimate tags — verified 2026-06-11), so this one file runs under jsdom.
// jsdom is a devDependency used ONLY here; the rest of the suite stays on
// happy-dom. Pinned to jsdom@22: newer majors pull @asamuzakjp/css-color,
// whose CJS build require()s an ESM module and crashes on Node 20.
/**
 * S29 T1 — sanitizeHtml strips everything executable from markdown output
 * while keeping the markup the app's renderers legitimately produce
 * (hljs code blocks, wiki-links with data attributes, heading anchors).
 */
import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/core/utils/sanitizeHtml'

describe('sanitizeHtml — XSS vectors', () => {
  it('strips <script> tags', () => {
    const out = sanitizeHtml('<p>hi</p><script>alert(1)</script>')
    expect(out).toContain('<p>hi</p>')
    expect(out).not.toContain('script')
  })

  it('strips inline event handlers', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(out).not.toContain('onerror')
  })

  it('strips javascript: hrefs (marked does not block them)', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:')
    expect(out).toContain('click')
  })

  it('strips iframes and forms', () => {
    expect(sanitizeHtml('<iframe src="https://evil.example"></iframe>')).not.toContain('iframe')
    expect(sanitizeHtml('<form action="/x"><input name="a"></form>')).not.toContain('<form')
  })
})

describe('sanitizeHtml — legitimate renderer output survives', () => {
  it('keeps hljs code blocks with classes', () => {
    const html = '<pre><code class="hljs language-ts"><span class="hljs-keyword">const</span></code></pre>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('keeps wiki-links with data attributes (NotePreview)', () => {
    const html = '<a class="wiki-link" data-wiki="My Note">My Note</a>'
    const out = sanitizeHtml(html)
    expect(out).toContain('data-wiki="My Note"')
    expect(out).toContain('class="wiki-link"')
  })

  it('keeps heading anchors with ids (DocsView)', () => {
    const html = '<h2 id="setup"><a class="anchor-link" href="#setup">#</a>Setup</h2>'
    const out = sanitizeHtml(html)
    expect(out).toContain('id="setup"')
    expect(out).toContain('href="#setup"')
  })

  it('keeps normal links and emphasis', () => {
    const out = sanitizeHtml('<p><a href="https://example.com">x</a> <strong>b</strong></p>')
    expect(out).toContain('href="https://example.com"')
    expect(out).toContain('<strong>b</strong>')
  })
})
