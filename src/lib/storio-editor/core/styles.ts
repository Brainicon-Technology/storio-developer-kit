import type { CmsConfig, FieldStyle, StyleProps, StyleSheetData } from './types';

/**
 * Field styles: the look of one field (colour, size, spacing...) set in the studio's Style tab.
 * A page's styles are one record, { page, sectionKey: "_styles", content: StyleSheetData }, saved
 * through the normal storage adapter, so they reach the site with the page content.
 */
export const STYLES_KEY = '_styles';

/** Default widths at which the tablet and phone values take over. */
export const DEFAULT_BREAKPOINTS = { tablet: 1024, phone: 768 } as const;

/** Every style property the Style tab can set, mapped to its CSS name. */
const CSS_NAMES: Record<keyof StyleProps, string> = {
  color: 'color',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  textAlign: 'text-align',
  fontFamily: 'font-family',
  marginTop: 'margin-top',
  marginRight: 'margin-right',
  marginBottom: 'margin-bottom',
  marginLeft: 'margin-left',
  paddingTop: 'padding-top',
  paddingRight: 'padding-right',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  width: 'width',
  maxWidth: 'max-width',
  height: 'height',
  backgroundColor: 'background-color',
  borderRadius: 'border-radius',
  borderWidth: 'border-width',
  borderColor: 'border-color',
  objectFit: 'object-fit',
  objectPosition: 'object-position',
  aspectRatio: 'aspect-ratio',
  opacity: 'opacity',
};

export const STYLE_PROPERTIES = Object.keys(CSS_NAMES) as (keyof StyleProps)[];

/** Properties that only work on a box, so a wrapper <span> needs display: inline-block for them. */
const BOX_PROPERTIES: (keyof StyleProps)[] = [
  'width', 'maxWidth', 'height', 'aspectRatio', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom',
  'backgroundColor', 'borderRadius', 'borderWidth',
];

/** Image properties that must be set on the <img> itself when the field's element is a wrapper. */
const IMAGE_INNER: (keyof StyleProps)[] = ['objectFit', 'objectPosition'];

/** Characters that could end the declaration or the <style> element. Editors type these values. */
const UNSAFE = /[;{}<>\\\r\n]/;

/** Id of a field in the data-cms-style attribute and in its CSS selector. */
export function styleId(page: string, section: string, path: string): string {
  return `${page}:${section}:${path}`;
}

/**
 * Properties that take a length. A plain number typed there ("50") means pixels, because CSS
 * ignores a length without a unit. Line height, weight, opacity and aspect ratio stay unitless.
 */
const LENGTH_PROPERTIES = new Set<keyof StyleProps>([
  'fontSize', 'letterSpacing', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'width', 'maxWidth', 'height',
  'borderRadius', 'borderWidth',
]);

/** Keep only known properties with safe, non-empty string values. */
export function sanitizeStyleProps(props: unknown): StyleProps {
  const out: StyleProps = {};
  if (!props || typeof props !== 'object') return out;
  for (const [key, value] of Object.entries(props)) {
    if (!(key in CSS_NAMES)) continue;
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const text = String(value).trim();
    if (!text || UNSAFE.test(text)) continue;
    const isBareNumber = /^-?\d*\.?\d+$/.test(text) && Number(text) !== 0;
    out[key as keyof StyleProps] = isBareNumber && LENGTH_PROPERTIES.has(key as keyof StyleProps) ? `${text}px` : text;
  }
  return out;
}

/** True when the field has at least one usable value on any device. */
export function hasFieldStyle(style: FieldStyle | undefined | null): boolean {
  if (!style) return false;
  return (['desktop', 'tablet', 'phone'] as const).some((d) => Object.keys(sanitizeStyleProps(style[d])).length > 0);
}

/**
 * `boxed`: the element is inline (the <span> added around the field, or an inline element such as
 * <span> or <a>), so it needs a box for size, spacing, background and corners (inline-block), and a
 * full line for alignment (block).
 */
