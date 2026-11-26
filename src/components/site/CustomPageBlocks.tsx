import type { ReactNode } from 'react';
import Link from 'next/link';
import type {
  StorioCustomPageSection,
  StorioPageFeatureItem,
  StorioPageImageContent,
  StorioPageListItem,
  StorioPageSplitSlot,
  StorioPageTableContent,
} from '@storio/template-sdk';

import { MaterialIcon } from './MaterialIcon';
import { RichText } from './RichText';

/**
 * A custom page built with the dashboard's page builder (getPageBySlug -> StorioCustomPage, whose
 * `content` is StorioCustomPageSection[]). Each block has a `type` and its own `content` shape:
 *
 *   Hero         { url, overlayText }          RichText     HTML string
 *   Image        { images[] | url, caption }   FeatureGrid  StorioPageFeatureItem[]
 *   CustomList   StorioPageListItem[]          CustomTable  { headers, rows }
 *   SideList     { description, list }         Split        { left, right } slots of the types above
 *   Form         { formCode, form_data }       (a Dynamic Form Builder form: rendered at /forms/<code>)
 *
 * Everything here is school data, so it has no editor pencils. `switch (block.type)` narrows the
 * union, so each case reads its own typed `content`. Unknown block types are skipped.
 */
export function CustomPageBlocks({ blocks, formLinkText }: { blocks: StorioCustomPageSection[]; formLinkText: ReactNode }) {
  return (
    <div className="space-y-12">
      {blocks.map((block) => (
        <section key={block.id} className="space-y-4">
          {block.title && block.type !== 'Hero' && <h2 className="text-2xl font-bold">{block.title}</h2>}
          <Block block={block} formLinkText={formLinkText} />
        </section>
      ))}
    </div>
  );
}

function Block({ block, formLinkText }: { block: StorioCustomPageSection; formLinkText: ReactNode }) {
  switch (block.type) {
    case 'Hero':
      return (
        <div className="relative overflow-hidden rounded-2xl bg-ink text-white">
          {block.content.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.content.url} alt="" className="h-72 w-full object-cover opacity-70" />
          )}
          {block.content.overlayText && (
            <p className="absolute inset-x-0 bottom-0 p-8 text-3xl font-extrabold">{block.content.overlayText}</p>
          )}
        </div>
      );
    case 'RichText':
      return <RichText html={block.content} className="text-lg leading-relaxed" />;
    case 'Image':
      return <Images content={block.content} />;
    case 'FeatureGrid':
      return <Features items={block.content} />;
    case 'CustomList':
      return <List items={block.content} />;
    case 'CustomTable':
      return <Table content={block.content} />;
    case 'SideList':
      return (
        <div className={`grid gap-8 md:grid-cols-[2fr_1fr] ${block.content.listPosition === 'left' ? 'md:[&>*:first-child]:order-2' : ''}`}>
          <RichText html={block.content.description} className="leading-relaxed" />
          <List items={block.content.list} />
        </div>
      );
    case 'Split':
      return (
        <div className="grid gap-8 md:grid-cols-2">
          <Slot slot={block.content.left} formLinkText={formLinkText} />
          <Slot slot={block.content.right} formLinkText={formLinkText} />
        </div>
      );
    case 'Form':
      return <FormLink code={block.content.formCode} title={block.content.form_data?.title} text={formLinkText} />;
    default:
      return null;
  }
}

/** One side of a Split block. Its `content` type depends on `type`, checked at runtime. */
function Slot({ slot, formLinkText }: { slot: StorioPageSplitSlot; formLinkText: ReactNode }) {
  const c = slot.content;
  switch (slot.type) {
    case 'RichText':
      return typeof c === 'string' ? <RichText html={c} className="leading-relaxed" /> : null;
    case 'Image':
      return c && typeof c === 'object' && !Array.isArray(c) && !('headers' in c) && !('formCode' in c) ? <Images content={c} /> : null;
    case 'FeatureGrid':
      return Array.isArray(c) ? <Features items={c.filter((i): i is StorioPageFeatureItem => 'description' in i)} /> : null;
    case 'CustomList':
      return Array.isArray(c) ? <List items={c.filter((i): i is StorioPageListItem => 'link' in i)} /> : null;
    case 'CustomTable':
      return c && typeof c === 'object' && 'headers' in c ? <Table content={c} /> : null;
    case 'Form':
      return c && typeof c === 'object' && 'formCode' in c ? <FormLink code={c.formCode} title={c.form_data?.title} text={formLinkText} /> : null;
    default:
      return null;
  }
}

function Images({ content }: { content: StorioPageImageContent }) {
  const images = content.images?.length ? content.images : content.url ? [{ url: content.url, caption: content.caption, altText: content.altText }] : [];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((image, i) => (
        <figure key={`${image.url}-${i}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.altText ?? ''} className="w-full rounded-2xl object-cover" />
          {image.caption && <figcaption className="mt-2 text-sm opacity-70">{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function Features({ items }: { items: StorioPageFeatureItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="rounded-2xl border border-black/10 bg-surface p-5">
          {item.icon && <MaterialIcon name={item.icon} className="mb-2 h-6 w-6 text-brand" />}
          <p className="font-semibold">{item.title}</p>
          {item.description && <p className="mt-1 text-sm opacity-80">{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}

function List({ items }: { items: StorioPageListItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={item.id ?? `${item.title}-${i}`}>
          {item.link && item.link !== '#' ? (
            <a href={item.link} className="font-semibold text-brand hover:underline">{item.title}</a>
          ) : (
            <span className="font-semibold">{item.title}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Table({ content }: { content: StorioPageTableContent }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface">
          <tr>{content.headers.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {content.rows.map((row, r) => (
            <tr key={r} className="border-t border-black/10">
              {row.map((cell, c) => <td key={c} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormLink({ code, title, text }: { code: string; title?: string; text: ReactNode }) {
  return (
    <Link href={`/forms/${encodeURIComponent(code)}`} className="inline-flex flex-col rounded-2xl border border-brand/30 bg-brand/5 p-5 hover:border-brand">
      {title && <span className="font-semibold">{title}</span>}
      <span className="text-sm font-semibold text-brand">{text}</span>
    </Link>
  );
}
