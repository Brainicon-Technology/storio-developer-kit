/**
 * Renders HTML written by the school in the dashboard's rich text editor (blog content,
 * leadership messages, job descriptions, custom pages...).
 *
 * The HTML comes from the school's own admins, but it is still cleaned first: scripts, styles,
 * embedded frames and forms, inline event handlers (onclick=...) and javascript: links are removed.
 * Never pass HTML to dangerouslySetInnerHTML without this component.
 */
export function RichText({ html, className }: { html: string | undefined | null; className?: string }) {
  if (!html) return null;
  return <div className={`rich-text ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: cleanHtml(html) }} />;
}

export function cleanHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form|template|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data:text\/html)[^"'\s>]*\2?/gi, '$1="#"');
}

/** Plain text of some HTML (for excerpts and meta descriptions). */
export function htmlToText(html: string | undefined | null): string {
  return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Plain text (with line breaks) as simple HTML, for fields <RichText> renders. HTML stays as is. */
export function textToHtml(text: string): string {
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