function declarations(props: StyleProps, boxed: boolean, skip: (keyof StyleProps)[] = []): string {
  let css = '';
  for (const key of STYLE_PROPERTIES) {
    const value = props[key];
    if (value === undefined || skip.includes(key)) continue;
    css += `${CSS_NAMES[key]}:${value};`;
    if (key === 'borderWidth') css += 'border-style:solid;';
  }
  if (boxed && props.textAlign !== undefined && !skip.includes('textAlign')) css += 'display:block;';
  else if (boxed && BOX_PROPERTIES.some((key) => props[key] !== undefined && !skip.includes(key))) css += 'display:inline-block;';
  return css;
}

/** Inline HTML elements: a style on one of them needs a box (see declarations). */
export const INLINE_TAGS = new Set([
  'span', 'a', 'strong', 'em', 'b', 'i', 'u', 's', 'small', 'label', 'abbr', 'cite', 'code', 'mark',
  'q', 'sub', 'sup', 'time',
]);

/** Fonts served by Fontshare instead of Google Fonts (their CSS API names). */
const FONTSHARE: Record<string, string> = {
  'Clash Display': 'clash-display',
  'Cabinet Grotesk': 'cabinet-grotesk',
  Satoshi: 'satoshi',
  'General Sans': 'general-sans',
};

/** The stylesheet that loads a font chosen in the Style tab, or null for a value it cannot load. */
export function fontStylesheetUrl(fontFamily: string): string | null {
  const name = fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
  if (!/^[A-Za-z0-9 ]{1,60}$/.test(name)) return null;
  if (FONTSHARE[name]) return `https://api.fontshare.com/v2/css?f[]=${FONTSHARE[name]}@300,400,500,600,700&display=swap`;
  return `https://fonts.googleapis.com/css2?family=${name.trim().replace(/ +/g, '+')}&display=swap`;
}

/** Every font a field style uses, on any device. */
export function fieldStyleFonts(style: FieldStyle | undefined | null): string[] {
  if (!style) return [];
  const fonts = (['desktop', 'tablet', 'phone'] as const)
    .map((d) => sanitizeStyleProps(style[d]).fontFamily)
    .filter((f): f is string => !!f);
  return Array.from(new Set(fonts));
}

/**
 * Rules for an image inside a wrapper: the wrapper takes size, corners, border and spacing and
 * clips the image (so rounded corners cut it); the <img> fills a sized wrapper and takes fit and
 * focus. Returns [wrapper declarations, img declarations].
 */
function imageWrapperDeclarations(props: StyleProps): [string, string] {
  let outer = declarations(props, true, IMAGE_INNER);
  // No gap under the image (inline-block boxes sit on the text baseline).
  if (outer.includes('display:inline-block;')) outer += 'vertical-align:top;';
  if (props.borderRadius !== undefined) outer += 'overflow:hidden;';
  // A ratio without a width: the box takes the full width, so the ratio has a side to work from.
  if (props.aspectRatio !== undefined && props.width === undefined && props.maxWidth === undefined) {
    outer = outer.replace('display:inline-block;', 'display:block;');
    outer += 'width:100%;';
  }
  if (props.aspectRatio !== undefined && props.height === undefined) outer += 'height:auto;';
  let inner = '';
  if (props.width !== undefined || props.maxWidth !== undefined || props.aspectRatio !== undefined) inner += 'width:100%;';
  if (props.height !== undefined || props.aspectRatio !== undefined) inner += 'height:100%;';
  for (const key of IMAGE_INNER) if (props[key] !== undefined) inner += `${CSS_NAMES[key]}:${props[key]};`;
  if (props.borderRadius !== undefined) inner += `border-radius:${props.borderRadius};`;
  return [outer, inner];
}

/**
 * CSS for one field: the desktop rules, then media blocks for tablet and phone. The attribute is
 * repeated in the selector (specificity 0,2,0) so the rules win over single utility classes.
 * `wrapper`: the element is the <span> CmsField added, which needs inline-block for box values.
 * `inline`: the field's own element is inline (<span>, <a>...), which needs the same.
 */
