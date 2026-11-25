import type { ComponentType } from 'react';

/** Any icon component that accepts a className (lucide-react icons fit). */
export type IconComponent = ComponentType<{ className?: string }>;

/** One editable block of a page, e.g. "hero" or "faq". */
export interface SectionDef {
  /** Key of this section inside the page's content object. */
  key: string;
  /** Human-readable label shown in the studio. */
  label: string;
  icon?: IconComponent;
  /**
   * Optional normaliser applied to the section data before it is loaded into the
   * form (for example to fill in fields older saved content does not have).
   */
  transform?: (data: unknown) => unknown;
}

/** A public page the CMS can edit. */
export interface PageDef {
  /** Stable key used for storage, e.g. "home". Letters, digits, "_" and "-" only. */
  key: string;
  /** Title shown in the studio. */
  title: string;
  /**
   * Public route rendered in the preview iframe, e.g. "/" or "/pricing". A page that shows one
   * record of a collection uses brackets, e.g. "/blog/[slug]", together with `collection`.
   */
  route: string;
  /**
   * For a page that shows one record of a collection (a [slug] or [id] route): the collection key
   * served by your CMS API (`collections` of createCmsRouteHandler, or COLLECTIONS in Django).
   * The studio then lists the records, and fields wrapped in
   * <CmsField collection item path> edit the record itself.
   */
  collection?: string;
  /**
   * Key of the page this one belongs to, e.g. "blog" for "blog-post". The studio lists this
   * page's records in a second menu next to the parent page instead of in the page menu.
   */
  parent?: string;
  /**
   * Site-wide content: header, footer, contact details, SEO defaults, theme. The sections of a
   * global page can be edited from every page in the studio and read on every page of the site
   * (`useSiteContent`). Its `route` is only the page shown while "Site settings" is open.
   * At most one page may be global.
   */
  global?: boolean;
  /**
   * Global page only. False keeps its sections out of every other page's section list, so they
   * are listed only under "Site settings". A click on the header or footer in any preview still
   * opens them. Default: true.
   */
  listOnEveryPage?: boolean;
  icon?: IconComponent;
  /** Editable sections, in the order they appear in the studio. */
  sections: SectionDef[];
  /**
   * Default content for the page, keyed by section key. Saved overrides replace a
   * section as a whole; anything never edited keeps these values.
   */
  defaults: Record<string, unknown>;
}

/** A saved override for one section. Storage only ever holds overrides. */
export interface SectionRecord {
  page: string;
  sectionKey: string;
  content: unknown;
  isPublished: boolean;
  updatedAt: string | null;
  updatedBy?: string | null;
}

export interface SaveRecordInput {
  page: string;
  sectionKey: string;
  content: unknown;
  isPublished: boolean;
  updatedBy?: string | null;
}

export interface ListOptions {
  /** Include unpublished (draft) records. Servers honour this only for authorised users. */
  includeDrafts?: boolean;
}

export interface MediaItem {
  url: string;
  name: string;
  size?: number;
}

/**
 * Storage contract. Implement this to keep content anywhere (REST API, database,
 * files, memory). The studio and the public-site hooks talk only to this interface.
 */
export interface CmsStorageAdapter {
  listRecords(page?: string, options?: ListOptions): Promise<SectionRecord[]>;
  getRecord(page: string, sectionKey: string, options?: ListOptions): Promise<SectionRecord | null>;
  saveRecord(input: SaveRecordInput): Promise<SectionRecord>;
  /** Remove an override, so the section falls back to its default ("Reset"). */
  deleteRecord(page: string, sectionKey: string): Promise<void>;
  /** Optional: enables the upload tab of the image picker. */
  uploadMedia?(files: File[]): Promise<MediaItem[]>;
  /** Optional: enables the media-library tab of the image picker. */
  listMedia?(): Promise<MediaItem[]>;
  /** Optional: the records of a collection, for pages with a [slug] or [id] route. */
  listItems?(collection: string): Promise<CollectionItemSummary[]>;
  /** Optional: the editable values of one record, or null when it does not exist. */
  getItem?(collection: string, id: string): Promise<Record<string, unknown> | null>;
  /** Optional: save changed values of one record. Returns the record's values after saving. */
  saveItem?(collection: string, id: string, values: Record<string, unknown>): Promise<Record<string, unknown>>;
}

/** One record of a collection, as listed in the studio's record menu. */
export interface CollectionItemSummary {
  /** Identifier used to load and save the record (a slug or a database id). */
  id: string;
  /** Name shown in the record menu, e.g. the post title. */
  label: string;
  /**
   * Values for the brackets of the page route, e.g. { slug: "school" } for "/blog/[slug]".
   * A bracket without a value here uses the id.
   */
  params?: Record<string, string>;
}

/** Cap on how many items an array field may hold, to protect a layout. */
export interface CollectionLimit {
  max: number;
  label: string;
}

