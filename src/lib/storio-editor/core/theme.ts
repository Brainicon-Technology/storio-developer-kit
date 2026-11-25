/**
 * Turn a theme section ({ primaryColor: "#7c3aed", headingFont: "Inter" }) into CSS variables
 * (--primary-color, --heading-font). Nested objects are joined with "-": { colors: { brand } }
 * becomes --colors-brand. Only strings and numbers are used, and values that could break out of
 * the declaration (";", "{", "}", "<", ">", "\" or a line break) are skipped, because editors type them.
 */
export function themeToCssVariables(theme: unknown, options: { prefix?: string } = {}): Record<string, string> {
  const prefix = options.prefix ?? '--';
  const out: Record<string, string> = {};
  const walk = (value: unknown, name: string[]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      if (!text || /[;{}<>\\\r\n]/.test(text)) return;
      const key = name.map(toKebab).filter(Boolean).join('-');
      if (/^[a-z0-9-]+$/.test(key)) out[prefix + key] = text;
      return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, inner] of Object.entries(value)) walk(inner, [...name, key]);
    }
  };
  walk(theme, []);
  return out;
}

/** CSS text for a theme section: `:root{--primary-color:#7c3aed;}`. Use `selector` for a scope other than :root. */
export function themeToCss(theme: unknown, options: { prefix?: string; selector?: string } = {}): string {
  const vars = themeToCssVariables(theme, options);
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join('');
  return body ? `${options.selector ?? ':root'}{${body}}` : '';
}

function toKebab(part: string): string {
  return part
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/** True when a form field holds a colour: a hex value, or a name ending in "color"/"colour". */
export function isColorField(fieldName: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim())) return true;
  return /colou?r$/i.test(fieldName) && (value === '' || /^#/.test(value.trim()));
}

/** True when a form field picks one of the site's fonts (`fonts` in defineCms). */
export function isFontField(fieldName: string, value: unknown, fonts: string[] | undefined): boolean {
  return !!fonts?.length && typeof value === 'string' && /font$/i.test(fieldName);
}