export function fieldStyleToCss(
  id: string,
  style: FieldStyle | undefined | null,
  options: { breakpoints?: { tablet?: number; phone?: number }; wrapper?: boolean; inline?: boolean } = {}
): string {
  if (!style) return '';
  const attr = `[data-cms-style="${id.replace(/["\\]/g, '\\$&')}"]`;
  const selector = attr + attr;
  const wrapper = options.wrapper ?? false;
  const boxed = wrapper || (options.inline ?? false);
  const tablet = options.breakpoints?.tablet ?? DEFAULT_BREAKPOINTS.tablet;
  const phone = options.breakpoints?.phone ?? DEFAULT_BREAKPOINTS.phone;
  const imageInWrapper = style.kind === 'image' && wrapper;
  const rules = (props: StyleProps): string => {
    if (style.kind === 'icon') {
      // An icon: its size is the font size, set as the <svg>'s width and height. In a wrapper, the
      // colour goes on the <svg> too (it may have a colour class of its own). On the <svg> itself,
      // padding and border grow the badge around the icon instead of shrinking the icon.
      let body = declarations(props, boxed, ['fontSize']);
      let inner = '';
      if (wrapper) {
        if (props.fontSize !== undefined) inner += `width:${props.fontSize};height:${props.fontSize};`;
        if (props.color !== undefined) inner += `color:${props.color};`;
        if (inner) inner = `${selector} svg{${inner}}`;
      } else {
        if (props.fontSize !== undefined) body += `width:${props.fontSize};height:${props.fontSize};`;
        const framed = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderWidth'] as const;
        if (framed.some((key) => props[key] !== undefined)) body += 'box-sizing:content-box;';
      }
      return (body ? `${selector}{${body}}` : '') + inner;
    }
    if (!imageInWrapper) {
      let body = declarations(props, boxed);
      // An aspect ratio needs one free side: without a height of its own, release the element's
      // height (a class such as h-[400px] would otherwise win over the ratio).
      if (props.aspectRatio !== undefined && props.height === undefined) body += 'height:auto;';
      return body ? `${selector}{${body}}` : '';
    }
    const [outer, inner] = imageWrapperDeclarations(props);
    return (outer ? `${selector}{${outer}}` : '') + (inner ? `${selector} img{${inner}}` : '');
  };
  let css = rules(sanitizeStyleProps(style.desktop));
  for (const [device, width] of [['tablet', tablet], ['phone', phone]] as const) {
    const body = rules(sanitizeStyleProps(style[device]));
    if (body) css += `@media (max-width:${width - 0.02}px){${body}}`;
  }
  return css;
}

/** Set (or with null, remove) one field's style, keeping every other field of the page. */
export function setFieldStyle(
  sheet: StyleSheetData | undefined | null,
  section: string,
  path: string,
  style: FieldStyle | null
): StyleSheetData {
  const next: StyleSheetData = {};
  for (const [key, fields] of Object.entries(sheet ?? {})) next[key] = { ...fields };
  if (style && hasFieldStyle(style)) {
    next[section] = { ...(next[section] ?? {}), [path]: style };
  } else if (next[section]) {
    delete next[section][path];
    if (Object.keys(next[section]).length === 0) delete next[section];
  }
  return next;
}

/** True when a URL path matches a page route; "[slug]" matches one segment. */
export function routeMatches(route: string, pathname: string): boolean {
  const clean = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  const pattern = clean(route)
    .split('/')
    .map((part) => (/^\[[^\]]+\]$/.test(part) ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}$`).test(clean(pathname));
}

/**
 * The page a field's styles belong to: the page given on the field or its section; otherwise the
 * only page with this section key (the global page included); otherwise the page whose route
 * matches `pathname`. Undefined when it cannot be told.
 */
export function resolveFieldPage(
  config: Pick<CmsConfig, 'pages'>,
  section: string,
  explicitPage?: string,
  pathname?: string
): string | undefined {
  if (explicitPage) return explicitPage;
  const owners = config.pages.filter((p) => p.sections.some((s) => s.key === section));
  if (owners.length === 1) return owners[0].key;
  if (owners.length === 0 || !pathname) return undefined;
  const matching = owners.filter((p) => !p.global && routeMatches(p.route, pathname));
  return matching.length === 1 ? matching[0].key : undefined;
}