/** A ready-made image offered in the image picker's gallery. */
export interface ImagePreset {
  url: string;
  title: string;
  category: string;
  tag?: string;
}

export interface ImagePresetCategory {
  id: string;
  label: string;
}

/** Value edited by a code widget: an HTML/CSS/JS triple. */
export interface CodeValue {
  html: string;
  css: string;
  js: string;
}

export interface CodeWidgetProps {
  value: CodeValue;
  onChange: (value: CodeValue) => void;
}

export interface CmsWidgets {
  /**
   * Editor used for objects shaped like `{ html, css, js }`. Without it those
   * fields are edited as plain text areas.
   */
  code?: ComponentType<CodeWidgetProps>;
}

/** The look of one field on one device, as CSS values ("#7c3aed", "2rem", "var(--color-brand)"). */
export interface StyleProps {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  fontFamily?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  width?: string;
  maxWidth?: string;
  height?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  objectFit?: string;
  /** Which part of an image stays visible when it is cropped, e.g. "center" or "top". */
  objectPosition?: string;
  /** Width-to-height ratio, e.g. "16 / 9". */
  aspectRatio?: string;
  opacity?: string;
}

/** One field's style. Desktop is the base; tablet and phone override it on narrower screens. */
export interface FieldStyle {
  /**
   * "image" when the field shows an image. Fit and focus then apply to the <img> itself, and
   * size, corners and border to its box, which clips the image.
   * "icon" when it shows an icon (an <svg> and no text): the font size sets the icon's size.
   */
  kind?: 'image' | 'icon';
  desktop?: StyleProps;
  tablet?: StyleProps;
  phone?: StyleProps;
}

/** A page's field styles (the "_styles" record): section key → field path → style. */
export type StyleSheetData = Record<string, Record<string, FieldStyle>>;

/** Presets and settings of the Style tab. Values can be CSS variables, e.g. "var(--color-brand-600)". */
export interface CmsStyleOptions {
  /** False hides the Style tab. Default: true. */
  enabled?: boolean;
  /** Colour presets by name, e.g. { Brand: 'var(--color-brand-600)' }. */
  colors?: Record<string, string>;
  /** Font size presets, e.g. { S: '1rem', M: '1.5rem', L: '2.5rem' }. */
  fontSizes?: Record<string, string>;
  /** Spacing presets for margin and padding, e.g. { None: '0', Small: '0.5rem' }. */
  spacing?: Record<string, string>;
  /** Corner radius presets, e.g. { None: '0', Round: '9999px' }. */
  radii?: Record<string, string>;
  /** Widths (px) below which the tablet and phone values apply. Default: 1024 and 768. */
  breakpoints?: { tablet?: number; phone?: number };
}

export interface CmsConfig {
  /** Pages the studio lists and the site can read. */
  pages: PageDef[];
  /** Where content is read from and saved to. */
  adapter: CmsStorageAdapter;
  /** Heading shown at the top of the studio. */
  title?: string;
  /**
   * Base URL of the public site when the studio runs on a different origin
   * (for example admin.example.com editing example.com). Defaults to the studio's origin.
   */
  publicSiteUrl?: string;
  /**
   * The URL the studio uses to show an image value as a thumbnail (default: the value itself).
   * For a site whose files are only reachable through a preview URL, such as a template served
   * through a gateway.
   */
  mediaUrl?: (src: string) => string;
  /** Extra origins allowed to exchange preview messages with the studio. */
  allowedOrigins?: string[];
  /**
   * The icons your site can draw, by the name stored in the content (for example the
   * registry your own <Icon name> component uses). When set, the icon picker offers exactly
   * these, so every icon an editor picks also renders on the site. `<CmsIcon>` draws from it.
   * Without it the picker offers a built-in list of popular lucide-react icons.
   */
  icons?: Record<string, IconComponent>;
  /**
   * Font names your site already loads (for example with next/font). A field whose name ends in
   * "font" (e.g. "headingFont") then offers exactly these in a list.
   */
  fonts?: string[];
  /**
   * The Style tab of a single field: presets offered next to the custom inputs, and breakpoints.
   * Styles are saved per page as the record "_styles", through the same storage adapter.
   */
  styles?: CmsStyleOptions;
  /**
   * Item limits for array fields. Keys are tried in this order:
   * "page.section.path", "page.path", "section.path", "page.section".
   */
  collectionLimits?: Record<string, CollectionLimit>;
  imagePresets?: ImagePreset[];
  imagePresetCategories?: ImagePresetCategory[];
  widgets?: CmsWidgets;
}

/** Metadata about a section that has a saved record (see listManagedSections). */
export interface SectionMetadata {
  page: string;
  sectionKey: string;
  hasCustomOverride: boolean;
  isPublished: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

/** One section's current content plus its override status. */
export interface SectionDetail<T = unknown> extends SectionMetadata {
  content: T;
}
